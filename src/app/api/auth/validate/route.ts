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

    // Tentar extrair token do body ou dos headers
    const token = bodyToken || extractToken(request);

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token de acesso requerido',
        valid: false
      }, { status: 400 });
    }

    // Verificar token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: 'Token inválido ou expirado',
        valid: false
      }, { status: 401 });
    }

    // Buscar usuário
    const user = MOCK_USERS[decoded.email];
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado',
        valid: false
      }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({
        success: false,
        message: 'Conta de usuário inativa',
        valid: false
      }, { status: 401 });
    }

    // Verificar se o token não está próximo do vencimento (menos de 5 minutos)
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - now;
    const isExpiringSoon = timeLeft < 300; // 5 minutos

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
          permissions: user.permissions,
          status: user.status
        },
        token: {
          type: decoded.type,
          sessionId: decoded.sessionId,
          issuedAt: new Date(decoded.iat * 1000).toISOString(),
          expiresAt: new Date(decoded.exp * 1000).toISOString(),
          timeLeft: timeLeft,
          isExpiringSoon: isExpiringSoon
        }
      }
    });

  } catch (error) {
    console.error('Erro na validação do token:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      valid: false
    }, { status: 500 });
  }
}

/**
 * OPTIONS para CORS
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}
