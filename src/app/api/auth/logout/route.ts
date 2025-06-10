import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const sessionId = cookieStore.get('session_id')?.value;

    console.log('🔄 API: Iniciando logout');

    // Se houver token, notificar o backend sobre o logout
    if (authToken) {
      try {
        console.log('🔄 API: Notificando backend sobre logout');
        const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
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

    // Limpar todos os cookies de autenticação independentemente da resposta do backend
    const cookiesToClear = [
      'auth_token',
      'refresh_token',
      'session_id',
      'user_data',
      'next-auth.session-token',
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token',
    ];

    console.log('🔄 API: Limpando cookies de autenticação');
    cookiesToClear.forEach(cookieName => {
      if (cookieStore.get(cookieName)) {
        cookieStore.delete({
          name: cookieName,
          path: '/',
        });
        console.log(`✅ API: Cookie ${cookieName} removido`);
      }
    });

    return NextResponse.json(
      { success: true, message: 'Logout realizado com sucesso' },
      { 
        status: 200,
        headers: {
          // Adicionar headers para garantir que o cache seja limpo
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Logout-Success': 'true'
        },
      }
    );
  } catch (error) {
    console.error('❌ API: Erro crítico no logout:', error);
    // Mesmo com erro, tentamos limpar os cookies
    try {
      const cookieStore = cookies();
      ['auth_token', 'refresh_token', 'session_id', 'user_data'].forEach(name => {
        cookieStore.delete({
          name,
          path: '/',
        });
      });
    } catch (cookieError) {
      console.error('❌ API: Erro ao limpar cookies após falha:', cookieError);
    }

    return NextResponse.json(
      { success: true, message: 'Logout realizado com sucesso (com erros recuperáveis)' },
      { status: 200 }
    );
  }
}