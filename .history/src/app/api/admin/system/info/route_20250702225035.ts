import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, MOCK_USERS } from '@/middleware/auth';

/**
 * Obter informações do sistema
 * GET /api/admin/system/info
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de acesso requerido' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    const user = MOCK_USERS[decoded.email];
    if (!user || !user.permissions.includes('admin.system')) {
      return NextResponse.json(
        { success: false, message: 'Permissão insuficiente' },
        { status: 403 }
      );
    }

    // Mock de informações do sistema
    const systemInfo = {
      application: {
        name: 'Portal Sabercon',
        version: '2.1.0',
        environment: process.env.NODE_ENV || 'development',
        buildDate: '2025-01-07T10:00:00Z',
        uptime: process.uptime(),
        nodeVersion: process.version
      },
      server: {
        platform: process.platform,
        architecture: process.arch,
        hostname: 'portal-server-01',
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        },
        cpu: {
          cores: require('os').cpus().length,
          model: require('os').cpus()[0]?.model || 'Unknown'
        }
      },
      database: {
        status: 'connected',
        type: 'PostgreSQL',
        version: '14.5',
        connections: {
          active: 5,
          idle: 10,
          max: 20
        },
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      cache: {
        status: 'connected',
        type: 'Redis',
        version: '6.2.7',
        memory: {
          used: '45MB',
          max: '512MB'
        },
        keys: 1247,
        hitRate: '94.2%'
      },
      storage: {
        uploads: {
          total: '2.3GB',
          available: '47.7GB',
          usage: '4.6%'
        },
        logs: {
          total: '156MB',
          retention: '30 days'
        }
      },
      security: {
        sslEnabled: true,
        lastSecurityScan: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        vulnerabilities: 0,
        failedLogins: {
          last24h: 3,
          last7d: 12
        }
      },
      monitoring: {
        healthCheck: 'healthy',
        lastCheck: new Date().toISOString(),
        alerts: {
          critical: 0,
          warning: 1,
          info: 3
        },
        performance: {
          avgResponseTime: '245ms',
          errorRate: '0.02%',
          availability: '99.98%'
        }
      },
      features: {
        maintenanceMode: false,
        registrationEnabled: true,
        emailNotifications: true,
        fileUploads: true,
        backupScheduled: true
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Informações do sistema obtidas com sucesso',
      data: systemInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao obter informações do sistema:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
