import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/middleware/auth';

/**
 * Renovar token de acesso usando refresh token
 * POST /api/auth/refresh
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 [REFRESH] Iniciando renovação de token...');

    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      console.log('❌ [REFRESH] Refresh token não fornecido');
      return NextResponse.json({
        success: false,
        message: 'Refresh token é obrigatório'
      }, { status: 400 });
    }

    console.log('🔍 [REFRESH] Validando refresh token...');

    // Renovar token
    const refreshResult = await refreshAccessToken(refreshToken);

    if (!refreshResult.success) {
      console.log('❌ [REFRESH] Falha na renovação:', refreshResult.message);
      return NextResponse.json({
        success: false,
        message: refreshResult.message || 'Falha ao renovar token'
      }, { status: 401 });
    }

    const { user, accessToken, refreshToken: newRefreshToken, expiresIn } = refreshResult.data!;

    console.log('✅ [REFRESH] Token renovado com sucesso');
    console.log('👤 [REFRESH] Usuário:', user.email);

    // Criar resposta
    const response = NextResponse.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          avatar: user.avatar,
          status: user.status,
          lastLogin: user.lastLogin
        },
        accessToken,
        token: accessToken, // Compatibilidade
        refreshToken: newRefreshToken,
        expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      }
    });

    // Configurar cookies
    const maxAge = 15 * 60; // 15 minutos
    const refreshMaxAge = 7 * 24 * 60 * 60; // 7 dias

    // Cookie principal de autenticação
    response.cookies.set('authToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge
    });

    // Cookie alternativo
    response.cookies.set('token', accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge
    });

    // Refresh token
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: refreshMaxAge
    });

    return response;

  } catch (error: any) {
    console.error('💥 [REFRESH] Erro interno:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

/**
 * OPTIONS para CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
