import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Redis from 'ioredis';

// Configuração do Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe = false } = body;

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email e senha são obrigatórios'
        },
        { status: 400 }
      );
    }

    // URL do backend baseada nas variáveis de ambiente
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://127.0.0.1:3001/api';
    const loginUrl = `${backendUrl}/auth/login`;

    console.log('🔐 [LOGIN-API] Tentativa de login para:', email);
    console.log('🔗 [LOGIN-API] URL do backend:', loginUrl);

    // Fazer requisição para o backend
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    console.log('📡 [LOGIN-API] Resposta do backend:', {
      status: response.status,
      success: data.success,
      hasToken: !!data.data?.accessToken
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Erro ao fazer login',
          details: data
        },
        { status: response.status }
      );
    }

    // Extrair dados do login
    const { accessToken, user } = data.data;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Configurar tempos de expiração
    const accessTokenExpiry = rememberMe ? 7 * 24 * 60 * 60 : 60 * 60; // 7 dias ou 1 hora
    const refreshTokenExpiry = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 dias ou 7 dias
    
    // Gerar refresh token
    const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

    // Salvar sessão no Redis
    const sessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      institutionId: user.institutionId,
      accessToken,
      refreshToken,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      rememberMe,
      userAgent: request.headers.get('user-agent') || '',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    };

    try {
      // Salvar sessão principal
      await redis.setex(`session:${sessionId}`, accessTokenExpiry, JSON.stringify(sessionData));
      
      // Salvar refresh token
      await redis.setex(`refresh:${refreshToken}`, refreshTokenExpiry, JSON.stringify({
        sessionId,
        userId: user.id,
        email: user.email
      }));

      // Salvar índice por usuário (para logout de todas as sessões)
      await redis.sadd(`user_sessions:${user.id}`, sessionId);
      await redis.expire(`user_sessions:${user.id}`, refreshTokenExpiry);

      console.log('✅ [LOGIN-API] Sessão salva no Redis:', sessionId);
    } catch (redisError) {
      console.error('❌ [LOGIN-API] Erro ao salvar no Redis:', redisError);
      // Continuar mesmo com erro do Redis
    }

    // Criar resposta com cookies seguros
    const response_obj = NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          institutionId: user.institutionId
        },
        sessionId,
        expiresIn: accessTokenExpiry,
        rememberMe
      }
    });

    // Configurar cookies seguros
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: accessTokenExpiry
    };

    const refreshCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: refreshTokenExpiry
    };

    // Definir cookies
    response_obj.cookies.set('auth_token', accessToken, cookieOptions);
    response_obj.cookies.set('refresh_token', refreshToken, refreshCookieOptions);
    response_obj.cookies.set('session_id', sessionId, cookieOptions);
    response_obj.cookies.set('user_role', user.role, { ...cookieOptions, httpOnly: false });

    return response_obj;

  } catch (error: any) {
    console.log('❌ [LOGIN-API] Erro no login:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        details: {
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      success: true,
      message: 'API de login customizada ativa',
      timestamp: new Date().toISOString()
    }
  );
}
