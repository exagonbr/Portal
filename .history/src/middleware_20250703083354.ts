/**
 * Middleware Simplificado para Portal Sabercon
 * Focado apenas nas rotas essenciais que precisam de proteção
 */

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

/**
 * Middleware principal - Simplificado para evitar loops
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Log apenas para debug quando necessário
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔧 Middleware: ${pathname}`);
  }

  // Se é rota pública, permitir acesso
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Para todas as outras rotas, a proteção é feita pelos componentes do lado do cliente
  // Isso evita loops e problemas de SSR
  return NextResponse.next();
}

const isDev = process.env.NODE_ENV === 'development';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Desabilitar cache sempre
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  // Permitir todas as origens
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Cache-Control, Pragma, Accept, Origin, Cookie');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
}

/**
 * Configuração do matcher - Apenas para rotas que realmente precisam de verificação
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 