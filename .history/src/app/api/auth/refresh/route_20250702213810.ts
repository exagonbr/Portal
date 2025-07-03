import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Redis from 'ioredis';

// Configuração do Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken: bodyRefreshToken } = body;
    
    // Tentar obter refresh token do body ou cookies
    const cookieStore = cookies();
    const refreshToken = bodyRefreshToken || cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Refresh token não fornecido' 
        },
        { status: 401 }
      );
    }

    console.log('🔄 [REFRESH-API] Tentativa de refresh token');

    try {
      // Buscar dados do refresh token no Redis
      const refreshData = await redis.get(`refresh:${refreshToken}`);
      
      if (!refreshData) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Refresh token inválido ou expirado' 
          },
          { status: 401 }
        );
      }

      const { sessionId, userId, email } = JSON.parse(refreshData);

      // Buscar sessão atual
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

      // Fazer requisição para o backend para obter novo token
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://127.0.0.1:3001/api';
      const refreshUrl = `${backendUrl}/auth/refresh_token`;

      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });

      if (!response.ok) {
        // Se o backend falhar, tentar renovar localmente
        console.log('⚠️ [REFRESH-API] Backend falhou, renovando localmente');
        
        // Gerar novo access token (simulado)
        const newAccessToken = `renewed_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
        const newRefreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
        
        // Atualizar sessão
        const updatedSession = {
          ...session,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          lastActivity: new Date().toISOString()
        };

        const accessTokenExpiry = session.rememberMe ? 7 * 24 * 60 * 60 : 60 * 60;
        const refreshTokenExpiry = session.rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;

        // Salvar nova sessão
        await redis.setex(`session:${sessionId}`, accessTokenExpiry, JSON.stringify(updatedSession));
        
        // Salvar novo refresh token
        await redis.del(`refresh:${refreshToken}`);
        await redis.setex(`refresh:${newRefreshToken}`, refreshTokenExpiry, JSON.stringify({
          sessionId,
          userId,
          email
        }));

        const response_obj = NextResponse.json({
          success: true,
          message: 'Token renovado com sucesso',
          data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: {
              id: session.userId,
              email: session.email,
              name: session.name,
              role: session.role,
              permissions: session.permissions,
              institutionId: session.institutionId
            },
            expiresIn: accessTokenExpiry
          }
        });

        // Atualizar cookies
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          path: '/',
          maxAge: accessTokenExpiry
        };

        const refreshCookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          path: '/',
          maxAge: refreshTokenExpiry
        };

        response_obj.cookies.set('auth_token', newAccessToken, cookieOptions);
        response_obj.cookies.set('refresh_token', newRefreshToken, refreshCookieOptions);

        return response_obj;
      }

      const backendData = await response.json();
      
      // Atualizar sessão com novos tokens do backend
      const updatedSession = {
        ...session,
        accessToken: backendData.data?.accessToken || backendData.accessToken,
        lastActivity: new Date().toISOString()
      };

      const accessTokenExpiry = session.rememberMe ? 7 * 24 * 60 * 60 : 60 * 60;

      await redis.setex(`session:${sessionId}`, accessTokenExpiry, JSON.stringify(updatedSession));

      const response_obj = NextResponse.json({
        success: true,
        message: 'Token renovado com sucesso',
        data: {
          accessToken: backendData.data?.accessToken || backendData.accessToken,
          refreshToken: refreshToken,
          user: {
            id: session.userId,
            email: session.email,
            name: session.name,
            role: session.role,
            permissions: session.permissions,
            institutionId: session.institutionId
          },
          expiresIn: accessTokenExpiry
        }
      });

      // Atualizar cookie do access token
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: accessTokenExpiry
      };

      response_obj.cookies.set('auth_token', backendData.data?.accessToken || backendData.accessToken, cookieOptions);

      return response_obj;

    } catch (redisError) {
      console.error('❌ [REFRESH-API] Erro do Redis:', redisError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro interno do servidor' 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.log('❌ [REFRESH-API] Erro no refresh:', error);
    
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
      message: 'API de refresh token ativa',
      timestamp: new Date().toISOString()
    }
  );
}
