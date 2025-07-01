import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

interface MySQLConnection {
  host: string
  port: number
  user: string
  password: string
  database: string
  tableName: string
}


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(request: NextRequest) {
  try {
    const { host, port, user, password, database, tableName }: MySQLConnection = await request.json()
    
    // Validação dos parâmetros
    if (!host || !port || !user || !password || !database || !tableName) {
      return NextResponse.json({
        success: false,
        error: 'Todos os parâmetros de conexão e nome da tabela são obrigatórios'
      }, { status: 400 })
    }

    // Criar conexão MySQL
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      charset: 'utf8mb4'
    })

    try {
      // Obter estrutura da tabela
      const [columnsResult] = await connection.execute(
        `DESCRIBE \`${tableName}\``
      ) as any[]

      // Obter informações adicionais das colunas
      const [infoResult] = await connection.execute(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE,
          COLUMN_DEFAULT,
          COLUMN_TYPE,
          CHARACTER_MAXIMUM_LENGTH,
          NUMERIC_PRECISION,
          NUMERIC_SCALE,
          COLUMN_KEY,
          EXTRA
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [database, tableName]) as any[]

      // Obter informações de índices
      const [indexResult] = await connection.execute(
        `SHOW INDEX FROM \`${tableName}\``
      ) as any[]

      // Mapear colunas com informações detalhadas
      const columns = columnsResult.map((col: any) => {
        const infoCol = infoResult.find((info: any) => info.COLUMN_NAME === col.Field)
        const indexes = indexResult.filter((idx: any) => idx.Column_name === col.Field)
        
        return {
          name: col.Field,
          type: col.Type,
          dataType: infoCol?.DATA_TYPE || '',
          nullable: col.Null === 'YES',
          defaultValue: col.Default,
          key: col.Key,
          extra: col.Extra,
          maxLength: infoCol?.CHARACTER_MAXIMUM_LENGTH,
          precision: infoCol?.NUMERIC_PRECISION,
          scale: infoCol?.NUMERIC_SCALE,
          indexes: indexes.map((idx: any) => ({
            name: idx.Key_name,
            unique: idx.Non_unique === 0,
            type: idx.Index_type
          }))
        }
      })

      // Obter informações de chaves estrangeiras
      const [foreignKeysResult] = await connection.execute(`
        SELECT 
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME,
          CONSTRAINT_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = ? 
          AND TABLE_NAME = ? 
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `, [database, tableName]) as any[]

      // Adicionar informações de FK às colunas
      columns.forEach((col: any) => {
        const fk = foreignKeysResult.find((fk: any) => fk.COLUMN_NAME === col.name)
        if (fk) {
          col.foreignKey = {
            table: fk.REFERENCED_TABLE_NAME,
            column: fk.REFERENCED_COLUMN_NAME,
            constraint: fk.CONSTRAINT_NAME
          }
        }
      })

      await connection.end()

      return NextResponse.json({
        success: true,
        columns,
        tableName,
        columnCount: columns.length
      }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

    } catch (error) {
      await connection.end()
      throw error
    }

  } catch (error: any) {
    console.log('Erro ao obter colunas da tabela MySQL:', error)
    
    let errorMessage = error.message
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      errorMessage = `Tabela '${(await request.json()).tableName}' não encontrada`
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Conexão recusada. Verifique se o servidor MySQL está rodando.'
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = 'Acesso negado. Verifique as credenciais.'
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
} 
