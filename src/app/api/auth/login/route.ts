import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Get client IP for logging
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    console.log('🔍 Login attempt:', {
      email,
      BACKEND_URL,
      ip,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      origin: request.headers.get('origin'),
      timestamp: new Date().toISOString()
    });

    // Fazer requisição para o backend
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('📡 Backend response:', { status: response.status, data });

    if (!response.ok) {
      console.warn(`❌ Falha de login: ${email} do IP ${ip}`);
      
      return NextResponse.json(
        { success: false, message: data.message || 'Erro ao fazer login' },
        { status: response.status }
      );
    }

    console.log(`✅ Login bem-sucedido: ${email} do IP ${ip}`);

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

    console.log('✅ Cookies configurados com sucesso');

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: userData,
      redirectTo: data.redirectTo || '/dashboard'
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}