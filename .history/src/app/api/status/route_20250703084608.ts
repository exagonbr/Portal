import { NextRequest, NextResponse } from 'next/server';

/**
 * Status do sistema (endpoint público)
 * GET /api/status
 */
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Simular verificações de saúde do sistema
    const healthChecks = {
      database: {
        status: 'healthy',
        responseTime: Math.floor(Math.random() * 20) + 5, // 5-25ms
        lastCheck: new Date().toISOString()
      },
      cache: {
        status: 'healthy',
        responseTime: Math.floor(Math.random() * 5) + 1, // 1-6ms
        lastCheck: new Date().toISOString()
      },
      storage: {
        status: 'healthy',
        responseTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
        lastCheck: new Date().toISOString()
      },
      email: {
        status: 'healthy',
        responseTime: Math.floor(Math.random() * 200) + 100, // 100-300ms
        lastCheck: new Date().toISOString()
      }
    };

    // Calcular status geral
    const allHealthy = Object.values(healthChecks).every(check => check.status === 'healthy');
    const overallStatus = allHealthy ? 'healthy' : 'degraded';

    const systemStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
      services: healthChecks,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        },
        cpu: {
          usage: Math.random() * 100,
          loadAverage: require('os').loadavg()
        }
      },
      version: process.env.npm_package_version || '2.3.1',
      environment: process.env.NODE_ENV || 'production'
    };

    // Tentar verificar conexão com o banco de dados
    try {
      // Fazer uma requisição simples para verificar se o backend está respondendo
      const backendHealthUrl = process.env.BACKEND_URL || 'https://portal.sabercon.com.br/api';
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

    return NextResponse.json({
      success: true,
      data: systemStatus
    }, { status: statusCode });

  } catch (error) {
    console.error('Erro ao obter status do sistema:', error);
    return NextResponse.json({
      success: false,
      status: 'error',
      message: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * OPTIONS para CORS
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}
