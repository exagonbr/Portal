import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Criar resposta
  const response = NextResponse.next()

  // Adicionar headers de no-cache agressivos
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  response.headers.set('Surrogate-Control', 'no-store')
  response.headers.set('X-Accel-Expires', '0')
  response.headers.set('X-Cache-Status', 'BYPASS')
  response.headers.set('X-No-Cache', '1')
  
  // Headers adicionais para prevenir cache
  response.headers.set('Vary', 'Cookie, Authorization')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Adicionar timestamp único para evitar cache
  response.headers.set('X-Request-Time', new Date().toISOString())
  response.headers.set('X-Cache-Version', `v${Date.now()}`)
  
  // Para páginas HTML, adicionar meta refresh
  if (request.headers.get('accept')?.includes('text/html')) {
    response.headers.set('X-Robots-Tag', 'noarchive, nosnippet')
  }

  // Headers específicos para API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('X-API-Version', new Date().toISOString())
    response.headers.set('Access-Control-Max-Age', '0')
  }

  // Headers para assets estáticos - permitir cache com versionamento
  if (request.nextUrl.pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2)$/)) {
    // Para assets, usar cache com revalidação
    response.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate')
    response.headers.set('ETag', `"${Date.now()}"`);
  }

  // Headers para Next.js internals
  if (request.nextUrl.pathname.startsWith('/_next/')) {
    // Para build assets do Next.js, permitir cache longo pois têm hash
    if (request.nextUrl.pathname.includes('/_next/static/')) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    } else {
      // Para outros recursos do Next.js, no-cache
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    }
  }

  return response
}

// Configurar em quais rotas o middleware deve rodar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)',
    '/api/:path*',
  ],
}