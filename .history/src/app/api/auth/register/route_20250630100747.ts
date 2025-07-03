import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getInternalApiUrl } from '@/config/env';


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // Validação básica
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Fazer requisição para o backend
    const response = await fetch(`getInternalApiUrl('/api/auth/register')`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Erro ao registrar usuário' },
        { status: response.status }
      );
    }

    // Se o registro foi bem-sucedido e retornou token, configurar cookies
    if (data.token) {
      const cookieStore = await cookies();
      
      // Token de acesso
      cookieStore.set('auth_token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 horas
        path: '/',
      });

      // Token de refresh
      if (data.refreshToken) {
        cookieStore.set('refresh_token', data.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 dias
          path: '/',
        });
      }

      // ID da sessão
      if (data.sessionId) {
        cookieStore.set('session_id', data.sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24, // 24 horas
          path: '/',
        });
      }

      // Dados do usuário (não sensíveis)
      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        permissions: data.user.permissions || [],
      };

      cookieStore.set('user_data', encodeURIComponent(JSON.stringify(userData)), {
        httpOnly: false, // Permitir acesso via JavaScript
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 horas
        path: '/',
      });
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Usuário registrado com sucesso',
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}