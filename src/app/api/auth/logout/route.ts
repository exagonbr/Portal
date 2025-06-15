import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001/api';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const sessionId = cookieStore.get('session_id')?.value;

    // 1. Se houver token, notificar o backend sobre o logout
    if (authToken) {
      try {
        const response = await fetch(`${BACKEND_URL}/auth/logout`, {
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

    // 2. Limpar todos os cookies de autenticação independentemente da resposta do backend
    const cookiesToClear = [
      'auth_token',
      'refresh_token',
      'session_id',
      'user_data',
      'next-auth.session-token',
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token',
      'redirect_count', // Limpar contador de redirecionamentos
    ];
    
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