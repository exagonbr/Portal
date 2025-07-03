import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Buscar configurações do .env
    const envConfig = {
      mysql: {
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'portal'
      },
      postgres: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'portal'
      }
    }

    // Mascarar senhas para segurança
    const safeConfig = {
      mysql: {
        ...envConfig.mysql,
        password: envConfig.mysql.password ? '***' : ''
      },
      postgres: {
        ...envConfig.postgres,
        password: envConfig.postgres.password ? '***' : ''
      },
      // Incluir as senhas reais apenas se necessário (para preenchimento automático)
      _passwords: {
        mysql: envConfig.mysql.password,
        postgres: envConfig.postgres.password
      }
    }

    return NextResponse.json({
      success: true,
      config: safeConfig
    })

  } catch (error) {
    console.error('Erro ao buscar configurações do .env:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao carregar configurações do ambiente'
    }, { status: 500 })
  }
} 