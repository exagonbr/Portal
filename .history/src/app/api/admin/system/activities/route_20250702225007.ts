import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, MOCK_USERS } from '@/middleware/auth';

/**
 * Obter atividades do sistema
 * GET /api/admin/system/activities
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

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const type = url.searchParams.get('type');

    // Mock de atividades do sistema
    const mockActivities = [
      {
        id: '1',
        type: 'USER_LOGIN',
        userId: '1',
        userName: 'Admin Sistema',
        description: 'Login realizado com sucesso',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        metadata: {
          sessionId: 'sess_123',
          loginMethod: 'email'
        }
      },
      {
        id: '2',
        type: 'SYSTEM_BACKUP',
        userId: 'system',
        userName: 'Sistema',
        description: 'Backup automático executado',
        ipAddress: 'localhost',
        userAgent: 'System Process',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        metadata: {
          backupSize: '2.5GB',
          duration: '15min'
        }
      },
      {
        id: '3',
        type: 'USER_CREATED',
        userId: '1',
        userName: 'Admin Sistema',
        description: 'Novo usuário criado: teacher@example.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0...',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        metadata: {
          targetUserId: '4',
          targetUserRole: 'TEACHER'
        }
      },
      {
        id: '4',
        type: 'SYSTEM_ERROR',
        userId: null,
        userName: 'Sistema',
        description: 'Erro de conexão com banco de dados',
        ipAddress: 'localhost',
        userAgent: 'System Process',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        metadata: {
          errorCode: 'DB_CONNECTION_TIMEOUT',
          severity: 'HIGH'
        }
      }
    ];

    let filteredActivities = mockActivities;

    if (type) {
      filteredActivities = filteredActivities.filter(activity => activity.type === type);
    }

    const paginatedActivities = filteredActivities.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      message: 'Atividades do sistema obtidas com sucesso',
      data: {
        activities: paginatedActivities,
        pagination: {
          total: filteredActivities.length,
          limit,
          offset,
          hasMore: offset + limit < filteredActivities.length
        },
        summary: {
          totalActivities: mockActivities.length,
          recentLogins: mockActivities.filter(a => a.type === 'USER_LOGIN').length,
          systemErrors: mockActivities.filter(a => a.type === 'SYSTEM_ERROR').length,
          lastBackup: mockActivities.find(a => a.type === 'SYSTEM_BACKUP')?.timestamp
        }
      }
    });

  } catch (error) {
    console.error('Erro ao obter atividades do sistema:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
