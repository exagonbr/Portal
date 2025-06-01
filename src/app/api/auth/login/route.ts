import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('🔐 Tentativa de login para:', email);

    // Fazer requisição para o backend
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    console.log('📊 Status da resposta do backend:', response.status);
    console.log('📊 Headers da resposta:', Object.fromEntries(response.headers.entries()));
    console.log('📊 Dados retornados do backend:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.log('❌ Resposta não OK do backend');
      return NextResponse.json(
        { success: false, message: data.message || 'Erro ao fazer login' },
        { status: response.status }
      );
    }

    // Verificar se o backend retornou success: true
    if (!data.success) {
      console.log('❌ Backend retornou success: false');
      return NextResponse.json(
        { success: false, message: data.message || 'Falha na autenticação' },
        { status: 200 }
      );
    }

    console.log('✅ Login bem-sucedido no backend, configurando cookies...');

    // Configurar cookies com os tokens recebidos do backend
    const cookieStore = cookies();
    
    // Token de acesso
    if (data.token) {
      cookieStore.set('auth_token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 horas
        path: '/',
      });
    }

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
      id: data.user?.id,
      name: data.user?.name,
      email: data.user?.email,
      role: data.user?.role,
      permissions: data.user?.permissions || [],
    };

    cookieStore.set('user_data', encodeURIComponent(JSON.stringify(userData)), {
      httpOnly: false, // Permitir acesso via JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });

    console.log('✅ Retornando resposta de sucesso para o frontend');

    return NextResponse.json({
      success: true,
      user: userData,
      token: data.token,
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}