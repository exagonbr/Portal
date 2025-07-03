import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, extractToken, verifyToken, redisGet, redisDel, redisSet } from '@/middleware/auth';

/**
 * Obter informações da sessão atual
 * GET /api/auth/session
 */
export const GET = requireAuth(async (request: NextRequest, auth) => {
  try {
    return NextResponse.json({
      success: true,
      message: 'Sessão obtida com sucesso',
      data: {
        user: auth.user,
        sessionId: auth.sessionId,
        expiresAt: auth.expiresAt,
        permissions: auth.permissions,
        deviceInfo: auth.deviceInfo,
        ipAddress: auth.ipAddress
      }
    });
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
});

/**
 * Criar nova sessão (login alternativo)
 * POST /api/auth/session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Redirecionar para o endpoint de login
    return NextResponse.json({
      success: false,
      message: 'Use o endpoint /api/auth/login para fazer login',
      redirect: '/api/auth/login'
    }, { status: 302 });

  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Atualizar sessão
 * PUT /api/auth/session
 */
export const PUT = requireAuth(async (request: NextRequest, auth) => {
  try {
    const body = await request.json();
    const { deviceInfo, preferences } = body;

    // TODO: Implementar atualização de sessão
    return NextResponse.json({
      success: true,
      message: 'Sessão atualizada com sucesso',
      data: {
        sessionId: auth.sessionId,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
});

/**
 * Encerrar sessão (logout)
 * DELETE /api/auth/session
 */
export const DELETE = requireAuth(async (request: NextRequest, auth) => {
  try {
    const token = extractToken(request);
    if (token) {
      // Adicionar token à blacklist
      await redisSet(`blacklist:${token}`, true, 15 * 60);
      
      // Remover sessão do Redis
      const sessionKey = `session:${auth.user.id}:${auth.sessionId}`;
      await redisDel(sessionKey);
    }

    return NextResponse.json({
      success: true,
      message: 'Sessão encerrada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao encerrar sessão:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}