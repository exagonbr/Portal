import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, extractToken, verifyToken, redisGet, redisDel } from '@/middleware/auth';

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
/**
 * Obter informações da sessão atual
 * GET /api/auth/session
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📋 [SESSION] Obtendo informações da sessão...');

    const authResult = await validateAuth(request);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: authResult.message
      }, { status: 401 });
    }

    const { user, sessionData } = authResult;

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado'
      }, { status: 404 });
    }

    console.log('✅ [SESSION] Sessão válida para:', user.email);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          avatar: user.avatar,
          status: user.status,
          institutionId: user.institutionId,
          department: user.department
        },
        session: {
          sessionId: sessionData?.sessionId,
          createdAt: sessionData?.createdAt,
          lastAccess: sessionData?.lastAccess,
          expiresAt: sessionData?.expiresAt,
          deviceInfo: sessionData?.deviceInfo,
          ipAddress: sessionData?.ipAddress,
          isActive: sessionData?.isActive
        }
      }
    });

  } catch (error: any) {
    console.error('💥 [SESSION] Erro interno:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

/**
 * Atualizar informações da sessão
 * PUT /api/auth/session
 */
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 [SESSION] Atualizando sessão...');

    const authResult = await validateAuth(request);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: authResult.message
      }, { status: 401 });
    }

    const { user, sessionData } = authResult;
    const body = await request.json();

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado'
      }, { status: 404 });
    }

    if (!sessionData) {
      return NextResponse.json({
        success: false,
        message: 'Dados da sessão não encontrados'
      }, { status: 404 });
    }

    // Atualizar informações da sessão
    const updatedSessionData = {
      ...sessionData,
      lastAccess: new Date().toISOString(),
      deviceInfo: body.deviceInfo || sessionData.deviceInfo,
      ipAddress: extractClientIP(request) || sessionData.ipAddress
    };

    // Salvar no Redis
    const sessionKey = `session:${user.id}:${sessionData.sessionId}`;
    await redisSet(sessionKey, updatedSessionData, 15 * 60);

    console.log('✅ [SESSION] Sessão atualizada para:', user.email);

    return NextResponse.json({
      success: true,
      message: 'Sessão atualizada com sucesso',
      data: {
        session: {
          sessionId: updatedSessionData.sessionId,
          lastAccess: updatedSessionData.lastAccess,
          deviceInfo: updatedSessionData.deviceInfo,
          ipAddress: updatedSessionData.ipAddress
        }
      }
    });

  } catch (error: any) {
    console.error('💥 [SESSION] Erro ao atualizar:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

/**
 * Criar nova sessão (login alternativo)
 * POST /api/auth/session
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🆕 [SESSION] Criando nova sessão...');

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email e senha são obrigatórios'
      }, { status: 400 });
    }

    // Redirecionar para login padrão
    const loginResponse = await fetch(`${request.nextUrl.origin}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const loginResult = await loginResponse.json();
    return NextResponse.json(loginResult, { status: loginResponse.status });

  } catch (error: any) {
    console.error('💥 [SESSION] Erro ao criar sessão:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

/**
 * Encerrar sessão atual
 * DELETE /api/auth/session
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ [SESSION] Encerrando sessão...');

    const authResult = await validateAuth(request);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: authResult.message
      }, { status: 401 });
    }

    const { user, sessionData, token } = authResult;

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado'
      }, { status: 404 });
    }

    // Adicionar token à blacklist
    if (token) {
      await redisSet(`blacklist:${token}`, true, 15 * 60);
    }

    if (sessionData?.sessionId) {
      // Remover sessão do Redis
      const sessionKey = `session:${user.id}:${sessionData.sessionId}`;
      await redisDel(sessionKey);
    }

    console.log('✅ [SESSION] Sessão encerrada para:', user.email);

    // Criar resposta e limpar cookies
    const response = NextResponse.json({
      success: true,
      message: 'Sessão encerrada com sucesso'
    });

    // Limpar cookies
    response.cookies.delete('authToken');
    response.cookies.delete('token');
    response.cookies.delete('refreshToken');
    response.cookies.delete('sessionId');
    response.cookies.delete('user');

    return response;

  } catch (error: any) {
    console.error('💥 [SESSION] Erro ao encerrar:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}