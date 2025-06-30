import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(request: NextRequest) {
  try {
    const { host, port, user, password, database } = await request.json()

    // Validar campos obrigatórios
    if (!host || !user || !database) {
      return NextResponse.json({
        success: false,
        error: 'Host, usuário e nome do banco são obrigatórios'
      }, { status: 400 })
    }

    // Configuração da conexão MySQL
    const connectionConfig = {
      host,
      port: port || 3306,
      user,
      password: password || '',
      database,
      connectTimeout: 10000, // 10 segundos
      acquireTimeout: 10000,
      timeout: 10000
    }

    // Testar conexão
    let connection: mysql.Connection | null = null
    
    try {
      connection = await mysql.createConnection(connectionConfig)
      
      // Executar uma query simples para verificar se a conexão está funcionando
      const [result] = await connection.execute('SELECT 1 as test')
      
      // Verificar se conseguimos listar as tabelas
      const [tables] = await connection.execute('SHOW TABLES')
      
      await connection.end()
      
      return NextResponse.json({
        success: true,
        message: 'Conexão MySQL estabelecida com sucesso',
        tableCount: Array.isArray(tables, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    }) ? tables.length : 0
      })
      
    } catch (connectionError: any) {
      if (connection) {
        try {
          await connection.end()
        } catch (closeError) {
          console.error('Erro ao fechar conexão:', closeError)
        }
      }
      
      // Mapear erros comuns para mensagens mais amigáveis
      let errorMessage = connectionError.message
      
      if (connectionError.code === 'ECONNREFUSED') {
        errorMessage = 'Conexão recusada. Verifique se o servidor MySQL está rodando e acessível.'
      } else if (connectionError.code === 'ER_ACCESS_DENIED_ERROR') {
        errorMessage = 'Acesso negado. Verifique o usuário e senha.'
      } else if (connectionError.code === 'ER_BAD_DB_ERROR') {
        errorMessage = 'Banco de dados não encontrado. Verifique o nome do banco.'
      } else if (connectionError.code === 'ENOTFOUND') {
        errorMessage = 'Servidor não encontrado. Verifique o endereço do host.'
      } else if (connectionError.code === 'ETIMEDOUT') {
        errorMessage = 'Timeout na conexão. Verifique a conectividade de rede.'
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        code: connectionError.code
      }, { status: 400 })
    }
    
  } catch (error: any) {
    console.error('Erro ao testar conexão MySQL:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
} 
