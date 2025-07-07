import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getInternalApiUrl } from '@/config/urls';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'
import { getAuthentication } from '@/lib/auth-utils'


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(request: NextRequest) {
  try {
    // Limpar cookies de autenticação
    const cookieStore = await cookies();
    
    // Lista de cookies para limpar
    const cookiesToClear = [
      'auth_token',
      'refresh_token', 
      'session_id',
      'user_data'
    ];

    cookiesToClear.forEach(cookieName => {
      cookieStore.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
        expires: new Date(0)
      });
    });

    // Obter o token do header da requisição
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const authToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    // Notificar o backend sobre o logout se houver token
    if (authToken) {
      try {
        await fetch(getInternalApiUrl('/auth/logout'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          }
        });
      } catch (error) {
        // Continuamos com o logout mesmo se falhar a comunicação com o backend
      }
    }

    return NextResponse.json(
      { success: true, message: 'Logout realizado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erro ao realizar logout' },
      { status: 500 }
    );
  }
}
