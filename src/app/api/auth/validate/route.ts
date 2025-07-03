import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, MOCK_USERS } from '@/middleware/auth';
import { redisGet } from '@/middleware/auth';

/**
 * Validar token de acesso
 * POST /api/auth/validate
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [VALIDATE] Validando token...');

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token é obrigatório',
        valid: false
      }, { status: 400 });
    }

    // Verificar se o token está na blacklist
    const isBlacklisted = await redisGet(`blacklist:${token}`);
    if (isBlacklisted) {
      console.log('❌ [VALIDATE] Token está na blacklist');
      return NextResponse.json({
        success: false,
        message: 'Token inválido',
        valid: false
      }, { status: 401 });
    }

    // Verificar e decodificar token
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('❌ [VALIDATE] Token inválido ou expirado');
      return NextResponse.json({
        success: false,
        message: 'Token inválido ou expirado',
        valid: false
      }, { status: 401 });
    }

    // Buscar usuário
    const user = MOCK_USERS[decoded.email];
    if (!user || user.status !== 'ACTIVE') {
      console.log('❌ [VALIDATE] Usuário não encontrado ou inativo');
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado ou inativo',
        valid: false
      }, { status: 401 });
    }

    // Verificar se a sessão existe no Redis
    const sessionKey = `session:${user.id}:${decoded.sessionId}`;
    const sessionData = await redisGet(sessionKey);

    if (!sessionData) {
      console.log('❌ [VALIDATE] Sessão não encontrada no Redis');
      return NextResponse.json({
        success: false,
        message: 'Sessão expirada',
        valid: false
      }, { status: 401 });
    }

    console.log('✅ [VALIDATE] Token válido para:', user.email);

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
          avatar: user.avatar,
          status: user.status,
          institutionId: user.institutionId,
          department: user.department
        },
        token: {
          type: decoded.type,
          userId: decoded.userId,
          sessionId: decoded.sessionId,
          iat: decoded.iat,
          exp: decoded.exp,
          expiresAt: new Date(decoded.exp * 1000).toISOString()
        },
        session: {
          sessionId: sessionData.sessionId,
          createdAt: sessionData.createdAt,
          lastAccess: sessionData.lastAccess,
          expiresAt: sessionData.expiresAt,
          isActive: sessionData.isActive
        }
      }
    });

  } catch (error: any) {
    console.error('💥 [VALIDATE] Erro interno:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      valid: false
    }, { status: 500 });
  }
}

/**
 * Validar token via GET (alternativo)
 * GET /api/auth/validate?token=...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      // Tentar extrair do header Authorization
      const authHeader = request.headers.get('authorization');
      const headerToken = authHeader?.replace('Bearer ', '');
      
      if (!headerToken) {
        return NextResponse.json({
          success: false,
          message: 'Token é obrigatório',
          valid: false
        }, { status: 400 });
      }

      // Redirecionar para POST com o token do header
      return POST(request);
    }

    // Simular body para reutilizar a lógica do POST
    const mockRequest = {
      ...request,
      json: async () => ({ token })
    } as NextRequest;

    return POST(mockRequest);

  } catch (error: any) {
    console.error('💥 [VALIDATE-GET] Erro interno:', error);
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
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
