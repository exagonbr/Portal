import { NextRequest, NextResponse } from 'next/server';
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils';
import { getCorsHeaders, createCorsOptionsResponse } from '@/config/cors';

export const dynamic = 'force-dynamic';

// Função para verificar status de saúde do sistema
function getSystemHealth() {
  const now = new Date();
  
  // Simular verificações de saúde
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  // Verificar uso de memória (considerando saudável abaixo de 80%)
  const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  const memoryStatus = memoryUsagePercent < 80 ? 'healthy' : memoryUsagePercent < 90 ? 'warning' : 'critical';
  
  // Verificar uptime (considerando saudável acima de 1 hora)
  const uptimeStatus = uptime > 3600 ? 'healthy' : 'warning';
  
  // Status geral baseado nos componentes
  const componentStatuses = [memoryStatus, uptimeStatus];
  const overallStatus = componentStatuses.includes('critical') ? 'critical' : 
                       componentStatuses.includes('warning') ? 'warning' : 'healthy';

  return {
    overall: overallStatus,
    components: {
      api: {
        status: memoryStatus,
        uptime: Math.floor(uptime),
        memory: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external,
          arrayBuffers: memoryUsage.arrayBuffers
        },
        responseTime: Math.round(50 + Math.random() * 100), // 50-150ms simulado
        requests: {
          total: Math.floor(10000 + Math.random() * 50000),
          successful: Math.floor(9800 + Math.random() * 200),
          failed: Math.floor(Math.random() * 100)
        }
      },
      cache: {
        status: 'healthy', // Simulado como saudável
        activeConnections: Math.floor(10 + Math.random() * 40),
        memory: Math.floor(50 + Math.random() * 30), // MB
        hitRate: Math.round((90 + Math.random() * 8) * 100) / 100, // 90-98%
        operations: {
          gets: Math.floor(50000 + Math.random() * 100000),
          sets: Math.floor(25000 + Math.random() * 50000),
          deletes: Math.floor(5000 + Math.random() * 10000)
        }
      },
      database: {
        status: 'healthy', // Simulado como saudável
        connections: 'active',
        activeConnections: Math.floor(15 + Math.random() * 35),
        maxConnections: 100,
        queryTime: Math.round((20 + Math.random() * 80) * 100) / 100, // 20-100ms
        queries: {
          total: Math.floor(100000 + Math.random() * 200000),
          slow: Math.floor(Math.random() * 50),
          failed: Math.floor(Math.random() * 20)
        },
        storage: {
          used: Math.round((2.5 + Math.random() * 1.5) * 100) / 100, // GB
          total: 10.0,
          usagePercent: Math.round((25 + Math.random() * 15) * 100) / 100
        }
      },
      storage: {
        status: 'healthy',
        diskUsage: Math.round((40 + Math.random() * 30) * 100) / 100, // 40-70%
        freeSpace: Math.round((30 + Math.random() * 20) * 100) / 100, // GB
        totalSpace: 100.0,
        files: {
          total: Math.floor(50000 + Math.random() * 100000),
          uploads: Math.floor(1000 + Math.random() * 5000),
          downloads: Math.floor(10000 + Math.random() * 20000)
        }
      },
      network: {
        status: 'healthy',
        latency: Math.round((10 + Math.random() * 40) * 100) / 100, // 10-50ms
        bandwidth: {
          in: Math.round((100 + Math.random() * 400) * 100) / 100, // Mbps
          out: Math.round((50 + Math.random() * 200) * 100) / 100
        },
        requests: {
          successful: Math.round((99.5 + Math.random() * 0.4) * 100) / 100, // %
          timeout: Math.round((0.1 + Math.random() * 0.3) * 100) / 100,
          error: Math.round((0.1 + Math.random() * 0.3) * 100) / 100
        }
      }
    },
    metrics: {
      cpu: {
        usage: Math.round((20 + Math.random() * 40) * 100) / 100, // 20-60%
        cores: require('os').cpus().length,
        loadAverage: require('os').loadavg()
      },
      memory: {
        total: Math.round(require('os').totalmem() / 1024 / 1024 / 1024 * 100) / 100, // GB
        free: Math.round(require('os').freemem() / 1024 / 1024 / 1024 * 100) / 100,
        usage: Math.round((1 - require('os').freemem() / require('os').totalmem()) * 100 * 100) / 100
      },
      disk: {
        usage: Math.round((40 + Math.random() * 30) * 100) / 100,
        read: Math.floor(1000 + Math.random() * 5000), // MB/s
        write: Math.floor(500 + Math.random() * 2000)
      }
    },
    alerts: [
      ...(memoryStatus !== 'healthy' ? [{
        type: memoryStatus,
        component: 'api',
        message: `Uso de memória em ${Math.round(memoryUsagePercent)}%`,
        timestamp: now.toISOString()
      }] : []),
      ...(uptime < 3600 ? [{
        type: 'warning',
        component: 'system',
        message: `Sistema reiniciado recentemente (uptime: ${Math.floor(uptime / 60)} minutos)`,
        timestamp: now.toISOString()
      }] : [])
    ],
    lastCheck: now.toISOString(),
    version: process.env.npm_package_version || '2.3.1',
    environment: process.env.NODE_ENV || 'production'
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
        { status: 401 }
      );
    }

    // Verificar se tem permissão para ver status de saúde
    if (!hasRequiredRole(session.user.role, ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'])) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const healthData = getSystemHealth();

    return NextResponse.json({
      success: true,
      data: healthData
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('Erro ao verificar saúde do sistema:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
