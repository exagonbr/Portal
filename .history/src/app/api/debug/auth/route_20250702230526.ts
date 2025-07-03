import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';

/**
 * Debug endpoint para verificar informações de autenticação
 * GET /api/debug/auth
 */
export async function GET(request: NextRequest) {
  try {
    // Extrair token de diferentes fontes
    const authHeader = request.headers.get('authorization');
    const xAuthToken = request.headers.get('x-auth-token');
    const cookieHeader = request.headers.get('cookie');
    
    let bearerToken = null;
    let cookieTokens = {};
    
    // Extrair Bearer token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      bearerToken = authHeader.substring(7);
    }
    
    // Extrair tokens dos cookies
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);
      
      cookieTokens = {
        auth_token: cookies.auth_token,
        token: cookies.token,
        authToken: cookies.authToken,
        sessionId: cookies.sessionId
      };
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      headers: {
        authorization: authHeader ? `${authHeader.substring(0, 20)}...` : null,
        'x-auth-token': xAuthToken ? `${xAuthToken.substring(0, 20)}...` : null,
        'user-agent': request.headers.get('user-agent'),
        'content-type': request.headers.get('content-type'),
        'accept': request.headers.get('accept')
      },
      tokens: {
        bearerToken: bearerToken ? {
          present: true,
          length: bearerToken.length,
          preview: `${bearerToken.substring(0, 20)}...`,
          format: bearerToken.includes('.') ? 'JWT-like' : 'opaque'
        } : null,
        xAuthToken: xAuthToken ? {
          present: true,
          length: xAuthToken.length,
          preview: `${xAuthToken.substring(0, 20)}...`
        } : null,
        cookies: Object.keys(cookieTokens).reduce((acc, key) => {
          const value = cookieTokens[key];
          if (value) {
            acc[key] = {
              present: true,
              length: value.length,
              preview: `${value.substring(0, 20)}...`
            };
          }
          return acc;
        }, {} as Record<string, any>)
      },
      validation: {
        hasAnyToken: !!(bearerToken || xAuthToken || Object.values(cookieTokens).some(Boolean)),
        tokenSources: []
      }
    };

    // Identificar fontes de token disponíveis
    if (bearerToken) debugInfo.validation.tokenSources.push('Bearer Authorization');
    if (xAuthToken) debugInfo.validation.tokenSources.push('X-Auth-Token Header');
    if (cookieTokens.auth_token) debugInfo.validation.tokenSources.push('auth_token Cookie');
    if (cookieTokens.token) debugInfo.validation.tokenSources.push('token Cookie');
    if (cookieTokens.authToken) debugInfo.validation.tokenSources.push('authToken Cookie');

    // Tentar validar o token principal
    const primaryToken = bearerToken || xAuthToken || cookieTokens.auth_token || cookieTokens.token || cookieTokens.authToken;
    
    if (primaryToken) {
      try {
        const tokenValidation = await verifyToken(primaryToken);
        debugInfo.validation.tokenValid = true;
        debugInfo.validation.tokenPayload = {
          userId: tokenValidation.userId,
          email: tokenValidation.email,
          role: tokenValidation.role,
          institutionId: tokenValidation.institutionId,
          exp: tokenValidation.exp,
          iat: tokenValidation.iat
        };
        debugInfo.validation.tokenExpiry = tokenValidation.exp ? 
          new Date(tokenValidation.exp * 1000).toISOString() : null;
        debugInfo.validation.tokenAge = tokenValidation.iat ? 
          Math.floor((Date.now() / 1000) - tokenValidation.iat) : null;
      } catch (error) {
        debugInfo.validation.tokenValid = false;
        debugInfo.validation.tokenError = error instanceof Error ? error.message : 'Erro desconhecido';
      }
    }

    // Informações da requisição
    debugInfo.request = {
      method: request.method,
      url: request.url,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer')
    };

    return NextResponse.json({
      success: true,
      message: 'Informações de debug de autenticação',
      data: debugInfo
    });

  } catch (error) {
    console.error('Erro no debug de autenticação:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro no debug de autenticação',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
