import { NextRequest, NextResponse } from 'next/server'
import { LRUCache } from 'lru-cache'

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000, // 60 segundos
  })

  return {
    check: (request: NextRequest, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0]
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount)
        }
        tokenCount[0] += 1

        const currentUsage = tokenCount[0]
        const isRateLimited = currentUsage >= limit

        if (isRateLimited) {
          reject(new Error('Rate limit exceeded'))
        } else {
          resolve()
        }
      }),
  }
}

// Configurações específicas por tipo de rota
export const rateLimiters = {
  // APIs públicas - mais restritivas
  public: rateLimit({
    interval: 60 * 1000, // 1 minuto
    uniqueTokenPerInterval: 500,
  }),
  
  // APIs autenticadas - mais permissivas
  authenticated: rateLimit({
    interval: 60 * 1000, // 1 minuto
    uniqueTokenPerInterval: 1000,
  }),
  
  // APIs de upload - muito restritivas
  upload: rateLimit({
    interval: 60 * 60 * 1000, // 1 hora
    uniqueTokenPerInterval: 100,
  }),
  
  // APIs de relatórios - restritivas
  reports: rateLimit({
    interval: 5 * 60 * 1000, // 5 minutos
    uniqueTokenPerInterval: 200,
  }),
}

// Helper para aplicar rate limiting
export async function applyRateLimit(
  request: NextRequest,
  type: keyof typeof rateLimiters = 'authenticated',
  limit: number = 10
): Promise<NextResponse | null> {
  try {
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous'
    await rateLimiters[type].check(request, limit, ip)
    return null
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Muitas requisições. Por favor, tente novamente mais tarde.',
        retryAfter: 60 // segundos
      },
      { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': limit.toString(),
        }
      }
    )
  }
} 