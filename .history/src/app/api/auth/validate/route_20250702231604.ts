import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, MOCK_USERS } from '@/middleware/auth';

/**
 * Validar token de acesso
 * POST /api/auth/validate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token: bodyToken } = body;

    // Se não foi fornecido no body, tentar extrair dos headers
    const tokenToValidate = token || extractToken(request);

    if (!tokenToValidate) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token é obrigatório',
          valid: false
        },
        { status: 400 }
      );
    }

    // Verificar se o token está na blacklist
    const isBlacklisted = await redisGet(`blacklist:${tokenToValidate}`);
    if (isBlacklisted) {
      return NextResponse.json({
        success: false,
        message: 'Token inválido ou expirado',
        valid: false,
        reason: 'blacklisted'
      }, { status: 401 });
    }

    // Verificar token
    const decoded = verifyToken(tokenToValidate);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: 'Token inválido ou expirado',
        valid: false,
        reason: 'invalid_signature'
      }, { status: 401 });
    }

    // Verificar se o usuário existe
    const user = MOCK_USERS[decoded.email];
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado',
        valid: false,
        reason: 'user_not_found'
      }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({
        success: false,
        message: 'Usuário inativo',
        valid: false,
        reason: 'user_inactive'
      }, { status: 401 });
    }

    // Verificar se a sessão existe
    const sessionKey = `session:${user.id}:${decoded.sessionId}`;
    const sessionData = await redisGet(sessionKey);
    
    if (!sessionData) {
      return NextResponse.json({
        success: false,
        message: 'Sessão expirada',
        valid: false,
        reason: 'session_expired'
      }, { status: 401 });
    }

    // Token válido
    return NextResponse.json({
      success: true,
      message: 'Token válido',
      valid: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions
        },
        sessionId: decoded.sessionId,
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
        issuedAt: new Date(decoded.iat * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao validar token:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        valid: false,
        reason: 'internal_error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
