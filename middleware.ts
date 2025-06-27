import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // CORREÇÃO ESPECÍFICA: Interceptar arquivos CSS que estão sendo servidos incorretamente
  if (pathname.includes('/_next/static/css/') && pathname.endsWith('.css')) {
    const response = NextResponse.next()
    
    // Forçar o MIME type correto para arquivos CSS
    response.headers.set('Content-Type', 'text/css; charset=utf-8')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    
    return response
  }
  
  // CORREÇÃO: Interceptar requests malformados que tentam carregar CSS como JS
  if (pathname.includes('/_next/static/css/') && !pathname.endsWith('.css')) {
    // Redirecionar para a versão CSS correta
    const correctedUrl = request.nextUrl.clone()
    correctedUrl.pathname = pathname.replace(/\.(js|ts|jsx|tsx)$/, '.css')
    
    return NextResponse.redirect(correctedUrl, 301)
  }
  
  // CORREÇÃO: Verificar se há parâmetros de versão em URLs CSS malformadas
  if (pathname.includes('/_next/static/css/') && request.nextUrl.search.includes('v=')) {
    const response = NextResponse.next()
    
    // Garantir MIME type correto mesmo com parâmetros de versão
    response.headers.set('Content-Type', 'text/css; charset=utf-8')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Vary', 'Accept-Encoding')
    
    return response
  }
  
  // CORREÇÃO: Interceptar chunks JavaScript para garantir MIME type correto
  if (pathname.includes('/_next/static/chunks/') && pathname.endsWith('.js')) {
    const response = NextResponse.next()
    
    response.headers.set('Content-Type', 'application/javascript; charset=utf-8')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    
    return response
  }
  
  // CORREÇÃO: Headers de segurança para todos os arquivos estáticos do Next.js
  if (pathname.startsWith('/_next/')) {
    const response = NextResponse.next()
    
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files - but we want to process CSS files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/image|favicon.ico).*)',
    // Especificamente incluir arquivos CSS para processamento
    '/_next/static/css/:path*',
    '/_next/static/chunks/:path*'
  ],
} 