import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_CONFIG } from '@/config/constants';

// Rate limiting inteligente para evitar loops
const requestCounts = new Map<string, { count: number; lastReset: number; lastRequest: number; pattern: string[]; consecutiveRequests: number; blockedUntil?: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 20; // Aumentado para 20 tentativas por minuto
const PATTERN_DETECTION_WINDOW = 5000; // 5 segundos para detectar padrões
const MAX_CONSECUTIVE_REQUESTS = 12; // Máximo 12 requisições consecutivas muito rápidas
const MIN_REQUEST_INTERVAL = 300; // Mínimo 300ms entre requisições para não ser considerado loop

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `login_${ip}_${userAgent.substring(0, 50)}`;
}

function createRequestPattern(request: NextRequest): string {
  const referer = request.headers.get('referer') || '';
  const origin = request.headers.get('origin') || '';
  return `${referer}_${origin}`;
}

function checkRateLimit(key: string, pattern: string): { allowed: boolean; remaining: number; reason?: string } {
  const now = Date.now();
  const record = requestCounts.get(key);
  
  // Verificar se ainda está bloqueado
  if (record?.blockedUntil && now < record.blockedUntil) {
    const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      reason: `Aguarde ${remainingSeconds} segundos antes de tentar novamente.`
    };
  }
  
  // Limpar registros antigos automaticamente
  if (requestCounts.size > 1000) {
    const cutoff = now - (RATE_LIMIT_WINDOW * 2);
    for (const [k, v] of Array.from(requestCounts.entries())) {
      if (v.lastReset < cutoff) {
        requestCounts.delete(k);
      }
    }
  }
  
  if (!record || now - record.lastReset > RATE_LIMIT_WINDOW) {
    requestCounts.set(key, { 
      count: 1, 
      lastReset: now, 
      lastRequest: now,
      pattern: [pattern],
      consecutiveRequests: 1
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }
  
  // Detectar padrões suspeitos (possível loop)
  const timeSinceLastRequest = now - record.lastRequest;
  record.lastRequest = now;
  
  // Lógica mais inteligente para detectar loops
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    // Requisições muito rápidas - incrementar contador consecutivo
    record.consecutiveRequests++;
    
    // Verificar se é realmente um loop suspeito
    const isVeryFast = timeSinceLastRequest < 100; // Menos de 100ms é muito suspeito
    const isSuspiciousPattern = record.consecutiveRequests >= MAX_CONSECUTIVE_REQUESTS;
    const hasHighFrequency = record.count > 10 && timeSinceLastRequest < 200;
    
          // Só bloquear se for realmente suspeito
      if (isSuspiciousPattern && (isVeryFast || hasHighFrequency)) {
        console.warn(`🚨 LOOP DETECTADO para ${key}:`, {
          consecutiveRequests: record.consecutiveRequests,
          timeBetweenRequests: timeSinceLastRequest,
          totalRequests: record.count,
          isVeryFast,
          hasHighFrequency
        });
        
        // Bloquear por 10 segundos
        record.blockedUntil = now + 10000;
        
        return { 
          allowed: false, 
          remaining: 0, 
          reason: 'Loop de requisições detectado. Aguarde 10 segundos antes de tentar novamente.' 
        };
      }
  } else {
    // Requisição com intervalo normal - resetar contador consecutivo
    record.consecutiveRequests = Math.max(1, record.consecutiveRequests - 1);
  }
  
  // Adicionar padrão para análise adicional
  record.pattern.push(pattern);
  if (record.pattern.length > 15) {
    record.pattern = record.pattern.slice(-15);
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { 
      allowed: false, 
      remaining: 0,
      reason: 'Muitas tentativas de login. Aguarde 1 minuto antes de tentar novamente.'
    };
  }
  
  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const referer = request.headers.get('referer') || 'unknown';
  const origin = request.headers.get('origin') || 'unknown';
  
  console.log(`🔐 LOGIN REQUEST START:`, {
    timestamp: new Date().toISOString(),
    userAgent: userAgent.substring(0, 100),
    referer,
    origin,
    method: request.method,
    url: request.url
  });

  // Rate limiting inteligente
  const rateLimitKey = getRateLimitKey(request);
  const requestPattern = createRequestPattern(request);
  const rateLimit = checkRateLimit(rateLimitKey, requestPattern);
  
  if (!rateLimit.allowed) {
    console.log(`🚫 RATE LIMIT EXCEEDED for ${rateLimitKey}:`, rateLimit.reason);
    
    // Se foi detectado um loop, aplicar timeout menor
    const retryAfter = rateLimit.reason?.includes('Loop') ? 10 : 60;
    
    return NextResponse.json(
      { 
        success: false, 
        message: rateLimit.reason || 'Muitas tentativas de login. Aguarde antes de tentar novamente.',
        retryAfter,
        isLoop: rateLimit.reason?.includes('Loop') || false
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Remaining': '0',
          'X-Loop-Detected': rateLimit.reason?.includes('Loop') ? 'true' : 'false'
        }
      }
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    console.log(`🔐 LOGIN ATTEMPT:`, {
      email: email ? email.substring(0, 3) + '***' : 'missing',
      hasPassword: !!password,
      passwordLength: password ? password.length : 0
    });

    // Validação básica
    if (!email || !password) {
      console.log(`🚫 LOGIN VALIDATION FAILED: Missing credentials`);
      return NextResponse.json(
        { success: false, message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Tentar fazer requisição para o backend
    let data;
    let response;
    
    try {
      console.log(`🌐 BACKEND REQUEST: Tentando ${API_CONFIG.BASE_URL}/auth/login`);
      
      response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(10000), // 10 segundos timeout
      });

      console.log(`🌐 BACKEND RESPONSE:`, {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type')
      });

      // Verificar se a resposta é JSON válido
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend retornou resposta não-JSON');
      }

      data = await response.json();
      console.log(`🌐 BACKEND DATA:`, { success: data.success, hasUser: !!data.user });
      
    } catch (backendError) {
      console.error('🚫 BACKEND ERROR:', backendError);
      
      // Fallback: Autenticação local para desenvolvimento/teste
      const mockUsers = {
        'admin@sabercon.edu.br': {
          password: 'password123',
          user: {
            id: 'admin',
            name: 'Administrador',
            email: 'admin@sabercon.edu.br',
            role: 'SYSTEM_ADMIN',
            permissions: ['all'],
            institutionId: 'inst_sabercon'
          }
        },
        'gestor@sabercon.edu.br': {
          password: 'password123',
          user: {
            id: 'gestor',
            name: 'Gestor Institucional',
            email: 'gestor@sabercon.edu.br',
            role: 'INSTITUTION_ADMIN',
            permissions: ['manage_institution'],
            institutionId: 'inst_sabercon'
          }
        },
        'coordenador@sabercon.edu.br': {
          password: 'password123',
          user: {
            id: 'coordenador',
            name: 'Coordenador Acadêmico',
            email: 'coordenador@sabercon.edu.br',
            role: 'ACADEMIC_COORDINATOR',
            permissions: ['manage_courses'],
            institutionId: 'inst_sabercon'
          }
        },
        'professor@sabercon.edu.br': {
          password: 'password123',
          user: {
            id: 'professor',
            name: 'Professor',
            email: 'professor@sabercon.edu.br',
            role: 'TEACHER',
            permissions: ['manage_classes'],
            institutionId: 'inst_sabercon'
          }
        },
        'estudante@sabercon.edu.br': {
          password: 'password123',
          user: {
            id: 'estudante',
            name: 'Estudante',
            email: 'estudante@sabercon.edu.br',
            role: 'STUDENT',
            permissions: ['view_content'],
            institutionId: 'inst_sabercon'
          }
        }
      };

      const mockUser = mockUsers[email as keyof typeof mockUsers];
      
      if (mockUser && mockUser.password === password) {
        console.log(`✅ FALLBACK LOGIN SUCCESS for ${email}`);
        
        // Gerar token mock JWT-like
        const mockToken = Buffer.from(JSON.stringify({
          userId: mockUser.user.id,
          email: mockUser.user.email,
          name: mockUser.user.name,
          role: mockUser.user.role,
          institutionId: mockUser.user.institutionId,
          permissions: mockUser.user.permissions,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
        })).toString('base64');

        data = {
          success: true,
          token: mockToken,
          user: mockUser.user,
          message: 'Login realizado com sucesso (modo fallback - backend indisponível)'
        };
        response = { ok: true, status: 200 };
      } else {
        console.log(`🚫 FALLBACK LOGIN FAILED for ${email}`);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Credenciais inválidas ou servidor temporariamente indisponível.',
            details: backendError instanceof Error ? backendError.message : 'Erro desconhecido'
          },
          { status: 401 }
        );
      }
    }

    if (!response.ok) {
      console.log(`🚫 LOGIN FAILED:`, { status: response.status, message: data.message });
      return NextResponse.json(
        { success: false, message: data.message || 'Erro ao fazer login' },
        { status: response.status }
      );
    }

    // Configurar cookies com os tokens recebidos do backend
    const cookieStore = cookies();
    
    console.log(`🍪 SETTING COOKIES for user ${data.user.email}`);
    
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

    const duration = Date.now() - startTime;
    console.log(`✅ LOGIN SUCCESS:`, {
      email: data.user.email,
      role: data.user.role,
      duration: `${duration}ms`,
      rateLimitRemaining: rateLimit.remaining
    });

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: userData,
      redirectTo: data.redirectTo || '/dashboard'
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString()
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('💥 LOGIN ERROR:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}