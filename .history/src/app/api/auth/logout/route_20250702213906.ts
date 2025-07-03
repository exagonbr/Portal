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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { logoutAll = false } = body;
    
    // Obter tokens dos cookies
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;
    const authToken = cookieStore.get('auth_token')?.value;

    console.log('🚪 [LOGOUT-API] Iniciando logout', { sessionId: !!sessionId, logoutAll });

    try {
      if (sessionId) {
        // Buscar dados da sessão
        const sessionData = await redis.get(`session:${sessionId}`);
        
        if (sessionData) {
          const session = JSON.parse(sessionData);
          const userId = session.userId;

          if (logoutAll && userId) {
            // Logout de todas as sessões do usuário
            const userSessions = await redis.smembers(`user_sessions:${userId}`);
            
            for (const userSessionId of userSessions) {
              await redis.del(`session:${userSessionId}`);
            }
            
            // Limpar índice de sessões do usuário
            await redis.del(`user_sessions:${userId}`);
            
            console.log(`✅ [LOGOUT-API] ${userSessions.length} sessões removidas para usuário ${userId}`);
          } else {
            // Logout apenas da sessão atual
            await redis.del(`session:${sessionId}`);
            
            if (userId) {
              await redis.srem(`user_sessions:${userId}`, sessionId);
            }
            
            console.log('✅ [LOGOUT-API] Sessão atual removida');
          }
        }
      }

      // Remover refresh token
      if (refreshToken) {
        await redis.del(`refresh:${refreshToken}`);
        console.log('✅ [LOGOUT-API] Refresh token removido');
      }

    } catch (redisError) {
      console.error('❌ [LOGOUT-API] Erro do Redis:', redisError);
      // Continuar mesmo com erro do Redis
    }

    // Tentar fazer logout no backend também
    try {
      if (authToken) {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://127.0.0.1:3001/api';
        const logoutUrl = `${backendUrl}/auth/logout`;

        await fetch(logoutUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({ logoutAll }),
        });

        console.log('✅ [LOGOUT-API] Logout no backend realizado');
      }
    } catch (backendError) {
      console.error('⚠️ [LOGOUT-API] Erro no logout do backend:', backendError);
      // Continuar mesmo com erro do backend
    }

    // Criar resposta e limpar cookies
    const response = NextResponse.json({
      success: true,
      message: logoutAll ? 'Logout realizado em todas as sessões' : 'Logout realizado com sucesso'
    });

    // Limpar todos os cookies de autenticação
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0 // Expira imediatamente
    };

    response.cookies.set('auth_token', '', cookieOptions);
    response.cookies.set('refresh_token', '', cookieOptions);
    response.cookies.set('session_id', '', cookieOptions);
    response.cookies.set('user_role', '', { ...cookieOptions, httpOnly: false });

    return response;

  } catch (error: any) {
    console.log('❌ [LOGOUT-API] Erro no logout:', error);
    
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

export async function GET() {
  return NextResponse.json(
    { 
      success: true,
      message: 'API de logout ativa',
      timestamp: new Date().toISOString()
    }
  );
}
