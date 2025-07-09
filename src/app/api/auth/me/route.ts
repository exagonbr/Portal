import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '../../lib/auth';
import { jwtDecode } from 'jwt-decode';

// Cache para rate limiting
const requestCounts = new Map<string, { count: number; lastReset: number; blockedUntil?: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 5; // Máximo 5 tentativas por minuto (reduzido de 10)
const BLOCK_DURATION = 60000; // 60 segundos de bloqueio (aumentado de 30 segundos)

// Detecta loops de requisição
function detectLoop(ip: string | undefined, userAgent: string | undefined): boolean {
  const safeIp = ip || 'unknown';
  const safeUserAgent = userAgent || 'unknown';
  const key = `${safeIp}:${safeUserAgent}`;
  const now = Date.now();
  
  if (!requestCounts.has(key)) {
    requestCounts.set(key, { count: 1, lastReset: now });
    return false;
  }
  
  const record = requestCounts.get(key)!;
  
  // Verificar se está bloqueado
  if (record.blockedUntil && record.blockedUntil > now) {
    return true;
  }
  
  // Reset contador se passou o tempo da janela
  if (now - record.lastReset > RATE_LIMIT_WINDOW) {
    record.count = 1;
    record.lastReset = now;
    return false;
  }
  
  // Incrementar contador
  record.count += 1;
  
  // Verificar se excedeu o limite
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    record.blockedUntil = now + BLOCK_DURATION;
    return true;
  }
  
  return false;
}

// Limpa entradas antigas do cache periodicamente
function cleanupCache() {
  const now = Date.now();
  // Usar Array.from para converter o iterador para array antes de iterar
  Array.from(requestCounts.entries()).forEach(([key, record]) => {
    if (now - record.lastReset > RATE_LIMIT_WINDOW * 5) {
      requestCounts.delete(key);
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    // Limpar cache periodicamente
    cleanupCache();
    
    // Obter IP e User-Agent para rate limiting
    const ipHeader = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const ip = String(ipHeader);
    const userAgent = String(request.headers.get('user-agent') || 'unknown');
    
    // Verificar rate limiting
    if (detectLoop(ip, userAgent)) {
      console.warn(`🚨 [AUTH-ME] Possível loop detectado: ${ip} - ${userAgent}`);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Muitas requisições. Tente novamente mais tarde.',
          code: 'RATE_LIMITED'
        },
        { status: 429 }
      );
    }
    
    // Autenticar a requisição
    const auth = await authenticate(request);
    
    if (!auth || !auth.isAuthenticated) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Não autenticado',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }
    
    // Verificar se o token é válido decodificando-o novamente
    try {
      const token = auth.accessToken;
      const decoded = jwtDecode<any>(token);
      
      // Verificar se o token está expirado
      if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Token expirado',
            code: 'TOKEN_EXPIRED'
          },
          { status: 401 }
        );
      }
      
      // Retornar dados do usuário
      return NextResponse.json({
        success: true,
        data: {
          user: auth.user,
          permissions: decoded.permissions || []
        }
      });
    } catch (error) {
      console.error('❌ [AUTH-ME] Erro ao decodificar token:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token inválido',
          code: 'INVALID_TOKEN'
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('❌ [AUTH-ME] Erro interno:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
} 