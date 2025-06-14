import { NextRequest, NextResponse } from 'next/server'
import { LRUCache } from 'lru-cache'

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  })

  return {
    check: (request: NextRequest, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        // DESABILITADO: sempre resolve para evitar loops
        resolve()
      }),
  }
}

// Configurações desabilitadas
export const rateLimiters = {
  public: rateLimit(),
  authenticated: rateLimit(),
  upload: rateLimit(),
  reports: rateLimit(),
}

// Helper DESABILITADO para aplicar rate limiting
export async function applyRateLimit(
  request: NextRequest,
  type: keyof typeof rateLimiters = 'authenticated',
  limit: number = 100
): Promise<NextResponse | null> {
  // COMPLETAMENTE DESABILITADO PARA EVITAR LOOPS
  console.log(`[RATE-LIMIT] DESABILITADO para ${request.url}`);
  return null;
}
