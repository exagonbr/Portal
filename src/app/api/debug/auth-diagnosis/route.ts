export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthentication } from '@/lib/auth-utils';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [AUTH-DIAGNOSIS] Iniciando diagnóstico de autenticação...');
    
    // Coletar informações detalhadas da requisição
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    const xAuthToken = request.headers.get('x-auth-token');
    
    // Extrair cookies individuais
    let cookies: Record<string, string> = {};
    if (cookieHeader) {
      cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          acc[name] = decodeURIComponent(value);
        }
        return acc;
      }, {});
    }
    
    // Tentar autenticação
    const session = await getAuthentication(request);
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      requestInfo: {
        url: request.url,
        method: request.method,
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer')
      },
      authenticationMethods: {
        authorizationHeader: {
          present: !!authHeader,
          value: authHeader ? authHeader.substring(0, 50) + '...' : null,
          hasBearer: authHeader ? authHeader.startsWith('Bearer ') : false,
          length: authHeader ? authHeader.length : 0
        },
        xAuthToken: {
          present: !!xAuthToken,
          value: xAuthToken ? xAuthToken.substring(0, 20) + '...' : null,
          length: xAuthToken ? xAuthToken.length : 0
        },
        cookies: {
          present: !!cookieHeader,
          totalCookies: Object.keys(cookies).length,
          cookieNames: Object.keys(cookies),
          authTokens: {
            auth_token: cookies.auth_token ? {
              present: true,
              length: cookies.auth_token.length,
              value: cookies.auth_token.substring(0, 20) + '...',
              isNull: cookies.auth_token === 'null'
            } : { present: false },
            token: cookies.token ? {
              present: true,
              length: cookies.token.length,
              value: cookies.token.substring(0, 20) + '...',
              isNull: cookies.token === 'null'
            } : { present: false },
            authToken: cookies.authToken ? {
              present: true,
              length: cookies.authToken.length,
              value: cookies.authToken.substring(0, 20) + '...',
              isNull: cookies.authToken === 'null'
            } : { present: false }
          }
        }
      },
      authenticationResult: {
        authenticated: !!session,
        user: session ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          institution_id: session.user.institution_id,
          permissions: session.user.permissions
        } : null
      },
      allHeaders: Object.fromEntries(request.headers.entries()),
      recommendations: [] as string[]
    };
    
    // Adicionar recomendações baseadas no diagnóstico
    if (!session) {
      if (!authHeader && !xAuthToken && !cookieHeader) {
        diagnosis.recommendations.push('CRÍTICO: Nenhum método de autenticação encontrado. Verifique se o frontend está enviando tokens.');
      } else if (authHeader && !authHeader.startsWith('Bearer ')) {
        diagnosis.recommendations.push('ERRO: Authorization header não contém prefixo "Bearer ".');
      } else if (cookies.auth_token === 'null' || cookies.token === 'null') {
        diagnosis.recommendations.push('ERRO: Tokens nos cookies estão definidos como string "null".');
      } else {
        diagnosis.recommendations.push('ERRO: Tokens presentes mas inválidos. Verifique se não expiraram ou se estão corrompidos.');
      }
    } else {
      diagnosis.recommendations.push('✅ Autenticação funcionando corretamente.');
    }
    
    return NextResponse.json({
      success: true,
      diagnosis
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    
  } catch (error) {
    console.error('❌ [AUTH-DIAGNOSIS] Erro durante diagnóstico:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro durante diagnóstico de autenticação',
      details: error instanceof Error ? error.message : String(error)
    }, {
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}