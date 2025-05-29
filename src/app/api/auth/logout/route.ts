import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const sessionId = cookieStore.get('session_id')?.value;

    // Se houver token, notificar o backend sobre o logout
    if (authToken) {
      try {
        await fetch(`${BACKEND_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({ sessionId }),
        });
      } catch (error) {
        console.error('Erro ao notificar backend sobre logout:', error);
        // Continuar com o logout mesmo se falhar a comunicação com o backend
      }
    }

    // Limpar todos os cookies de autenticação
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

    cookiesToClear.forEach(cookieName => {
      cookieStore.delete({
        name: cookieName,
        path: '/',
      });
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
        },
      }
    );
  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao fazer logout' },
      { status: 500 }
    );
  }
}