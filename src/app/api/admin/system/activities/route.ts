import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/middleware/auth';

/**
 * Obter atividades do sistema
 * GET /api/admin/system/activities
 */
export const GET = requireRole(['SYSTEM_ADMIN', 'ADMIN'])(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const type = url.searchParams.get('type');
    const userId = url.searchParams.get('userId');

    // Simular dados de atividades do sistema
    const mockActivities = [
      {
        id: '1',
        type: 'LOGIN',
        userId: '1',
        userName: 'Administrador Sistema',
        userEmail: 'admin@sabercon.edu.br',
        description: 'Login realizado com sucesso',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min atrás
        metadata: {
          sessionId: 'sess_123',
          deviceType: 'desktop'
        }
      },
      {
        id: '2',
        type: 'USER_CREATED',
        userId: '1',
        userName: 'Administrador Sistema',
        userEmail: 'admin@sabercon.edu.br',
        description: 'Novo usuário criado: teacher@example.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min atrás
        metadata: {
          targetUserId: '2',
          targetUserEmail: 'teacher@example.com'
        }
      },
      {
        id: '3',
        type: 'SETTINGS_UPDATED',
        userId: '1',
        userName: 'Administrador Sistema',
        userEmail: 'admin@sabercon.edu.br',
        description: 'Configurações do sistema atualizadas',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min atrás
        metadata: {
          settingsChanged: ['email_notifications', 'backup_frequency']
        }
      },
      {
        id: '4',
        type: 'LOGOUT',
        userId: '2',
        userName: 'Professor João',
        userEmail: 'teacher@sabercon.edu.br',
        description: 'Logout realizado',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min atrás
        metadata: {
          sessionDuration: 3600 // 1 hora
        }
      }
    ];

    // Filtrar por tipo se especificado
    let filteredActivities = mockActivities;
    if (type) {
      filteredActivities = mockActivities.filter(activity => activity.type === type);
    }

    // Filtrar por usuário se especificado
    if (userId) {
      filteredActivities = filteredActivities.filter(activity => activity.userId === userId);
    }

    // Simular paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      message: 'Atividades do sistema obtidas com sucesso',
      data: {
        activities: paginatedActivities,
        pagination: {
          page,
          limit,
          total: filteredActivities.length,
          totalPages: Math.ceil(filteredActivities.length / limit),
          hasNext: endIndex < filteredActivities.length,
          hasPrev: page > 1
        },
        filters: {
          type,
          userId
        }
      }
    });

  } catch (error) {
    console.error('Erro ao obter atividades do sistema:', error);
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
