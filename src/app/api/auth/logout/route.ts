import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001/api';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const sessionId = cookieStore.get('session_id')?.value;

    console.log('🔄 API: Iniciando logout completo');

    // 1. Se houver token, notificar o backend sobre o logout
    if (authToken) {
      try {
        console.log('🔄 API: Notificando backend sobre logout');
        const response = await fetch(`${BACKEND_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({ sessionId }),
        });

        if (response.ok) {
          console.log('✅ API: Backend notificado sobre logout com sucesso');
        } else {
          // Se o backend retornar 401, isso é esperado em alguns casos (token expirado)
          // e não devemos tratar como erro crítico
          if (response.status === 401) {
            console.log('⚠️ API: Token já expirado durante logout (esperado)');
          } else {
            console.warn(`⚠️ API: Resposta inesperada do backend durante logout: ${response.status}`);
          }
          // Continuamos com o processo de logout de qualquer forma
        }
      } catch (error) {
        console.error('⚠️ API: Erro ao notificar backend sobre logout:', error);
        // Continuamos com o logout mesmo se falhar a comunicação com o backend
      }
    } else {
      console.log('ℹ️ API: Sem token de autenticação para enviar ao backend');
    }

    // 2. Invalidar sessão no Redis se houver sessionId
    if (sessionId) {
      try {
        console.log('🔄 API: Invalidando sessão no Redis');
        const redisResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sessions/invalidate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (redisResponse.ok) {
          console.log('✅ API: Sessão Redis invalidada com sucesso');
        } else {
          console.warn('⚠️ API: Erro ao invalidar sessão no Redis');
        }
      } catch (redisError) {
        console.error('⚠️ API: Erro ao invalidar sessão no Redis:', redisError);
        // Continua mesmo se falhar
      }
    }

    // 3. Limpar todos os cookies de autenticação independentemente da resposta do backend
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

    console.log('🔄 API: Limpando cookies de autenticação');
    
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
      
      console.log(`✅ API: Cookie ${cookieName} removido`);
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