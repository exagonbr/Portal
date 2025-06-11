import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portal.sabercon.com.br/api';

// Simple rate limiting to prevent login loops
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_ATTEMPTS = 5; // Max 5 attempts per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  
  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset if window has passed
  if (now - attempts.lastAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Check if under limit
  if (attempts.count < MAX_ATTEMPTS) {
    attempts.count++;
    attempts.lastAttempt = now;
    return true;
  }
  
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Get client IP for rate limiting
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

    // Check rate limit
    if (!checkRateLimit(ip)) {
      console.warn(`🚫 Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { success: false, message: 'Muitas tentativas de login. Tente novamente em 1 minuto.' },
        { status: 429 }
      );
    }

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