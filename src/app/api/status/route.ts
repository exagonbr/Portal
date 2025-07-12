import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const timestamp = new Date().toISOString();
    
    // Verificar status básico do sistema
    const status = {
      status: 'ok',
      message: 'Sistema funcionando normalmente',
      timestamp,
      services: {
        api: {
          status: 'healthy',
          uptime: process.uptime(),
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
          }
        },
        database: {
          status: 'checking',
          message: 'Verificando conexão...'
        }
      },
      version: process.env.npm_package_version || '2.3.1',
      environment: process.env.NODE_ENV || 'production'
    };

    // Tentar verificar conexão com o banco de dados
    try {
      // Fazer uma requisição simples para verificar se o backend está respondendo
      const backendHealthUrl = process.env.API_URL || 'https://portal.sabercon.com.br/api';
      const healthResponse = await fetch(`${backendHealthUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (healthResponse.ok) {
        status.services.database = {
          status: 'healthy',
          message: 'Conexão com backend estabelecida'
        };
      } else {
        status.services.database = {
          status: 'warning',
          message: `Backend respondeu com status ${healthResponse.status}`
        };
      }
    } catch (dbError) {
      status.services.database = {
        status: 'error',
        message: 'Erro ao conectar com o backend'
      };
    }

    return NextResponse.json(status, { 
      status: 200,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    
  } catch (error) {
    console.log('Erro na rota /api/status:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 
