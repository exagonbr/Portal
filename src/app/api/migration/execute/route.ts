import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import { Pool } from 'pg'

interface MySQLConnection {
  host: string
  port: number
  user: string
  password: string
  database: string
}

interface TableMapping {
  mysqlTable: string
  postgresTable: string
}

interface MigrationOptions {
  recreateTables: boolean
  preserveData: boolean
}

interface MigrationRequest {
  mysqlConnection: MySQLConnection
  selectedTables: TableMapping[]
  options: MigrationOptions
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let mysqlConnection: mysql.Connection | null = null
  let pgPool: Pool | null = null
  
  try {
    const { mysqlConnection: mysqlConfig, selectedTables, options }: MigrationRequest = await request.json()
    
    // Validação dos parâmetros
    if (!mysqlConfig || !selectedTables || selectedTables.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Configuração MySQL e tabelas selecionadas são obrigatórias'
      }, { status: 400 })
    }

    // Criar conexão MySQL
    mysqlConnection = await mysql.createConnection({
      host: mysqlConfig.host,
      port: mysqlConfig.port,
      user: mysqlConfig.user,
      password: mysqlConfig.password,
      database: mysqlConfig.database,
      charset: 'utf8mb4'
    })

    // Criar pool PostgreSQL
    pgPool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      database: process.env.POSTGRES_DB || 'portal',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })

    const results = {
      tablesProcessed: 0,
      totalRows: 0,
      errors: [] as string[],
      warnings: [] as string[],
      details: [] as any[]
    }

    // Processar cada tabela
    for (const tableMapping of selectedTables) {
      try {
        const tableResult = await processTable(
          mysqlConnection,
          pgPool,
          tableMapping,
          options
        )
        
        results.tablesProcessed++
        results.totalRows += tableResult.rowsProcessed
        results.details.push(tableResult)
        
        if (tableResult.warnings.length > 0) {
          results.warnings.push(...tableResult.warnings)
        }
        
      } catch (error: any) {
        const errorMsg = `Erro na tabela ${tableMapping.mysqlTable}: ${error.message}`
        results.errors.push(errorMsg)
        console.error(errorMsg, error)
      }
    }

    // Fechar conexões
    await mysqlConnection.end()
    await pgPool.end()

    const duration = Date.now() - startTime

    return NextResponse.json({
      success: results.errors.length === 0,
      ...results,
      duration,
      summary: {
        tablesRequested: selectedTables.length,
        tablesProcessed: results.tablesProcessed,
        totalRows: results.totalRows,
        hasErrors: results.errors.length > 0,
        hasWarnings: results.warnings.length > 0
      }
    })

  } catch (error: any) {
    console.error('Erro durante migração:', error)
    
    // Fechar conexões em caso de erro
    if (mysqlConnection) {
      try { await mysqlConnection.end() } catch {}
    }
    if (pgPool) {
      try { await pgPool.end() } catch {}
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno durante migração',
      duration: Date.now() - startTime
    }, { status: 500 })
  }
}

async function processTable(
  mysqlConnection: mysql.Connection,
  pgPool: Pool,
  tableMapping: TableMapping,
  options: MigrationOptions
) {
  const { mysqlTable, postgresTable } = tableMapping
  const result = {
    mysqlTable,
    postgresTable,
    rowsProcessed: 0,
    warnings: [] as string[],
    created: false,
    dropped: false
  }

  // 1. Obter estrutura da tabela MySQL
  const [columnsResult] = await mysqlConnection.execute(
    `DESCRIBE \`${mysqlTable}\``
  ) as any[]

  // 2. Verificar se tabela PostgreSQL existe
  const pgClient = await pgPool.connect()
  
  try {
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `
    const tableExistsResult = await pgClient.query(tableExistsQuery, [postgresTable])
    const tableExists = tableExistsResult.rows[0].exists

    // 3. Recriar tabela se solicitado (DROP CASCADE)
    if (options.recreateTables && tableExists) {
      await pgClient.query(`DROP TABLE IF EXISTS "${postgresTable}" CASCADE;`)
      result.dropped = true
      result.warnings.push(`Tabela ${postgresTable} removida com CASCADE`)
    }

    // 4. Criar tabela PostgreSQL se não existir ou foi removida
    if (!tableExists || options.recreateTables) {
      const createTableSQL = generateCreateTableSQL(postgresTable, columnsResult)
      await pgClient.query(createTableSQL)
      result.created = true
    }

    // 5. Limpar dados existentes se não preservar
    if (!options.preserveData && !options.recreateTables) {
      await pgClient.query(`TRUNCATE TABLE "${postgresTable}" RESTART IDENTITY CASCADE;`)
      result.warnings.push(`Dados existentes removidos de ${postgresTable}`)
    }

    // 6. Migrar dados
    const [dataResult] = await mysqlConnection.execute(`SELECT * FROM \`${mysqlTable}\``) as any[]
    
    if (Array.isArray(dataResult) && dataResult.length > 0) {
      const batchSize = 1000
      let processed = 0
      
      for (let i = 0; i < dataResult.length; i += batchSize) {
        const batch = dataResult.slice(i, i + batchSize)
        const insertedCount = await insertBatch(pgClient, postgresTable, columnsResult, batch, options.preserveData)
        processed += insertedCount
      }
      
      result.rowsProcessed = processed
    }

    // 7. Criar índices básicos
    await createBasicIndexes(pgClient, postgresTable, columnsResult)

  } finally {
    pgClient.release()
  }

  return result
}

function generateCreateTableSQL(tableName: string, columns: any[]): string {
  const columnDefinitions = columns.map(col => {
    const postgresType = mapMySQLTypeToPostgreSQL(col.Type)
    const nullable = col.Null === 'YES' ? '' : ' NOT NULL'
    const defaultValue = getDefaultValue(col.Default, postgresType)
    const autoIncrement = col.Extra.includes('auto_increment') ? 
      (postgresType.includes('bigint') ? ' GENERATED ALWAYS AS IDENTITY' : ' GENERATED ALWAYS AS IDENTITY') : ''
    
    return `"${col.Field.toLowerCase()}" ${postgresType}${autoIncrement}${nullable}${defaultValue}`
  }).join(',\n  ')

  // Encontrar chave primária
  const primaryKeys = columns.filter(col => col.Key === 'PRI').map(col => `"${col.Field.toLowerCase()}"`)
  const primaryKeyConstraint = primaryKeys.length > 0 ? `,\n  PRIMARY KEY (${primaryKeys.join(', ')})` : ''

  return `
    CREATE TABLE IF NOT EXISTS "${tableName}" (
      ${columnDefinitions}${primaryKeyConstraint}
    );
  `
}

function mapMySQLTypeToPostgreSQL(mysqlType: string): string {
  const type = mysqlType.toLowerCase()
  
  if (type.includes('bit(1)')) return 'boolean'
  if (type.includes('tinyint(1)')) return 'boolean'
  if (type.includes('tinyint')) return 'smallint'
  if (type.includes('smallint')) return 'smallint'
  if (type.includes('mediumint')) return 'integer'
  if (type.includes('bigint')) return 'bigint'
  if (type.includes('int')) return 'integer'
  if (type.includes('varchar')) {
    const match = type.match(/varchar\((\d+)\)/)
    return match ? `varchar(${match[1]})` : 'varchar(255)'
  }
  if (type.includes('char')) {
    const match = type.match(/char\((\d+)\)/)
    return match ? `char(${match[1]})` : 'char(1)'
  }
  if (type.includes('text')) return 'text'
  if (type.includes('longtext')) return 'text'
  if (type.includes('mediumtext')) return 'text'
  if (type.includes('datetime')) return 'timestamp'
  if (type.includes('timestamp')) return 'timestamp'
  if (type.includes('date')) return 'date'
  if (type.includes('time')) return 'time'
  if (type.includes('decimal') || type.includes('numeric')) {
    const match = type.match(/decimal\((\d+),(\d+)\)/)
    return match ? `decimal(${match[1]},${match[2]})` : 'decimal'
  }
  if (type.includes('float')) return 'real'
  if (type.includes('double')) return 'double precision'
  if (type.includes('json')) return 'jsonb'
  if (type.includes('blob')) return 'bytea'
  if (type.includes('binary')) return 'bytea'
  
  return 'text' // Fallback
}

function getDefaultValue(defaultVal: any, postgresType: string): string {
  if (defaultVal === null || defaultVal === undefined) return ''
  
  if (defaultVal === 'CURRENT_TIMESTAMP' || defaultVal === 'current_timestamp()') {
    return ' DEFAULT CURRENT_TIMESTAMP'
  }
  
  if (postgresType === 'boolean') {
    if (defaultVal === '1' || defaultVal === 1 || defaultVal === true) return ' DEFAULT true'
    if (defaultVal === '0' || defaultVal === 0 || defaultVal === false) return ' DEFAULT false'
  }
  
  if (typeof defaultVal === 'string') {
    return ` DEFAULT '${defaultVal.replace(/'/g, "''")}'`
  }
  
  return ` DEFAULT ${defaultVal}`
}

async function insertBatch(
  pgClient: any,
  tableName: string,
  columns: any[],
  batch: any[],
  preserveData: boolean
): Promise<number> {
  if (batch.length === 0) return 0

  const columnNames = columns.map(col => `"${col.Field.toLowerCase()}"`).join(', ')
  const placeholders = batch.map((_, rowIndex) => 
    `(${columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ')})`
  ).join(', ')

  const values = batch.flatMap(row => 
    columns.map(col => transformMySQLValueToPostgres(row[col.Field], col.Type))
  )

  const conflictClause = preserveData ? ' ON CONFLICT DO NOTHING' : ''
  const insertSQL = `
    INSERT INTO "${tableName}" (${columnNames}) 
    VALUES ${placeholders}${conflictClause}
  `

  try {
    const result = await pgClient.query(insertSQL, values)
    return result.rowCount || 0
  } catch (error: any) {
    console.error(`Erro no lote da tabela ${tableName}:`, error.message)
    
    // Tentar inserir registros individualmente em caso de erro
    let inserted = 0
    for (const row of batch) {
      try {
        const singleValues = columns.map(col => transformMySQLValueToPostgres(row[col.Field], col.Type))
        const singleSQL = `
          INSERT INTO "${tableName}" (${columnNames}) 
          VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')})${conflictClause}
        `
        const result = await pgClient.query(singleSQL, singleValues)
        inserted += result.rowCount || 0
      } catch (singleError) {
        // Ignorar erros individuais se preserveData estiver ativo
        if (!preserveData) {
          console.error(`Erro ao inserir registro individual:`, singleError)
        }
      }
    }
    return inserted
  }
}

function transformMySQLValueToPostgres(value: any, mysqlType: string): any {
  if (value === null || value === undefined) return null
  
  const type = mysqlType.toLowerCase()
  
  // Converter bit(1) para boolean
  if (type.includes('bit(1)')) {
    if (Buffer.isBuffer(value)) {
      return value[0] === 1
    }
    return Boolean(value)
  }
  
  // Converter tinyint(1) para boolean
  if (type.includes('tinyint(1)')) {
    return Boolean(value)
  }
  
  // Converter datas
  if (type.includes('datetime') || type.includes('timestamp')) {
    if (value instanceof Date) return value.toISOString()
    if (typeof value === 'string') return value
  }
  
  // Converter JSON
  if (type.includes('json') && typeof value === 'object') {
    return JSON.stringify(value)
  }
  
  return value
}

async function createBasicIndexes(pgClient: any, tableName: string, columns: any[]) {
  const indexPromises = []
  
  // Criar índices para colunas comuns
  const commonIndexColumns = ['email', 'user_id', 'created_at', 'updated_at', 'status']
  
  for (const col of columns) {
    const columnName = col.Field.toLowerCase()
    
    // Índice único para chave primária (já criado automaticamente)
    if (col.Key === 'PRI') continue
    
    // Índice único para colunas únicas
    if (col.Key === 'UNI') {
      indexPromises.push(
        pgClient.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS "idx_${tableName}_${columnName}_unique" 
          ON "${tableName}" ("${columnName}")
        `).catch(() => {}) // Ignorar erros se índice já existir
      )
    }
    
    // Índices para colunas comuns
    if (commonIndexColumns.some(common => columnName.includes(common))) {
      indexPromises.push(
        pgClient.query(`
          CREATE INDEX IF NOT EXISTS "idx_${tableName}_${columnName}" 
          ON "${tableName}" ("${columnName}")
        `).catch(() => {}) // Ignorar erros se índice já existir
      )
    }
  }
  
  await Promise.all(indexPromises)
} 