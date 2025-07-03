import { NextRequest, NextResponse } from 'next/server';
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils';
import { getCorsHeaders } from '@/config/cors';

export interface AuthenticatedRequest extends NextRequest {
  session?: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      institution_id?: string;
      permissions: string[];
    };
    newToken?: string;
  };
}

/**
 * Middleware de autenticação que verifica se o usuário está autenticado
 * e adiciona a sessão ao request
 */
export function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
  options?: {
    requiredRoles?: string[];
    requiredPermissions?: string[];
  }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      console.log('🔐 [AUTH-MIDDLEWARE] Verificando autenticação...');
      
      const session = await getAuthentication(request);
      
      if (!session) {
        console.log('❌ [AUTH-MIDDLEWARE] Usuário não autenticado');
        return NextResponse.json(
          { 
            success: false, 
            message: 'Authorization required',
            error: 'No valid authentication token found'
          },
          { 
            status: 401,
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          }
        );
      }
      
      console.log('✅ [AUTH-MIDDLEWARE] Usuário autenticado:', {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role
      });
      
      // Verificar roles se especificado
      if (options?.requiredRoles && options.requiredRoles.length > 0) {
        if (!hasRequiredRole(session.user.role, options.requiredRoles)) {
          console.log('❌ [AUTH-MIDDLEWARE] Permissão insuficiente:', {
            userRole: session.user.role,
            requiredRoles: options.requiredRoles
          });
          
          return NextResponse.json(
            { 
              success: false, 
              message: 'Insufficient permissions',
              error: `Required role: ${options.requiredRoles.join(' or ')}`
            },
            { 
              status: 403,
              headers: getCorsHeaders(request.headers.get('origin') || undefined)
            }
          );
        }
      }
      
      // Verificar permissões específicas se especificado
      if (options?.requiredPermissions && options.requiredPermissions.length > 0) {
        const hasAllPermissions = options.requiredPermissions.every(
          permission => session.user.permissions.includes(permission)
        );
        
        if (!hasAllPermissions) {
          console.log('❌ [AUTH-MIDDLEWARE] Permissões insuficientes:', {
            userPermissions: session.user.permissions,
            requiredPermissions: options.requiredPermissions
          });
          
          return NextResponse.json(
            { 
              success: false, 
              message: 'Insufficient permissions',
              error: `Required permissions: ${options.requiredPermissions.join(', ')}`
            },
            { 
              status: 403,
              headers: getCorsHeaders(request.headers.get('origin') || undefined)
            }
          );
        }
      }
      
      // Adicionar sessão ao request
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.session = session;
      
      // Chamar o handler com o request autenticado
      const response = await handler(authenticatedRequest);
      
      // Se houver um novo token (refresh), adicionar aos headers da resposta
      if (session.newToken) {
        console.log('🔄 [AUTH-MIDDLEWARE] Novo token gerado, adicionando aos headers');
        response.headers.set('X-New-Token', session.newToken);
        
        // Também definir como cookie se preferir
        response.cookies.set('auth_token', session.newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 dias
          path: '/'
        });
      }
      
      return response;
      
    } catch (error) {
      console.error('❌ [AUTH-MIDDLEWARE] Erro no middleware:', error);
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Internal server error',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        { 
          status: 500,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }
  };
}

/**
 * Middleware simplificado para endpoints que requerem apenas autenticação básica
 */
export function requireAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return withAuth(handler);
}

/**
 * Middleware para endpoints que requerem role de admin
 */
export function requireAdmin(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return withAuth(handler, {
    requiredRoles: ['ADMIN', 'SYSTEM_ADMIN']
  });
}

/**
 * Middleware para endpoints que requerem role de system admin
 */
export function requireSystemAdmin(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return withAuth(handler, {
    requiredRoles: ['SYSTEM_ADMIN']
  });
}