import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('🔍 Login attempt:', { email, BACKEND_URL });

    // Fazer requisição para o backend
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('📡 Backend response:', { status: response.status, data });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Erro ao fazer login' },
        { status: response.status }
      );
    }

    // Configurar cookies com os tokens recebidos do backend
    const cookieStore = cookies();
    
    // Token de acesso - configurado para ser acessível pelo middleware
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

    // Cookie não httpOnly para acesso pelo cliente JavaScript
    cookieStore.set('user_data', JSON.stringify(userData), {
      httpOnly: false, // Permitir acesso via JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });

    // Certificando-se de que os cabeçalhos de resposta incluam os cookies corretamente
    const jsonResponse = NextResponse.json({
      success: true,
      user: userData,
      token: data.token,
    });

    // Adicionando headers para melhorar a compatibilidade com certos navegadores
    jsonResponse.headers.set('Cache-Control', 'no-store, max-age=0');
    jsonResponse.headers.set('X-Auth-Success', 'true');
    
    // Registrar o sucesso da operação
    console.log(`✅ Login bem-sucedido para ${userData.name} (${userData.role})`);
    console.log(`✅ Cookies configurados: auth_token, user_data, ${data.sessionId ? 'session_id, ' : ''}${data.refreshToken ? 'refresh_token' : ''}`);
    
    return jsonResponse;
  } catch (error) {
    console.error('❌ Erro detalhado no login:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}