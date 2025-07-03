import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, redisGet, MOCK_USERS } from '@/middleware/auth';

/**
 * Obter informações da sessão atual
 * POST /api/auth/session
 */
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token de acesso requerido'
      }, { status: 401 });
    }

    // Verificar token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: 'Token inválido ou expirado'
      }, { status: 401 });
    }

    // Buscar usuário
    const user = MOCK_USERS[decoded.email];
    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      }, { status: 401 });
    }

    // Verificar se a sessão existe no Redis
    const sessionKey = `session:${user.id}:${decoded.sessionId}`;
    const sessionData = await redisGet(sessionKey);
    
    if (!sessionData) {
      return NextResponse.json({
        success: false,
        message: 'Sessão expirada'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: 'Sessão válida',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          status: user.status,
          avatar: user.avatar,
          lastLogin: user.lastLogin,
          institutionId: user.institutionId,
          department: user.department
        },
        session: {
          sessionId: decoded.sessionId,
          expiresAt: new Date(decoded.exp * 1000).toISOString(),
          createdAt: sessionData.createdAt,
          lastAccess: sessionData.lastAccess,
          deviceInfo: sessionData.deviceInfo,
          ipAddress: sessionData.ipAddress
        }
      }
    });

  } catch (error) {
    console.error('Erro ao obter sessão:', error);
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
  return NextResponse.json({}, { status: 204 });
}