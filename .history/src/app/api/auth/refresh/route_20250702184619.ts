import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '@/config/jwt';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  return createCorsOptionsResponse(request);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  const corsHeaders = getCorsHeaders(origin);

  try {
    console.log('🚀 [/api/auth/refresh] Iniciando requisição...');

    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      console.log('❌ [/api/auth/refresh] Refresh token não encontrado.');
      return NextResponse.json(
        { success: false, message: 'Refresh token não fornecido.' },
        { status: 401, headers: corsHeaders }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_CONFIG.JWT_SECRET) as any;
    } catch (error) {
      console.log('❌ [/api/auth/refresh] Refresh token inválido ou expirado.', error);
      // Limpar cookie inválido
      const response = NextResponse.json(
        { success: false, message: 'Sessão inválida. Por favor, faça login novamente.' },
        { status: 401, headers: corsHeaders }
      );
      response.cookies.delete('refreshToken');
      return response;
    }

    const user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      institutionId: decoded.institutionId,
      permissions: decoded.permissions || [],
    };

    // Gerar novo Access Token
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        institutionId: user.institutionId,
        permissions: user.permissions,
      },
      JWT_CONFIG.JWT_SECRET,
      { expiresIn: JWT_CONFIG.JWT_ACCESS_TOKEN_EXPIRATION }
    );

    // Gerar novo Refresh Token (opcional, mas recomendado para segurança)
    const newRefreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        institutionId: user.institutionId,
        permissions: user.permissions,
      },
      JWT_CONFIG.JWT_SECRET,
      { expiresIn: JWT_CONFIG.JWT_REFRESH_TOKEN_EXPIRATION }
    );

    console.log('✅ [/api/auth/refresh] Tokens renovados com sucesso para:', user.email);

    const response = NextResponse.json(
      {
        success: true,
        message: 'Token renovado com sucesso.',
        data: {
          accessToken: newAccessToken,
          user: user,
        },
      },
      { status: 200, headers: corsHeaders }
    );

    // Configurar o novo refresh token no cookie
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: JWT_CONFIG.JWT_REFRESH_TOKEN_EXPIRATION_SECONDS,
    });

    return response;

  } catch (error) {
    console.log('❌ [/api/auth/refresh] Erro inesperado ao processar refresh:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor ao renovar token.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
