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

interface RoleMapping {
  mysqlRole: string
  postgresRole: string
  fallbackRole?: string
}

interface ColumnMapping {
  mysqlColumn: string
  postgresColumn: string
  mysqlType: string
  postgresType: string
  required: boolean
  defaultValue?: any
}

interface TableStructureMapping {
  mysqlTable: string
  postgresTable: string
  columns: ColumnMapping[]
  customSQL?: string
  recreateStructure: boolean
}

interface MigrationRequest {
  mysqlConnection: MySQLConnection
  selectedTables: TableMapping[]
  options: MigrationOptions
  roleMappings?: RoleMapping[]
  structureMappings?: TableStructureMapping[]
}


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let mysqlConnection: mysql.Connection | null = null
  let pgPool: Pool | null = null
  
  try {
    const { 
      mysqlConnection: mysqlConfig, 
      selectedTables, 
      options, 
      roleMappings = [],
      structureMappings = []
    }: MigrationRequest = await request.json()
    
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
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: String(process.env.DB_PASSWORD || 'root'), // Garantir que seja string para evitar erro SASL
      database: process.env.DB_NAME || 'portal_sabercon',
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

    // Validar integridade antes da migração
    const integritResult = await validateMigrationIntegrity(pgPool, selectedTables, roleMappings)
    if (!integritResult.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Falha na validação de integridade',
        details: integritResult.errors
      }, { status: 400 })
    }

    // Processar cada tabela
    for (const tableMapping of selectedTables) {
      try {
        // Buscar mapeamento de estrutura personalizado
        const structureMapping = structureMappings.find(sm => 
          sm.mysqlTable === tableMapping.mysqlTable
        )
        
        const tableResult = await processTable(
          mysqlConnection,
          pgPool,
          tableMapping,
          options,
          roleMappings,
          structureMapping
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
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
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
      duration: Date.now(, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    }) - startTime
    }, { status: 500 })
  }
}

async function processTable(
  mysqlConnection: mysql.Connection,
  pgPool: Pool,
  tableMapping: TableMapping,
  options: MigrationOptions,
  roleMappings: RoleMapping[] = [],
  structureMapping?: TableStructureMapping
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
      let createTableSQL
      
      if (structureMapping && structureMapping.recreateStructure) {
        // Usar estrutura customizada
        createTableSQL = generateCustomTableSQL(postgresTable, structureMapping)
        result.warnings.push(`Tabela ${postgresTable} criada com estrutura customizada`)
      } else {
        // Usar estrutura automática baseada no MySQL
        createTableSQL = generateCreateTableSQL(postgresTable, columnsResult, structureMapping)
      }
      
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
  
  // DEBUG: Verificar primeiros registros para entender formato dos dados
  if (dataResult.length > 0) {
    console.log(`🔍 DEBUG TABELA ${mysqlTable}:`)
    const firstRow = dataResult[0]
    Object.keys(firstRow).forEach(key => {
      const value = firstRow[key]
      const column = columnsResult.find((col: any) => col.Field === key)
      if (column && column.Type.toLowerCase().includes('bit')) {
        console.log(`  Campo ${key}: valor=${JSON.stringify(value)}, tipo=${typeof value}, tipoColuna=${column.Type}`)
      }
    })
  }

  // INTERCEPTAÇÃO PREVENTIVA: Verificar se há strings b'1' ou b'0' nos dados
  console.log(`🔍 VERIFICAÇÃO PREVENTIVA para ${mysqlTable}:`)
  if (dataResult.length > 0) {
    const sampleRow = dataResult[0]
    Object.keys(sampleRow).forEach(key => {
      const value = sampleRow[key]
      if (typeof value === 'string' && (value.includes("b'1'") || value.includes("b'0'"))) {
        console.log(`⚠️  DETECTADO STRING BINÁRIA: ${key}="${value}"`)
      }
    })
  }
    
    if (Array.isArray(dataResult) && dataResult.length > 0) {
      const batchSize = 1000
      let processed = 0
      
      for (let i = 0; i < dataResult.length; i += batchSize) {
        const batch = dataResult.slice(i, i + batchSize)
        const insertedCount = await insertBatch(
          pgClient, 
          postgresTable, 
          columnsResult, 
          batch, 
          options.preserveData,
          roleMappings,
          structureMapping
        )
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

// ========================================
// NOVAS FUNÇÕES DE VALIDAÇÃO E MAPEAMENTO
// ========================================

async function validateMigrationIntegrity(
  pgPool: Pool, 
  selectedTables: TableMapping[], 
  roleMappings: RoleMapping[]
): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = []
  const warnings: string[] = []
  const pgClient = await pgPool.connect()

  try {
    // 1. Verificar se roles necessários existem
    const requiredRoles = roleMappings.map(rm => rm.postgresRole)
    if (requiredRoles.length > 0) {
      const roleExistsQuery = `
        SELECT name FROM roles WHERE name = ANY($1::text[])
      `
      const existingRoles = await pgClient.query(roleExistsQuery, [requiredRoles])
      const existingRoleNames = existingRoles.rows.map(r => r.name)
      
      const missingRoles = requiredRoles.filter(role => !existingRoleNames.includes(role))
      if (missingRoles.length > 0) {
        errors.push(`Roles não encontrados no PostgreSQL: ${missingRoles.join(', ')}`)
      }
    }

    // 2. Verificar se tabelas de destino têm estrutura adequada
    for (const table of selectedTables) {
      const tableExistsQuery = `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
      `
      const columns = await pgClient.query(tableExistsQuery, [table.postgresTable])
      
      if (columns.rows.length === 0) {
        warnings.push(`Tabela ${table.postgresTable} não existe, será criada`)
      }
    }

    // 3. Verificar se há conflitos de constraints
    const constraintQuery = `
      SELECT table_name, constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = ANY($1::text[]) AND table_schema = 'public'
    `
    const tableNames = selectedTables.map(t => t.postgresTable)
    const constraints = await pgClient.query(constraintQuery, [tableNames])
    
    if (constraints.rows.length > 0) {
      warnings.push(`Encontradas ${constraints.rows.length} constraints nas tabelas de destino`)
    }

  } catch (error: any) {
    errors.push(`Erro na validação de integridade: ${error.message}`)
  } finally {
    pgClient.release()
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

function mapMySQLRoleToPostgreSQL(
  mysqlRoleValue: any, 
  roleMappings: RoleMapping[]
): string {
  if (!mysqlRoleValue) return 'STUDENT' // Fallback padrão

  // Converter valor para string
  const roleStr = String(mysqlRoleValue).toUpperCase().trim()
  
  // 1. Tentar mapeamento direto customizado
  const customMapping = roleMappings.find(rm => 
    rm.mysqlRole.toUpperCase() === roleStr
  )
  if (customMapping) {
    console.log(`🔄 ROLE MAPPING CUSTOMIZADO: ${roleStr} → ${customMapping.postgresRole}`)
    return customMapping.postgresRole
  }

  // 2. Mapeamento automático baseado em padrões comuns
  const autoMappings: Record<string, string> = {
    // Roles administrativos
    'ADMIN': 'SYSTEM_ADMIN',
    'ADMINISTRATOR': 'SYSTEM_ADMIN',
    'SYSTEM_ADMIN': 'SYSTEM_ADMIN',
    'ROOT': 'SYSTEM_ADMIN',
    
    // Roles de gestão
    'MANAGER': 'INSTITUTION_MANAGER',
    'INSTITUTION_MANAGER': 'INSTITUTION_MANAGER',
    'GESTOR': 'INSTITUTION_MANAGER',
    'DIRETOR': 'INSTITUTION_MANAGER',
    'DIRECTOR': 'INSTITUTION_MANAGER',
    
    // Roles educacionais
    'TEACHER': 'TEACHER',
    'PROFESSOR': 'TEACHER',
    'DOCENTE': 'TEACHER',
    'EDUCATOR': 'TEACHER',
    
    'STUDENT': 'STUDENT',
    'ALUNO': 'STUDENT',
    'ESTUDANTE': 'STUDENT',
    'PUPIL': 'STUDENT',
    
    'COORDINATOR': 'COORDINATOR',
    'COORDENADOR': 'COORDINATOR',
    
    // Roles familiares
    'PARENT': 'GUARDIAN',
    'GUARDIAN': 'GUARDIAN',
    'RESPONSAVEL': 'GUARDIAN',
    'PAI': 'GUARDIAN',
    'MAE': 'GUARDIAN',
    
    // Roles numéricos (comum em sistemas legados)
    '1': 'SYSTEM_ADMIN',
    '2': 'INSTITUTION_MANAGER', 
    '3': 'TEACHER',
    '4': 'STUDENT',
    '5': 'GUARDIAN',
    '6': 'COORDINATOR'
  }

  const mappedRole = autoMappings[roleStr]
  if (mappedRole) {
    console.log(`🔄 ROLE MAPPING AUTOMÁTICO: ${roleStr} → ${mappedRole}`)
    return mappedRole
  }

  // 3. Mapeamento baseado em palavras-chave
  if (roleStr.includes('ADMIN') || roleStr.includes('ROOT')) return 'SYSTEM_ADMIN'
  if (roleStr.includes('MANAGER') || roleStr.includes('GESTOR')) return 'INSTITUTION_MANAGER'
  if (roleStr.includes('TEACHER') || roleStr.includes('PROFESSOR')) return 'TEACHER'
  if (roleStr.includes('STUDENT') || roleStr.includes('ALUNO')) return 'STUDENT'
  if (roleStr.includes('PARENT') || roleStr.includes('GUARDIAN')) return 'GUARDIAN'
  if (roleStr.includes('COORD')) return 'COORDINATOR'

  // 4. Fallback padrão
  console.log(`⚠️ ROLE MAPPING FALLBACK: ${roleStr} → STUDENT (não reconhecido)`)
  return 'STUDENT'
}

function generateCustomTableSQL(tableName: string, structureMapping: TableStructureMapping): string {
  if (structureMapping.customSQL) {
    return structureMapping.customSQL.replace(/\{tableName\}/g, tableName)
  }

  const columnDefinitions = structureMapping.columns.map(col => {
    const nullable = col.required ? ' NOT NULL' : ''
    const defaultValue = col.defaultValue !== undefined ? 
      ` DEFAULT ${typeof col.defaultValue === 'string' ? `'${col.defaultValue}'` : col.defaultValue}` : ''
    
    return `"${col.postgresColumn}" ${col.postgresType}${nullable}${defaultValue}`
  }).join(',\n  ')

  return `
    CREATE TABLE IF NOT EXISTS "${tableName}" (
      ${columnDefinitions}
    );
  `
}

function generateCreateTableSQL(
  tableName: string, 
  columns: any[], 
  structureMapping?: TableStructureMapping
): string {
  const columnDefinitions = columns.map(col => {
    // Verificar se há mapeamento customizado para esta coluna
    const customColumn = structureMapping?.columns.find(cm => 
      cm.mysqlColumn.toLowerCase() === col.Field.toLowerCase()
    )
    
    const columnName = customColumn ? customColumn.postgresColumn : col.Field.toLowerCase()
    const postgresType = customColumn ? customColumn.postgresType : mapMySQLTypeToPostgreSQL(col.Type)
    const nullable = customColumn ? (customColumn.required ? ' NOT NULL' : '') : (col.Null === 'YES' ? '' : ' NOT NULL')
    const defaultValue = customColumn && customColumn.defaultValue !== undefined ?
      (typeof customColumn.defaultValue === 'string' ? ` DEFAULT '${customColumn.defaultValue}'` : ` DEFAULT ${customColumn.defaultValue}`) :
      getDefaultValue(col.Default, postgresType)
    const autoIncrement = col.Extra.includes('auto_increment') ? 
      (postgresType.includes('bigint') ? ' GENERATED BY DEFAULT AS IDENTITY' : ' GENERATED BY DEFAULT AS IDENTITY') : ''
    
    return `"${columnName}" ${postgresType}${autoIncrement}${nullable}${defaultValue}`
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
    // CONVERSÃO ESPECIAL PARA VALORES PADRÃO BOOLEANOS
    if (defaultVal === '1' || defaultVal === 1 || defaultVal === true) return ' DEFAULT true'
    if (defaultVal === '0' || defaultVal === 0 || defaultVal === false) return ' DEFAULT false'
    
    // INTERCEPTAÇÃO CRÍTICA: Converter strings binárias em valores padrão
    if (typeof defaultVal === 'string') {
      if (defaultVal.includes("b'1'") || defaultVal === "b'1'") {
        console.log(`🚨 CONVERSÃO DEFAULT BOOLEAN: "${defaultVal}" -> DEFAULT true`)
        return ' DEFAULT true'
      }
      if (defaultVal.includes("b'0'") || defaultVal === "b'0'") {
        console.log(`🚨 CONVERSÃO DEFAULT BOOLEAN: "${defaultVal}" -> DEFAULT false`)
        return ' DEFAULT false'
      }
      // Regex para capturar qualquer formato b'X'
      const match = defaultVal.match(/b'([01])'/);
      if (match) {
        const result = match[1] === '1' ? 'true' : 'false'
        console.log(`🚨 CONVERSÃO DEFAULT REGEX: "${defaultVal}" -> DEFAULT ${result}`)
        return ` DEFAULT ${result}`
      }
    }
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
  preserveData: boolean,
  roleMappings: RoleMapping[] = [],
  structureMapping?: TableStructureMapping
): Promise<number> {
  if (batch.length === 0) return 0

  const columnNames = columns.map(col => `"${col.Field.toLowerCase()}"`).join(', ')
  const placeholders = batch.map((_, rowIndex) => 
    `(${columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ')})`
  ).join(', ')

  const values = batch.flatMap(row => 
    columns.map(col => {
      let value = row[col.Field]
      
      // TRATAMENTO ESPECIAL PARA ROLES/CARGOS
      const fieldName = col.Field.toLowerCase()
      if (fieldName.includes('role') || fieldName.includes('cargo') || fieldName.includes('perfil')) {
        const mappedRole = mapMySQLRoleToPostgreSQL(value, roleMappings)
        console.log(`🎭 ROLE MAPPING: Tabela ${tableName}, Campo ${col.Field}: "${value}" → "${mappedRole}"`)
        value = mappedRole
      }
      
      // INTERCEPTAÇÃO SUPER AGRESSIVA: Converter QUALQUER valor suspeito
      if (value !== null && value !== undefined) {
        const valueStr = String(value)
        
        // Se contém padrão binário OU é uma coluna boolean
        if (valueStr.includes("b'") || valueStr === "b'1'" || valueStr === "b'0'" || 
            (col.Type.toLowerCase().includes('bit') && typeof value === 'string')) {
          
          console.log(`🚨 SUPER INTERCEPTAÇÃO: "${valueStr}" na tabela ${tableName}, coluna ${col.Field} (tipo: ${col.Type})`)
          
          // Múltiplas tentativas de conversão
          if (valueStr === "b'1'" || valueStr.includes('1')) {
            value = true
            console.log(`🔧 CONVERSÃO FORÇADA: "${valueStr}" -> true`)
          } else if (valueStr === "b'0'" || valueStr.includes('0')) {
            value = false
            console.log(`🔧 CONVERSÃO FORÇADA: "${valueStr}" -> false`)
          } else {
            // Regex como último recurso
            const match = valueStr.match(/b'([01])'/);
            if (match) {
              value = match[1] === '1'
              console.log(`🔧 CONVERSÃO REGEX: "${valueStr}" -> ${value}`)
            }
          }
        }
      }
      
      return transformMySQLValueToPostgres(value, col.Type)
    })
  )

  // Verificar se há colunas auto_increment (IDENTITY) para usar OVERRIDING SYSTEM VALUE
  const hasAutoIncrement = columns.some(col => col.Extra.includes('auto_increment'))
  const overrideClause = hasAutoIncrement ? ' OVERRIDING SYSTEM VALUE' : ''
  const conflictClause = preserveData ? ' ON CONFLICT DO NOTHING' : ''
  
  const insertSQL = `
    INSERT INTO "${tableName}" (${columnNames})${overrideClause} 
    VALUES ${placeholders}${conflictClause}
  `

  try {
    const result = await pgClient.query(insertSQL, values)
    return result.rowCount || 0
  } catch (error: any) {
    console.error(`Erro no lote da tabela ${tableName}:`, error.message)
    
    // DEBUG: Mostrar valores que causaram erro
    console.log(`🔍 DEBUG VALORES QUE CAUSARAM ERRO:`)
    values.slice(0, 10).forEach((val, idx) => {
      console.log(`  [${idx}]: ${JSON.stringify(val)} (${typeof val})`)
    })
    
    // Tentar inserir registros individualmente em caso de erro
    let inserted = 0
    for (const row of batch) {
      try {
        const singleValues = columns.map(col => {
          let value = row[col.Field]
          
          // INTERCEPTAÇÃO INDIVIDUAL SUPER AGRESSIVA
          if (value !== null && value !== undefined) {
            const valueStr = String(value)
            
            if (valueStr.includes("b'") || valueStr === "b'1'" || valueStr === "b'0'" || 
                (col.Type.toLowerCase().includes('bit') && typeof value === 'string')) {
              
              console.log(`🚨 SUPER INTERCEPTAÇÃO INDIVIDUAL: "${valueStr}" na tabela ${tableName}, coluna ${col.Field}`)
              
              if (valueStr === "b'1'" || valueStr.includes('1')) {
                value = true
                console.log(`🔧 CONVERSÃO INDIVIDUAL FORÇADA: "${valueStr}" -> true`)
              } else if (valueStr === "b'0'" || valueStr.includes('0')) {
                value = false
                console.log(`🔧 CONVERSÃO INDIVIDUAL FORÇADA: "${valueStr}" -> false`)
              } else {
                const match = valueStr.match(/b'([01])'/);
                if (match) {
                  value = match[1] === '1'
                  console.log(`🔧 CONVERSÃO INDIVIDUAL REGEX: "${valueStr}" -> ${value}`)
                }
              }
            }
          }
          
          return transformMySQLValueToPostgres(value, col.Type)
        })
        
        const singleSQL = `
          INSERT INTO "${tableName}" (${columnNames})${overrideClause} 
          VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')})${conflictClause}
        `
        const result = await pgClient.query(singleSQL, singleValues)
        inserted += result.rowCount || 0
      } catch (singleError) {
        console.error(`🔍 DEBUG ERRO INDIVIDUAL:`, singleError instanceof Error ? singleError.message : String(singleError))
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
  
  // CONVERSÃO UNIVERSAL PRIORITÁRIA DE STRINGS BINÁRIAS
  // Esta deve ser a PRIMEIRA verificação para capturar QUALQUER string binária
  if (typeof value === 'string') {
    // Verificar se contém padrão binário
    if (value.includes("b'") || value.match(/^b'[01]'$/)) {
      console.log(`🔧 CAPTURA STRING BINÁRIA: "${value}" (tipo: ${mysqlType})`)
      // Usar regex para extrair o valor binário de qualquer formato
      const match = value.match(/b'([01])'/);
      if (match) {
        const result = match[1] === '1'
        console.log(`🔧 CONVERSÃO REGEX: "${value}" -> ${result}`)
        return result
      }
      // Fallback para formato direto
      if (value.startsWith("b'") && value.endsWith("'")) {
        const binaryValue = value.slice(2, -1)
        const result = binaryValue === '1'
        console.log(`🔧 CONVERSÃO DIRETA: "${value}" -> ${result}`)
        return result
      }
    }
    
    // CONVERSÃO ADICIONAL: Se é uma coluna boolean e valor é string suspeita
    if ((type.includes('bit') || type.includes('boolean') || type.includes('tinyint(1)')) && 
        (value === "b'1'" || value === "b'0'" || value.includes("b'"))) {
      console.log(`🔧 CONVERSÃO BOOLEAN FORÇADA: "${value}" (tipo: ${mysqlType})`)
      if (value.includes('1')) return true
      if (value.includes('0')) return false
    }
  }
  
  // DETECÇÃO ROBUSTA DE TIPOS BOOLEANOS
  // Verificar se é um tipo que deve ser convertido para boolean
  const isBooleanType = (
    type.includes('bit(1)') || 
    type.includes('bit') ||  // Capturar bit sem parênteses também
    type.includes('tinyint(1)') || 
    type.includes('boolean') || 
    type.includes('bool')
  )
  
  // DEBUG: Log para entender o que está chegando
  if (isBooleanType && typeof value === 'string' && value.includes("b'")) {
    console.log(`🐛 DEBUG BOOLEAN: valor="${value}", tipo="${mysqlType}", tipoValor=${typeof value}`)
  }
  
  // CONVERSÃO PARA TIPOS BOOLEANOS DETECTADOS
  if (isBooleanType) {
    // Lidar com diferentes formatos
    if (Buffer.isBuffer(value)) {
      const result = value[0] === 1
      console.log(`🔧 CONVERSÃO BUFFER: ${value} -> ${result}`)
      return result
    }
    if (typeof value === 'string') {
      // Primeiro, verificar se é uma string que contém dados binários
      if (value.includes("b'")) {
        console.log(`🔧 CONVERSÃO STRING COM B: "${value}" -> processando...`)
        // Extrair apenas o valor binário
        const match = value.match(/b'([01])'/);
        if (match) {
          const result = match[1] === '1'
          console.log(`🔧 CONVERSÃO MATCH B: "${value}" -> ${result}`)
          return result
        }
      }
      
      // Strings numéricas
      if (value === '1' || value === 'true') return true
      if (value === '0' || value === 'false') return false
      // Strings de verdadeiro/falso
      const lowerValue = value.toLowerCase()
      return lowerValue === '1' || lowerValue === 'true' || lowerValue === 'yes'
    }
    if (typeof value === 'number') {
      return value === 1
    }
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