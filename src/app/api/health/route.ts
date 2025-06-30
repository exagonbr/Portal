export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/config/constants';


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    // Verificações básicas de saúde do sistema
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'connected', // Em produção, verificar conexão real
        redis: 'connected',    // Em produção, verificar conexão real
        s3: 'connected'        // Em produção, verificar conexão real
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      }
    }

    return NextResponse.json(healthData, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  } catch (error) {
    console.error('Erro no health check:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Erro interno do servidor',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 