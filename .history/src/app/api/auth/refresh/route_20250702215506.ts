import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken, extractToken } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let refreshToken = body.refreshToken;

    // Se não foi fornecido no body, tentar extrair do cookie
    if (!refreshToken) {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(c => c.trim());
        const refreshCookie = cookies.find(c => c.startsWith('refreshToken='));
        if (refreshCookie) {
          refreshToken = refreshCookie.split('=')[1];
        }
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Refresh token é obrigatório',
          code: 'REFRESH_TOKEN_REQUIRED'
        },
        { status: 400 }
      );
    }

    console.log('🔄 [REFRESH] Renovando token de acesso');

    // Renovar token
    const refreshResult = await refreshAccessToken(refreshToken);

    if (!refreshResult.success) {
      console.log('❌ [REFRESH] Falha ao renovar token:', refreshResult.message);
      return NextResponse.json(
        { 
          success: false, 
          message: refreshResult.message || 'Refresh token inválido',
          code: 'REFRESH_TOKEN_INVALID'
        },
        { status: 401 }
      );
    }

    const { accessToken, refreshToken: newRefreshToken, expiresIn } = refreshResult.data!;

    console.log('✅ [REFRESH] Token renovado com sucesso');

    // Criar resposta com novos tokens
    const response = NextResponse.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        token: accessToken,
        refreshToken: newRefreshToken,
        expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      },
      meta: {
        refreshTime: new Date().toISOString(),
        sessionDuration: expiresIn
      }
    });

    // Atualizar cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/'
    };

    // Atualizar cookie do token de acesso
    response.cookies.set('token', accessToken, {
      ...cookieOptions,
      maxAge: expiresIn
    });

    // Atualizar cookie do refresh token
    response.cookies.set('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 // 7 dias
    });

    return response;

  } catch (error: any) {
    console.error('❌ [REFRESH] Erro interno:', error);
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

export async function OPTIONS() {
  return NextResponse.json(
    { 
      success: true,
      message: 'API de refresh token ativa',
      methods: ['POST', 'OPTIONS'],
      timestamp: new Date().toISOString()
    }
  );
}
