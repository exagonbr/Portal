export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Rate limiting para evitar loops
const requestCounts = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 10000; // 10 segundos
const MAX_REQUESTS_PER_WINDOW = 5; // Máximo 5 requisições por 10 segundos

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'localhost';
  return `queue-next-${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now - record.lastReset > RATE_LIMIT_WINDOW) {
    // Reset ou primeira requisição
    requestCounts.set(key, { count: 1, lastReset: now });
    return { 
      allowed: true, 
      remaining: MAX_REQUESTS_PER_WINDOW - 1, 
      resetTime: now + RATE_LIMIT_WINDOW 
    };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    // Rate limit excedido
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: record.lastReset + RATE_LIMIT_WINDOW 
    };
  }

  // Incrementar contador
  record.count++;
  return { 
    allowed: true, 
    remaining: MAX_REQUESTS_PER_WINDOW - record.count, 
    resetTime: record.lastReset + RATE_LIMIT_WINDOW 
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  // Rate limiting
  const rateLimitKey = getRateLimitKey(request);
  const rateLimit = checkRateLimit(rateLimitKey);

  console.log(`🔄 QUEUE/NEXT REQUEST:`, {
    timestamp: new Date().toISOString(),
    ip: rateLimitKey,
    count: requestCounts.get(rateLimitKey)?.count || 0,
    allowed: rateLimit.allowed
  });

  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
    
    console.warn(`🚨 QUEUE/NEXT RATE LIMITED:`, {
      ip: rateLimitKey,
      retryAfter,
      message: 'Muitas requisições para /api/queue/next'
    });

    return NextResponse.json(
      { 
        success: false, 
        message: 'Rate limit excedido para queue/next',
        retryAfter 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString()
        }
      }
    );
  }

  try {
    const url = `${BACKEND_URL}/queue/next`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      // Timeout para evitar requisições longas
      signal: AbortSignal.timeout(5000)
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    console.log(`✅ QUEUE/NEXT SUCCESS:`, {
      status: response.status,
      duration: `${duration}ms`,
      hasJobs: data?.length > 0
    });

    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error(`❌ QUEUE/NEXT ERROR:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`
    });

    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}