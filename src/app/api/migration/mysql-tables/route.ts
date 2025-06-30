import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

interface MySQLConnection {
  host: string
  port: number
  user: string
  password: string
  database: string
}


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(request: NextRequest) {
  try {
    const { host, port, user, password, database }: MySQLConnection = await request.json()
    
    // Validação dos parâmetros
    if (!host || !port || !user || !password || !database) {
      return NextResponse.json({
        success: false,
        error: 'Todos os parâmetros de conexão são obrigatórios'
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
      // Listar todas as tabelas
      const [tablesResult] = await connection.execute(
        'SHOW TABLES'
      ) as any[]

      const tables = []
      let totalRows = 0

      // Para cada tabela, obter a contagem de registros
      for (const tableRow of tablesResult) {
        const tableName = Object.values(tableRow)[0] as string
        
        try {
          // Contar registros da tabela
          const [countResult] = await connection.execute(
            `SELECT COUNT(*) as count FROM \`${tableName}\``
          ) as any[]
          
          const rowCount = countResult[0]?.count || 0
          totalRows += rowCount
          
          tables.push({
            name: tableName,
            rowCount: parseInt(rowCount.toString())
          })
        } catch (error) {
          console.error(`Erro ao contar registros da tabela ${tableName}:`, error)
          tables.push({
            name: tableName,
            rowCount: 0
          })
        }
      }

      // Ordenar tabelas por nome
      tables.sort((a, b) => a.name.localeCompare(b.name))

      await connection.end()

      return NextResponse.json({
        success: true,
        tables,
        totalRows,
        tableCount: tables.length
      }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

    } catch (error) {
      await connection.end()
      throw error
    }

  } catch (error: any) {
    console.error('Erro ao listar tabelas MySQL:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 })
  }
} 
