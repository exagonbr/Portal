import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, logoutUser, AuthSession } from '@/middleware/auth';

export const POST = requireAuth(async (request: NextRequest, auth: AuthSession) => {
  try {
    console.log('🚪 [LOGOUT] Realizando logout:', auth.user.email);

    // Fazer logout (adicionar token à blacklist e remover sessão)
    const logoutResult = await logoutUser(auth.token);

    if (!logoutResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: logoutResult.message,
          code: 'LOGOUT_ERROR'
        },
        { status: 400 }
      );
    }

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
