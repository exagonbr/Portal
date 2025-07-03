import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

// Configuração do Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  maxRetriesPerRequest: 3,
});

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  institutionId: string | null;
}

export interface AuthSession {
  user: AuthUser;
  sessionId: string;
  accessToken: string;
  loginTime: string;
  lastActivity: string;
  rememberMe: boolean;
}

export async function validateAuth(request: NextRequest): Promise<{ success: boolean; user?: AuthUser; session?: AuthSession; error?: string }> {
  try {
    // Obter token do header Authorization ou cookies
    const authHeader = request.headers.get('authorization');
    const authToken = authHeader?.replace('Bearer ', '') || 
                     request.cookies.get('auth_token')?.value;
    
    const sessionId = request.cookies.get('session_id')?.value;

    if (!authToken && !sessionId) {
      return { success: false, error: 'Token de autenticação não fornecido' };
    }

    // Tentar buscar sessão no Redis primeiro
    if (sessionId) {
      try {
        const sessionData = await redis.get(`session:${sessionId}`);
        
        if (sessionData) {
          const session = JSON.parse(sessionData);
          
          // Atualizar última atividade
          session.lastActivity = new Date().toISOString();
          const accessTokenExpiry = session.rememberMe ? 7 * 24 * 60 * 60 : 60 * 60;
          await redis.setex(`session:${sessionId}`, accessTokenExpiry, JSON.stringify(session));

          const user: AuthUser = {
            id: session.userId,
            email: session.email,
            name: session.name,
            role: session.role,
            permissions: session.permissions || [],
            institutionId: session.institutionId
          };

          const authSession: AuthSession = {
            user,
            sessionId,
            accessToken: session.accessToken,
            loginTime: session.loginTime,
            lastActivity: session.lastActivity,
            rememberMe: session.rememberMe
          };

          return { success: true, user, session: authSession };
        }
      } catch (redisError) {
        console.error('❌ [AUTH-MIDDLEWARE] Erro do Redis:', redisError);
      }
    }

    // Fallback: validar no backend
    if (authToken) {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://127.0.0.1:3001/api';
        const validateUrl = `${backendUrl}/auth/validate`;

        const response = await fetch(validateUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const backendData = await response.json();
          
          // Criar usuário temporário baseado na validação do backend
          const user: AuthUser = {
            id: 'backend_validated',
            email: 'backend@validation.com',
            name: 'Usuário Backend',
            role: 'USER',
            permissions: [],
            institutionId: null
          };

          const authSession: AuthSession = {
            user,
            sessionId: 'backend_session',
            accessToken: authToken,
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            rememberMe: false
          };

          return { success: true, user, session: authSession };
        }
      } catch (backendError) {
        console.error('❌ [AUTH-MIDDLEWARE] Erro do backend:', backendError);
      }
    }

    return { success: false, error: 'Token inválido ou expirado' };

  } catch (error: any) {
    console.error('❌ [AUTH-MIDDLEWARE] Erro na validação:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export function requireAuth(handler: (request: NextRequest, auth: AuthSession) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = await validateAuth(request);
    
    if (!authResult.success || !authResult.session) {
      return NextResponse.json(
        { 
          success: false, 
          message: authResult.error || 'Não autorizado',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    return handler(request, authResult.session);
  };
}

export function requireRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return function(handler: (request: NextRequest, auth: AuthSession) => Promise<NextResponse>) {
    return async (request: NextRequest) => {
      const authResult = await validateAuth(request);
      
      if (!authResult.success || !authResult.session) {
        return NextResponse.json(
          { 
            success: false, 
            message: authResult.error || 'Não autorizado',
            code: 'UNAUTHORIZED'
          },
          { status: 401 }
        );
      }

      if (!allowedRoles.includes(authResult.session.user.role)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Acesso negado. Papel insuficiente.',
            code: 'FORBIDDEN',
            required: allowedRoles,
            current: authResult.session.user.role
          },
          { status: 403 }
        );
      }

      return handler(request, authResult.session);
    };
  };
}

export function requirePermission(permissions: string | string[]) {
  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
  
  return function(handler: (request: NextRequest, auth: AuthSession) => Promise<NextResponse>) {
    return async (request: NextRequest) => {
      const authResult = await validateAuth(request);
      
      if (!authResult.success || !authResult.session) {
        return NextResponse.json(
          { 
            success: false, 
            message: authResult.error || 'Não autorizado',
            code: 'UNAUTHORIZED'
          },
          { status: 401 }
        );
      }

      const userPermissions = authResult.session.user.permissions || [];
      const hasPermission = requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Acesso negado. Permissão insuficiente.',
            code: 'FORBIDDEN',
            required: requiredPermissions,
            current: userPermissions
          },
          { status: 403 }
        );
      }

      return handler(request, authResult.session);
    };
  };
}

export function optionalAuth(handler: (request: NextRequest, auth?: AuthSession) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = await validateAuth(request);
    
    if (authResult.success && authResult.session) {
      return handler(request, authResult.session);
    }
    
    return handler(request);
  };
}