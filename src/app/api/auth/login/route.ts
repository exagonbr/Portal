import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = 'http://localhost:3001/api';

// Advanced rate limiting to prevent login loops
const loginAttempts = new Map<string, { 
  count: number; 
  lastAttempt: number;
  consecutiveFailures: number;
  userIds: Set<string>; // Rastrear diferentes usuários por IP
  emails: Set<string>; // Rastrear diferentes emails por IP
}>();

const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_ATTEMPTS = 5; // Max 5 attempts per minute per IP
const MAX_CONSECUTIVE_FAILURES = 3; // Lock after 3 consecutive failures
const MAX_DIFFERENT_EMAILS = 3; // Suspicious if trying many different emails
const LOCKOUT_DURATION = 300000; // 5 minutes lockout for suspicious activity

// Cache para identificar potenciais loops
const requestCache = new Map<string, {
  lastRequestTime: number;
  intervalSum: number;
  intervalCount: number;
  isLoopSuspected: boolean;
}>();

function detectLoginLoop(ip: string, email: string): boolean {
  const cacheKey = `${ip}:${email}`;
  const now = Date.now();
  const cache = requestCache.get(cacheKey);
  
  if (!cache) {
    requestCache.set(cacheKey, {
      lastRequestTime: now,
      intervalSum: 0,
      intervalCount: 0,
      isLoopSuspected: false
    });
    return false;
  }
  
  // Se já suspeito como loop, continua bloqueando
  if (cache.isLoopSuspected) {
    return true;
  }
  
  const interval = now - cache.lastRequestTime;
  
  // Se as requisições estão ocorrendo muito rapidamente (menos de 300ms entre elas)
  // e de maneira consistente, provavelmente é um loop
  if (interval < 300) {
    cache.intervalSum += interval;
    cache.intervalCount++;
    
    // Se temos pelo menos 3 intervalos medidos, podemos calcular uma média
    if (cache.intervalCount >= 3) {
      const avgInterval = cache.intervalSum / cache.intervalCount;
      
      // Se média de intervalo é muito pequena e consistente (baixo desvio padrão)
      if (avgInterval < 200 && Math.abs(interval - avgInterval) < 50) {
        cache.isLoopSuspected = true;
        console.warn(`⚠️ Login loop suspeito detectado para ${cacheKey} (avg interval: ${avgInterval.toFixed(2)}ms)`);
        return true;
      }
    }
  } else {
    // Resetar medições se intervalo for maior
    cache.intervalSum = 0;
    cache.intervalCount = 0;
  }
  
  cache.lastRequestTime = now;
  return false;
}

function checkRateLimit(ip: string, email: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  
  // Verificar se o IP está em potencial loop
  if (detectLoginLoop(ip, email)) {
    console.warn(`🔄 Login loop detectado para IP: ${ip}, email: ${email}`);
    return false;
  }
  
  if (!attempts) {
    loginAttempts.set(ip, { 
      count: 1, 
      lastAttempt: now,
      consecutiveFailures: 0,
      userIds: new Set(),
      emails: new Set([email])
    });
    return true;
  }
  
  // Verificar bloqueio por falhas consecutivas
  if (attempts.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    const lockoutTime = LOCKOUT_DURATION;
    if (now - attempts.lastAttempt < lockoutTime) {
      return false;
    }
    // Reset após tempo de bloqueio
    attempts.consecutiveFailures = 0;
  }
  
  // Reset se janela de tempo passou
  if (now - attempts.lastAttempt > RATE_LIMIT_WINDOW) {
    attempts.count = 1;
    attempts.lastAttempt = now;
    attempts.emails.add(email);
    return true;
  }
  
  // Verificar se está tentando muitos emails diferentes (potencial ataque)
  attempts.emails.add(email);
  if (attempts.emails.size > MAX_DIFFERENT_EMAILS && attempts.count > MAX_ATTEMPTS) {
    console.warn(`🚫 Muitos emails diferentes tentados do IP: ${ip}`);
    return false;
  }
  
  // Verificar se está dentro do limite
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
    if (!checkRateLimit(ip, email)) {
      console.warn(`🚫 Rate limit exceeded for IP: ${ip}, email: ${email}`);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
          retryAfter: 300 // 5 minutos
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '300',
          }
        }
      );
    }

    // Fazer requisição para o backend
    // Corrigindo o endpoint para v1/auth/login como mostrado no log
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
      // Registrar falha para aumentar contador de falhas consecutivas
      const attempt = loginAttempts.get(ip);
      if (attempt) {
        attempt.consecutiveFailures = (attempt.consecutiveFailures || 0) + 1;
        
        // Adicionar atraso progressivo para falhas consecutivas
        const delaySeconds = Math.min(60, attempt.consecutiveFailures * 5);
        
        console.warn(`❌ Falha de login: ${email} do IP ${ip} (${attempt.consecutiveFailures} falhas consecutivas)`);
        
        return NextResponse.json(
          { 
            success: false, 
            message: data.message || 'Erro ao fazer login',
            retryAfter: delaySeconds
          },
          { 
            status: response.status,
            headers: {
              'Retry-After': delaySeconds.toString()
            }
          }
        );
      }
      
      return NextResponse.json(
        { success: false, message: data.message || 'Erro ao fazer login' },
        { status: response.status }
      );
    }
    
    // Reset contador de falhas quando login bem-sucedido
    const attempt = loginAttempts.get(ip);
    if (attempt) {
      attempt.consecutiveFailures = 0;
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