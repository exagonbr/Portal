import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, extractDeviceInfo, extractClientIP } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe = false } = body;

<<<<<<< HEAD
    if (!email || !password) {
=======
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
>>>>>>> master
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email e senha são obrigatórios',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

<<<<<<< HEAD
    console.log('🔐 [LOGIN] Tentativa de login:', email);

    // Extrair informações do dispositivo e IP
    const deviceInfo = extractDeviceInfo(request);
    const clientIP = extractClientIP(request);

    console.log('📱 [LOGIN] Device Info:', deviceInfo);
    console.log('🌐 [LOGIN] Client IP:', clientIP);

    // Autenticar usuário com informações de contexto
    const authResult = await authenticateUser(email, password, deviceInfo, clientIP);

    if (!authResult.success) {
      console.log('❌ [LOGIN] Falha na autenticação:', authResult.message);
      return NextResponse.json(
        { 
          success: false, 
          message: authResult.message || 'Credenciais inválidas',
          code: 'AUTHENTICATION_FAILED'
        },
        { status: 401 }
      );
    }

    const { user, accessToken, refreshToken, sessionId, expiresIn } = authResult.data!;

    console.log('✅ [LOGIN] Login realizado com sucesso:', user.email);

    // Criar resposta com cookies
    const response = NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          avatar: user.avatar,
          status: user.status,
          lastLogin: user.lastLogin,
          institutionId: user.institutionId,
          department: user.department
        },
        accessToken,
        token: accessToken, // Manter compatibilidade
        refreshToken,
        sessionId,
        expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      },
      meta: {
        loginTime: new Date().toISOString(),
        sessionDuration: expiresIn,
        rememberMe
      }
    });

    // Configurar cookies com múltiplas estratégias
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/'
=======
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
>>>>>>> master
    };

    const refreshMaxAge = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // 7 dias se rememberMe, senão 1 dia

    // Cookie principal do token de acesso (15 minutos)
    response.cookies.set('token', accessToken, {
      ...cookieOptions,
      maxAge: expiresIn
    });

<<<<<<< HEAD
    // Cookie alternativo para compatibilidade
    response.cookies.set('auth_token', accessToken, {
      ...cookieOptions,
      maxAge: expiresIn
    });

    // Cookie do token de acesso para JavaScript (sem httpOnly)
    response.cookies.set('authToken', accessToken, {
      httpOnly: false, // Permitir acesso via JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: expiresIn
    });

    // Cookie do refresh token (seguro)
    response.cookies.set('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: refreshMaxAge
    });

    // Cookie com informações do usuário (para o frontend)
    response.cookies.set('user', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      avatar: user.avatar,
      status: user.status
    }), {
      httpOnly: false, // Permitir acesso via JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: refreshMaxAge
    });

    // Cookie com sessão ID para rastreamento
    response.cookies.set('sessionId', sessionId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: refreshMaxAge
    });

    // Headers adicionais para compatibilidade
    response.headers.set('X-Auth-Token', accessToken);
    response.headers.set('X-Refresh-Token', refreshToken);
    response.headers.set('X-User-Role', user.role);
    response.headers.set('X-Session-Expires', new Date(Date.now() + expiresIn * 1000).toISOString());

    return response;

  } catch (error: any) {
    console.error('❌ [LOGIN] Erro interno:', error);
=======
    console.log('✅ Retornando resposta de sucesso para o frontend');

    return NextResponse.json({
      success: true,
      user: userData,
      token: data.token,
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
>>>>>>> master
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    { 
      success: true,
      message: 'API de login ativa',
      methods: ['POST', 'OPTIONS'],
      timestamp: new Date().toISOString()
    }
  );
}
