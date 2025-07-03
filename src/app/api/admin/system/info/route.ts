import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/middleware/auth';

/**
 * Obter informações do sistema
 * GET /api/admin/system/info
 */
export const GET = requireRole(['SYSTEM_ADMIN', 'ADMIN'])(async (request: NextRequest) => {
  try {
    // Simular informações do sistema
    const systemInfo = {
      application: {
        name: 'Portal Sabercon',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        buildDate: '2025-01-07T00:00:00Z',
        uptime: process.uptime(),
        nodeVersion: process.version
      },
      server: {
        platform: process.platform,
        arch: process.arch,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
        },
        cpu: {
          usage: Math.random() * 100, // Simular uso de CPU
          cores: require('os').cpus().length
        }
      },
      database: {
        status: 'connected',
        type: 'PostgreSQL',
        version: '14.0',
        connections: {
          active: 5,
          idle: 10,
          total: 15
        },
        lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() // 6 horas atrás
      },
      cache: {
        status: 'connected',
        type: 'Redis',
        version: '6.2.0',
        memory: {
          used: '45MB',
          peak: '67MB'
        },
        keys: 1247,
        hitRate: 94.5
      },
      storage: {
        type: 'AWS S3',
        status: 'connected',
        buckets: [
          {
            name: 'portal-uploads',
            size: '2.3GB',
            objects: 15420
          },
          {
            name: 'portal-backups',
            size: '890MB',
            objects: 45
          }
        ]
      },
      statistics: {
        users: {
          total: 1250,
          active: 890,
          online: 45,
          newToday: 12
        },
        content: {
          courses: 89,
          books: 234,
          videos: 567,
          assignments: 123
        },
        activity: {
          logins24h: 234,
          pageViews24h: 5670,
          errors24h: 12,
          avgResponseTime: 145
        }
      },
      health: {
        status: 'healthy',
        checks: [
          {
            name: 'Database Connection',
            status: 'pass',
            responseTime: 12
          },
          {
            name: 'Redis Connection',
            status: 'pass',
            responseTime: 3
          },
          {
            name: 'AWS S3 Connection',
            status: 'pass',
            responseTime: 89
          },
          {
            name: 'Email Service',
            status: 'pass',
            responseTime: 156
          }
        ],
        lastCheck: new Date().toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Informações do sistema obtidas com sucesso',
      data: systemInfo
    });

  } catch (error) {
    console.error('Erro ao obter informações do sistema:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
});

/**
 * OPTIONS para CORS
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}
