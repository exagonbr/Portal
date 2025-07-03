import { NextRequest, NextResponse } from 'next/server';

/**
 * Verificar status do sistema
 * GET /api/status
 */
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Verificações básicas de saúde do sistema
    const healthChecks = {
      database: true, // Mock - em produção verificaria conexão real
      cache: true,    // Mock - em produção verificaria Redis
      storage: true,  // Mock - em produção verificaria sistema de arquivos
      memory: process.memoryUsage().heapUsed < 1024 * 1024 * 1024, // < 1GB
      uptime: process.uptime() > 0
    };

    const allHealthy = Object.values(healthChecks).every(check => check === true);
    const responseTime = Date.now() - startTime;

    const status = {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '2.1.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor(process.uptime()),
      responseTime: `${responseTime}ms`,
      checks: healthChecks,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
      },
      services: {
        api: 'operational',
        auth: 'operational',
        database: 'operational',
        cache: 'operational'
      }
    };

    return NextResponse.json(status, {
      status: allHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
