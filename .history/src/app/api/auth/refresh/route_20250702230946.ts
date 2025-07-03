import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, generateTokens } from '@/middleware/auth';

/**
 * Renovar token de acesso usando refresh token
 * POST /api/auth/refresh
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json({
        success: false,
        message: 'Refresh token é obrigatório'
      }, { status: 400 });
    }

    // Verificar refresh token
    const decoded = await verifyToken(refreshToken);
    if (!decoded || decoded.type !== 'refresh') {
      return NextResponse.json({
        success: false,
        message: 'Refresh token inválido ou expirado'
      }, { status: 401 });
    }

    // Gerar novos tokens
    const tokens = await generateTokens({
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions
    });

    return NextResponse.json({
      success: true,
      message: 'Tokens renovados com sucesso',
      data: tokens
    });

  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
