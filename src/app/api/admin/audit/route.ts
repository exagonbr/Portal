import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/middleware/auth';

export const GET = requireRole(['SYSTEM_ADMIN', 'ADMIN'])(
  async (request: NextRequest, auth) => {
    try {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const action = url.searchParams.get('action');
      const userId = url.searchParams.get('userId');
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');

      console.log('🔍 [ADMIN-AUDIT] Buscando logs de auditoria por:', auth.user.email);

      // Simular dados de auditoria
      const auditLogs = [
        {
          id: '1',
          userId: '1',
          userEmail: 'admin@sabercon.edu.br',
          action: 'USER_LOGIN',
          resource: 'auth',
          resourceId: null,
          details: {
            ip: '192.168.1.100',
            userAgent: 'Mozilla/5.0...',
            success: true
          },
          timestamp: new Date().toISOString(),
          severity: 'INFO'
        },
        {
          id: '2',
          userId: '2',
          userEmail: 'teacher@sabercon.edu.br',
          action: 'USER_CREATE',
          resource: 'users',
          resourceId: '123',
          details: {
            createdUser: {
              email: 'student@sabercon.edu.br',
              role: 'STUDENT'
            }
          },
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          severity: 'INFO'
        },
        {
          id: '3',
          userId: '1',
          userEmail: 'admin@sabercon.edu.br',
          action: 'PERMISSION_CHANGE',
          resource: 'roles',
          resourceId: '5',
          details: {
            oldPermissions: ['users.view'],
            newPermissions: ['users.view', 'users.edit']
          },
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          severity: 'WARNING'
        }
      ];

      // Filtrar logs baseado nos parâmetros
      let filteredLogs = auditLogs;

      if (action) {
        filteredLogs = filteredLogs.filter(log => log.action === action);
      }

      if (userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === userId);
      }

      return NextResponse.json({
        success: true,
        data: filteredLogs.slice(0, limit),
        meta: {
          total: filteredLogs.length,
          limit,
          filters: { action, userId, startDate, endDate },
          requestedBy: auth.user.email
        }
      });

    } catch (error: any) {
      console.error('❌ [ADMIN-AUDIT] Erro:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }
  }
);

export const POST = requireRole(['SYSTEM_ADMIN', 'ADMIN'])(
  async (request: NextRequest, auth) => {
    try {
      const body = await request.json();
      const { action, resource, resourceId, details, severity = 'INFO' } = body;

      if (!action || !resource) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Campos obrigatórios: action, resource',
            code: 'VALIDATION_ERROR'
          },
          { status: 400 }
        );
      }

      console.log('📝 [ADMIN-AUDIT] Registrando log:', { action, resource });

      // Simular criação de log de auditoria
      const auditLog = {
        id: `audit_${Date.now()}`,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action,
        resource,
        resourceId,
        details: details || {},
        timestamp: new Date().toISOString(),
        severity
      };

      return NextResponse.json({
        success: true,
        message: 'Log de auditoria registrado',
        data: auditLog
      });

    } catch (error: any) {
      console.error('❌ [ADMIN-AUDIT] Erro ao registrar:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }
  }
);

export async function OPTIONS() {
  return NextResponse.json(
    { 
      success: true,
      message: 'API de auditoria administrativa ativa',
      methods: ['GET', 'POST', 'OPTIONS'],
      timestamp: new Date().toISOString()
    }
  );
}
