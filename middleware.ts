import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // CORREÇÃO CRÍTICA: Apenas interceptar casos específicos de CSS malformado
  if (pathname.includes('/_next/static/css/') && pathname.endsWith('.css')) {
    const response = NextResponse.next()
    
    // Garantir MIME type correto para arquivos CSS
    response.headers.set('Content-Type', 'text/css; charset=utf-8')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    
    return response
  }
  
  // CORREÇÃO: Detectar tentativas de carregar CSS como JavaScript
  if (pathname.includes('/_next/static/css/') && !pathname.endsWith('.css')) {
    console.warn('🔄 Detectado request CSS malformado:', pathname)
    
    // Redirecionar para a versão CSS correta se possível
    if (pathname.includes('.js') || pathname.includes('.ts')) {
      const correctedUrl = request.nextUrl.clone()
      correctedUrl.pathname = pathname.replace(/\.(js|ts|jsx|tsx)$/, '.css')
      
      return NextResponse.redirect(correctedUrl, 301)
    }
  }
  
  // CORREÇÃO: Garantir MIME type correto para chunks JavaScript
  if (pathname.includes('/_next/static/chunks/') && pathname.endsWith('.js')) {
    const response = NextResponse.next()
    
    response.headers.set('Content-Type', 'application/javascript; charset=utf-8')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Apenas interceptar arquivos estáticos específicos que podem ter problemas
    '/_next/static/css/:path*',
    '/_next/static/chunks/:path*'
  ],
} 