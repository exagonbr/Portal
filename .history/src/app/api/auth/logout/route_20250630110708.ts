import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createCorsOptionsResponse } from '../../../../config/cors';
import { getInternalApiUrl } from '../../../../config/env';


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 LOGOUT: Iniciando processo de logout');
    
    // Limpar todos os cookies relacionados à autenticação
    const cookieStore = await cookies();
    
    // Lista de cookies para limpar
    const cookiesToClear = [
      'auth_token',
      'refresh_token', 
      'session_id',
      'user_data',
      'authToken', // fallback names
      'token',
      'sessionId'
    ];

    cookiesToClear.forEach(cookieName => {
      cookieStore.set(cookieName, '', {
        httpOnly: false, // Para user_data que precisa ser acessível via JS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
        expires: new Date(0)
      });
      
      // Também limpar versão httpOnly
      cookieStore.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
        expires: new Date(0)
      });
    });

    const authToken = cookieStore.get('auth_token')?.value;
    const sessionId = cookieStore.get('session_id')?.value;

    // 1. Se houver token, notificar o backend sobre o logout
    if (authToken) {
      try {
        const response = await fetch(getInternalApiUrl('/api/auth/optimized/logout'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok && response.status !== 401) {
          console.warn(`⚠️ API: Resposta inesperada do backend durante logout: ${response.status}`);
        }
      } catch (error) {
        console.error('⚠️ API: Erro ao notificar backend sobre logout:', error);
        // Continuamos com o logout mesmo se falhar a comunicação com o backend
      }
    }

    // Criar resposta antes de limpar cookies
    const response = NextResponse.json(
      { success: true, message: 'Logout realizado com sucesso' },
      { 
        status: 200,
        headers: {
          // Adicionar headers para garantir que o cache seja limpo
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Logout-Success': 'true',
          'X-Clear-All-Data': 'true'
        },
      }
    );

    // Limpar cookies na resposta
    cookiesToClear.forEach(cookieName => {
      // Limpar para diferentes configurações
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Limpar também com httpOnly true para cookies que podem ter sido definidos assim
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Em produção, limpar também para domínio específico se necessário
      if (process.env.NODE_ENV === 'production' && process.env.COOKIE_DOMAIN) {
        response.cookies.set(cookieName, '', {
          expires: new Date(0),
          path: '/',
          domain: process.env.COOKIE_DOMAIN,
          httpOnly: false,
          secure: true,
          sameSite: 'lax'
        });
      }
    });

    return response;
  } catch (error) {
    console.error('❌ API: Erro crítico no logout:', error);
    
    // Mesmo com erro, tentamos limpar os cookies
    const errorResponse = NextResponse.json(
      { success: true, message: 'Logout realizado com sucesso (com erros recuperáveis)' },
      { 
        status: 200,
        headers: {
          'X-Logout-Success': 'true',
          'X-Clear-All-Data': 'true'
        }
      }
    );
    
    // Limpar cookies mesmo em caso de erro
    const cookiesToClear = ['auth_token', 'refresh_token', 'session_id', 'user_data', 'redirect_count'];
    cookiesToClear.forEach(cookieName => {
      errorResponse.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });

    return errorResponse;
  }
}