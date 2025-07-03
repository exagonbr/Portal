import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Configuração simplificada de rotas
const ROUTE_CONFIG = {
  // Rotas completamente públicas (não precisam de verificação)
  PUBLIC_ROUTES: [
    '/',
    '/login',
    '/register', 
    '/forgot-password',
    '/portal',
    '/portal/books',
    '/portal/videos',
    '/portal/courses',
    '/portal/assignments',
    '/portal/dashboard',
    '/portal/student',
    '/portal/reports'
  ],
  
  // Rotas de teste e debug (sempre públicas)
  TEST_ROUTES: [
    '/test-',
    '/debug-',
    '/test-simple',
    '/test-dashboard',
    '/test-student',
    '/test-auth-integration',
    '/test-julia-login',
    '/test-dashboard-simple'
  ],
  
  // Rotas de assets e API (sempre públicas)
  ASSET_ROUTES: [
    '/api',
    '/_next',
    '/favicon.ico',
    '/manifest.json',
    '/icons',
    '/public',
    '/back_video',
    '/handtalk',
    '/kookit'
  ]
} as const;

/**
 * Verifica se uma rota é pública
 */
function isPublicRoute(pathname: string): boolean {
  // Verificar rotas públicas exatas
  if (ROUTE_CONFIG.PUBLIC_ROUTES.includes(pathname as any)) {
    return true;
  }
  
  // Verificar rotas de teste (começam com prefixo)
  if (ROUTE_CONFIG.TEST_ROUTES.some(prefix => pathname.startsWith(prefix))) {
    return true;
  }
  
  // Verificar rotas de assets (começam com prefixo)
  if (ROUTE_CONFIG.ASSET_ROUTES.some(prefix => pathname.startsWith(prefix))) {
    return true;
  }
  
  return false;
}

const isDev = process.env.NODE_ENV === 'development';

/**
 * Middleware principal - Simplificado para evitar loops
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Log apenas para debug quando necessário
  if (isDev) {
    console.log(`🔧 Middleware: ${pathname}`);
  }

  // Se é rota pública, permitir acesso
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Desabilitar cache em desenvolvimento
  if (isDev) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
  } else {
    // Em produção, configurar cache apropriadamente
    if (request.nextUrl.pathname.startsWith('/_next/')) {
      if (request.nextUrl.pathname.includes('/_next/static/')) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }

  return response;
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
};