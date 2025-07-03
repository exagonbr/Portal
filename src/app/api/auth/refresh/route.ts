import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/middleware/auth';

/**
 * Renovar token de acesso usando refresh token
 * POST /api/auth/refresh
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token é obrigatório' },
        { status: 400 }
      );
    }

    const result = await refreshAccessToken(refreshToken);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
