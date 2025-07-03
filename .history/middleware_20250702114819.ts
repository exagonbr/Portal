import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that should bypass middleware checks
const PUBLIC_ROUTES = [
  '/__nextjs_original-stack-frame',
  '/_next/static/css/',
  '/_next/static/chunks/',
  '/api/health',
  '/favicon.ico'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  // Adicionar headers CORS para desenvolvimento local com backend de produção
  const response = NextResponse.next()
  
  // Headers CORS para permitir comunicação com backend de produção
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  
  // CORREÇÃO CRÍTICA: Apenas interceptar casos específicos de CSS malformado
  if (pathname.includes('/_next/static/css/') && pathname.endsWith('.css')) {
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
    response.headers.set('Content-Type', 'application/javascript; charset=utf-8')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    
    return response
  }
  
  return response
}

export const config = {
  matcher: [
    // Match all routes except public ones
    '/((?!api/health|favicon.ico|_next/static/|__nextjs_original-stack-frame).*)',
  ],
}
