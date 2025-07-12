import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// FIXED: Extended public routes to prevent middleware loops
const PUBLIC_ROUTES = [
  '/__nextjs_original-stack-frame',
  '/_next/static/',
  '/_next/image',
  '/_next/webpack-hmr',
  '/_vercel/insights',
  '/api/health',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml'
]

// FIXED: Add debug routes and development-specific routes
const DEV_ROUTES = [
  '/_next/static/css/',
  '/_next/static/chunks/',
  '/_next/static/media/',
  '/__webpack_hmr',
  '/_next/webpack-hmr',
  '/debug-',
  '/test-'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Handle CORS for static files
  if (pathname.includes('/favicon.ico') || pathname.startsWith('/_next/') || pathname.startsWith('/public/')) {
    const response = NextResponse.next()
    response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin')
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }

  // FIXED: Skip middleware for all public routes and dev routes
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  const isDevRoute = process.env.NODE_ENV === 'development' && 
                     DEV_ROUTES.some(route => pathname.startsWith(route))
  
  if (isPublicRoute || isDevRoute) {
    return NextResponse.next()
  }

  // FIXED: Prevent infinite redirects by checking if we're already processing this request
  const isProcessed = request.headers.get('x-middleware-processed')
  if (isProcessed) {
    return NextResponse.next()
  }
  
  // Adicionar headers CORS para desenvolvimento local com backend de produção
  const response = NextResponse.next()
  
  // FIXED: Add processing header to prevent loops
  response.headers.set('x-middleware-processed', 'true')
  
  // Headers CORS para permitir comunicação com backend de produção
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  
  // FIXED: Improved CSS handling to prevent malformed requests
  if (pathname.includes('/_next/static/css/')) {
    if (pathname.endsWith('.css')) {
      // Garantir MIME type correto para arquivos CSS
      response.headers.set('Content-Type', 'text/css; charset=utf-8')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      return response
    } else if (!pathname.endsWith('.css.map')) {
      // FIXED: Only redirect if it's clearly a malformed CSS request
      console.warn('🔄 Detectado request CSS malformado:', pathname)
      
      // Try to fix the URL by ensuring it ends with .css
      if (pathname.includes('.js') || pathname.includes('.ts')) {
        const correctedUrl = request.nextUrl.clone()
        correctedUrl.pathname = pathname.replace(/\.(js|ts|jsx|tsx)$/, '.css')
        
        return NextResponse.redirect(correctedUrl, 302) // Use 302 instead of 301 for development
      }
    }
  }
  
  // FIXED: Better handling of JavaScript chunks
  if (pathname.includes('/_next/static/chunks/') && pathname.endsWith('.js')) {
    response.headers.set('Content-Type', 'application/javascript; charset=utf-8')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return response
  }

  // FIXED: Handle source maps
  if (pathname.endsWith('.map')) {
    response.headers.set('Content-Type', 'application/json')
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return response
  }

  return response
}

export const config = {
  matcher: [
    // FIXED: More precise matcher to avoid processing internal Next.js routes
    '/((?!api/health|favicon.ico|robots.txt|sitemap.xml|_next/static/|_next/image|__nextjs_original-stack-frame|_vercel).*)',
  ],
}
