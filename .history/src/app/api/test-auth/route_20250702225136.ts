import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, MOCK_USERS } from '@/middleware/auth';

/**
 * Testar autenticação
 * GET /api/test-auth
 */
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request);
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token não fornecido',
        authenticated: false,
        methods: {
          bearer: false,
          xAuthToken: false,
          cookie: false,
          queryParam: false
        },
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: 'Token inválido ou expirado',
        authenticated: false,
        token: {
          provided: true,
          valid: false,
          expired: true
        },
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    const user = MOCK_USERS[decoded.email];
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado',
        authenticated: false,
        token: {
          provided: true,
          valid: true,
          userExists: false
        },
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    // Determinar método de autenticação usado
    const authHeader = request.headers.get('authorization');
    const xAuthToken = request.headers.get('x-auth-token');
    const cookieHeader = request.headers.get('cookie');
    const url = new URL(request.url);
    const tokenParam = url.searchParams.get('token');

    let authMethod = 'unknown';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authMethod = 'bearer';
    } else if (xAuthToken) {
      authMethod = 'x-auth-token';
    } else if (cookieHeader && cookieHeader.includes('token=')) {
      authMethod = 'cookie';
    } else if (tokenParam) {
      authMethod = 'query-param';
    }

    return NextResponse.json({
      success: true,
      message: 'Autenticação válida',
      authenticated: true,
      authMethod,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        status: user.status
      },
      token: {
        provided: true,
        valid: true,
        type: decoded.type,
        issuedAt: new Date(decoded.iat * 1000).toISOString(),
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
        sessionId: decoded.sessionId
      },
      request: {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        method: request.method,
        url: request.url
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro no teste de autenticação:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
