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

    console.log('✅ [LOGOUT] Logout realizado com sucesso:', auth.user.email);

    // Criar resposta removendo cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso',
      data: {
        loggedOut: true,
        logoutTime: new Date().toISOString(),
        user: {
          email: auth.user.email,
          name: auth.user.name
        }
      }
    });

    // Remover todos os cookies de autenticação
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 0 // Remove o cookie
    };

    const publicCookieOptions = {
      ...cookieOptions,
      httpOnly: false
    };

    // Remover todos os cookies de token
    response.cookies.set('token', '', cookieOptions);
    response.cookies.set('auth_token', '', cookieOptions);
    response.cookies.set('authToken', '', publicCookieOptions);
    response.cookies.set('refreshToken', '', cookieOptions);
    
    // Remover cookies de dados do usuário
    response.cookies.set('user', '', publicCookieOptions);
    response.cookies.set('sessionId', '', publicCookieOptions);

    // Headers para limpar tokens do lado cliente
    response.headers.set('X-Auth-Token', '');
    response.headers.set('X-Refresh-Token', '');
    response.headers.set('X-Session-Expires', '');
    response.headers.set('Clear-Site-Data', '"cookies", "storage"');

    return response;

  } catch (error: any) {
    console.error('❌ [LOGOUT] Erro interno:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
});

export async function OPTIONS() {
  return NextResponse.json(
    { 
      success: true,
      message: 'API de logout ativa',
      methods: ['POST', 'OPTIONS'],
      timestamp: new Date().toISOString()
    }
  );
}
