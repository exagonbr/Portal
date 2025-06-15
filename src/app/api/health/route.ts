export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/config/constants';

export async function GET(request: NextRequest) {
  const healthStatus = {
    timestamp: new Date().toISOString(),
    frontend: {
      status: 'healthy',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    },
    backend: {
      status: 'unknown',
      url: API_CONFIG.BASE_URL,
      responseTime: null as number | null,
      error: null as string | null
    },
    services: {
      authentication: 'fallback_available',
      database: 'unknown',
      redis: 'unknown'
    }
  };

  // Testar conexão com backend
  try {
    const startTime = Date.now();
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 segundos timeout
    });
    
    const responseTime = Date.now() - startTime;
    healthStatus.backend.responseTime = responseTime;

    if (response.ok) {
      const backendHealth = await response.json();
      healthStatus.backend.status = 'healthy';
      healthStatus.services.database = backendHealth.database?.status || 'unknown';
      healthStatus.services.redis = backendHealth.redis?.status || 'unknown';
      healthStatus.services.authentication = 'backend_available';
    } else {
      healthStatus.backend.status = 'unhealthy';
      healthStatus.backend.error = `HTTP ${response.status}`;
    }
  } catch (error) {
    healthStatus.backend.status = 'unreachable';
    healthStatus.backend.error = error instanceof Error ? error.message : 'Connection failed';
  }

  // Determinar status geral
  const overallStatus = healthStatus.backend.status === 'healthy' ? 'healthy' : 'degraded';
  const statusCode = overallStatus === 'healthy' ? 200 : 503;

  return NextResponse.json({
    status: overallStatus,
    ...healthStatus
  }, { status: statusCode });
} 