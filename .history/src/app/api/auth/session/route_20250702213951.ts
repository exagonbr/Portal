import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Redis from 'ioredis';

// Configuração do Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  maxRetriesPerRequest: 3,
});

export async function GET(request: NextRequest) {
  try {
    // Obter tokens dos cookies ou headers
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    const authToken = cookieStore.get('auth_token')?.value || 
                     request.headers.get('authorization')?.replace('Bearer ', '');

    if (!sessionId && !authToken) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Não autenticado',
          authenticated: false
        },
        { status: 401 }
      );
    }

    console.log('🔍 [SESSION-API] Validando sessão', { sessionId: !!sessionId, authToken: !!authToken });

    try {
      let sessionData = null;

      if (sessionId) {
        // Buscar sessão no Redis
        const redisSessionData = await redis.get(`session:${sessionId}`);
        if (redisSessionData) {
          sessionData = JSON.parse(redisSessionData);
          
          // Atualizar última atividade
          sessionData.lastActivity = new Date().toISOString();
          const accessTokenExpiry = sessionData.rememberMe ? 7 * 24 * 60 * 60 : 60 * 60;
          await redis.setex(`session:${sessionId}`, accessTokenExpiry, JSON.stringify(sessionData));
        }
      }

      if (!sessionData && authToken) {
        // Se não encontrou no Redis, tentar validar no backend
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
          
          // Criar sessão temporária baseada na validação do backend
          sessionData = {
            userId: 'temp',
            email: 'temp@temp.com',
            name: 'Usuário Temporário',
            role: 'USER',
            permissions: [],
            institutionId: null,
            accessToken: authToken,
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            rememberMe: false,
            userAgent: request.headers.get('user-agent') || '',
            ip: request.headers.get('x-forwarded-for') || 'unknown'
          };
        }
      }

      if (!sessionData) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Sessão inválida ou expirada',
            authenticated: false
          },
          { status: 401 }
        );
      }

      // Retornar dados da sessão
      return NextResponse.json({
        success: true,
        message: 'Sessão válida',
        authenticated: true,
        data: {
          user: {
            id: sessionData.userId,
            email: sessionData.email,
            name: sessionData.name,
            role: sessionData.role,
            permissions: sessionData.permissions,
            institutionId: sessionData.institutionId
          },
          session: {
            loginTime: sessionData.loginTime,
            lastActivity: sessionData.lastActivity,
            rememberMe: sessionData.rememberMe
          }
        }
      });

    } catch (redisError) {
      console.error('❌ [SESSION-API] Erro do Redis:', redisError);
      
      // Fallback: tentar validar diretamente no backend
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
            return NextResponse.json({
              success: true,
              message: 'Sessão válida (backend)',
              authenticated: true,
              data: {
                user: {
                  id: 'backend',
                  email: 'backend@validation.com',
                  name: 'Usuário Backend',
                  role: 'USER',
                  permissions: [],
                  institutionId: null
                }
              }
            });
          }
        } catch (backendError) {
          console.error('❌ [SESSION-API] Erro do backend:', backendError);
        }
      }

      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro interno do servidor',
          authenticated: false
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.log('❌ [SESSION-API] Erro na validação:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        authenticated: false,
        details: {
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Alias para GET - algumas aplicações fazem POST para validar sessão
  return GET(request);
}

export async function PUT(request: NextRequest) {
  try {
    // Atualizar dados da sessão
    const body = await request.json();
    const { preferences, settings } = body;

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Sessão não encontrada' 
        },
        { status: 401 }
      );
    }

    try {
      const sessionData = await redis.get(`session:${sessionId}`);
      
      if (!sessionData) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Sessão expirada' 
          },
          { status: 401 }
        );
      }

      const session = JSON.parse(sessionData);
      
      // Atualizar dados da sessão
      const updatedSession = {
        ...session,
        preferences: preferences || session.preferences,
        settings: settings || session.settings,
        lastActivity: new Date().toISOString()
      };

      const accessTokenExpiry = session.rememberMe ? 7 * 24 * 60 * 60 : 60 * 60;
      await redis.setex(`session:${sessionId}`, accessTokenExpiry, JSON.stringify(updatedSession));

      return NextResponse.json({
        success: true,
        message: 'Sessão atualizada com sucesso'
      });

    } catch (redisError) {
      console.error('❌ [SESSION-API] Erro ao atualizar sessão:', redisError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro interno do servidor' 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.log('❌ [SESSION-API] Erro na atualização:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        details: {
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Alias para logout
  const logoutResponse = await fetch(new URL('/api/auth/logout', request.url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': request.headers.get('cookie') || '',
    },
    body: JSON.stringify({ logoutAll: false }),
  });

  return logoutResponse;
}

export async function OPTIONS() {
  return NextResponse.json(
    { 
      success: true,
      message: 'API de sessão ativa',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      timestamp: new Date().toISOString()
    }
  );
}