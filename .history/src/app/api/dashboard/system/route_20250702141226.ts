export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

// Função para gerar dados do sistema baseados no horário
function generateSystemData() {
  const now = new Date();
  const hour = now.getHours();
  
  // Simular variação baseada no horário
  const isBusinessHours = hour >= 8 && hour <= 18;
  const baseMultiplier = isBusinessHours ? 1.2 : 0.8;
  
  return {
    overview: {
      systemStatus: 'operational',
      uptime: Math.round((99.5 + Math.random() * 0.4) * 100) / 100, // 99.5-99.9%
      totalUsers: Math.floor(15420 * baseMultiplier),
      activeUsers: Math.floor(3240 * baseMultiplier),
      totalInstitutions: 45,
      activeInstitutions: 42,
      totalSchools: 156,
      activeSchools: 148
    },
    performance: {
      cpuUsage: Math.round((15 + Math.random() * 25) * 100) / 100, // 15-40%
      memoryUsage: Math.round((45 + Math.random() * 30) * 100) / 100, // 45-75%
      diskUsage: Math.round((35 + Math.random() * 20) * 100) / 100, // 35-55%
      networkLatency: Math.round((50 + Math.random() * 100) * 100) / 100, // 50-150ms
      responseTime: Math.round((200 + Math.random() * 300) * 100) / 100, // 200-500ms
      throughput: Math.floor(1200 + Math.random() * 800) // 1200-2000 req/min
    },
    database: {
      status: 'healthy',
      connections: Math.floor(25 + Math.random() * 50), // 25-75
      maxConnections: 100,
      queryTime: Math.round((15 + Math.random() * 35) * 100) / 100, // 15-50ms
      cacheHitRate: Math.round((85 + Math.random() * 10) * 100) / 100, // 85-95%
      storageUsed: Math.round((2.5 + Math.random() * 1.5) * 100) / 100, // 2.5-4.0 GB
      storageTotal: 10.0 // 10 GB
    },
    security: {
      status: 'secure',
      failedLogins: Math.floor(5 + Math.random() * 15), // 5-20
      blockedIPs: Math.floor(2 + Math.random() * 8), // 2-10
      suspiciousActivity: Math.floor(0 + Math.random() * 3), // 0-3
      lastSecurityScan: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      vulnerabilities: {
        critical: 0,
        high: Math.floor(0 + Math.random() * 2), // 0-1
        medium: Math.floor(1 + Math.random() * 3), // 1-4
        low: Math.floor(3 + Math.random() * 5) // 3-8
      }
    },
    services: [
      {
        name: 'API Gateway',
        status: 'running',
        uptime: Math.round((99.8 + Math.random() * 0.2) * 100) / 100,
        responseTime: Math.round((100 + Math.random() * 50) * 100) / 100
      },
      {
        name: 'Database',
        status: 'running',
        uptime: Math.round((99.9 + Math.random() * 0.1) * 100) / 100,
        responseTime: Math.round((20 + Math.random() * 30) * 100) / 100
      },
      {
        name: 'File Storage',
        status: 'running',
        uptime: Math.round((99.7 + Math.random() * 0.3) * 100) / 100,
        responseTime: Math.round((150 + Math.random() * 100) * 100) / 100
      },
      {
        name: 'Email Service',
        status: 'running',
        uptime: Math.round((99.5 + Math.random() * 0.5) * 100) / 100,
        responseTime: Math.round((300 + Math.random() * 200) * 100) / 100
      },
      {
        name: 'Cache Redis',
        status: 'running',
        uptime: Math.round((99.9 + Math.random() * 0.1) * 100) / 100,
        responseTime: Math.round((5 + Math.random() * 10) * 100) / 100
      },
      {
        name: 'Queue System',
        status: 'running',
        uptime: Math.round((99.6 + Math.random() * 0.4) * 100) / 100,
        responseTime: Math.round((80 + Math.random() * 40) * 100) / 100
      }
    ],
    logs: {
      totalLogs: Math.floor(50000 + Math.random() * 20000),
      errorLogs: Math.floor(150 + Math.random() * 100),
      warningLogs: Math.floor(800 + Math.random() * 400),
      infoLogs: Math.floor(45000 + Math.random() * 15000),
      recentErrors: [
        {
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          level: 'error',
          service: 'API Gateway',
          message: 'Connection timeout to external service',
          count: 3
        },
        {
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          level: 'warning',
          service: 'Database',
          message: 'Slow query detected (>2s)',
          count: 1
        },
        {
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          level: 'error',
          service: 'Email Service',
          message: 'Failed to send notification email',
          count: 2
        }
      ]
    },
    backup: {
      lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      nextBackup: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
      backupSize: Math.round((1.2 + Math.random() * 0.8) * 100) / 100, // 1.2-2.0 GB
      status: 'completed',
      retention: '30 days'
    },
    alerts: [
      {
        id: 1,
        type: 'info',
        title: 'Sistema funcionando normalmente',
        message: 'Todos os serviços estão operacionais',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        resolved: false
      },
      {
        id: 2,
        type: 'warning',
        title: 'Uso de memória elevado',
        message: 'Uso de memória em 75%, monitorar de perto',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        resolved: false
      }
    ],
    maintenance: {
      scheduled: [
        {
          title: 'Atualização de segurança',
          description: 'Aplicação de patches de segurança',
          scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          duration: '2 horas',
          impact: 'low'
        }
      ],
      recent: [
        {
          title: 'Otimização de banco de dados',
          description: 'Reindexação e limpeza de dados antigos',
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          duration: '1.5 horas',
          impact: 'medium'
        }
      ]
    },
    lastUpdated: now.toISOString()
  };
}


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthentication(request);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { 
          status: 401,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Verificar se tem permissão para ver dados do sistema
    if (!hasRequiredRole(session.user.role, ['SYSTEM_ADMIN'])) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { 
          status: 403,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    const systemData = generateSystemData();

    return NextResponse.json({
      success: true,
      data: systemData
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.log('Erro ao buscar dados do sistema:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
} 
