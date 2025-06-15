/**
 * Middleware Simplificado para Portal Sabercon
 * Remove complexidade desnecessária e foca no essencial
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { API_CONFIG } from '@/config/constants';

// Configuração simplificada
const MIDDLEWARE_CONFIG = {
  COOKIES: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
  },
  ROUTES: {
    PUBLIC: [
      '/login',
      '/register',
      '/portal',
      '/test-',
      '/debug-',
      '/_next',
      '/favicon.ico',
    ],
    PROTECTED: [
      '/dashboard',
      '/admin',
      '/profile',
      '/settings',
    ],
  },
} as const;

/**
 * Verifica se uma rota é pública
 */
function isPublicRoute(pathname: string): boolean {
  return MIDDLEWARE_CONFIG.ROUTES.PUBLIC.some(route => pathname.startsWith(route));
}

/**
 * Verifica se uma rota é protegida
 */
function isProtectedRoute(pathname: string): boolean {
  return MIDDLEWARE_CONFIG.ROUTES.PROTECTED.some(route => pathname.startsWith(route));
}

/**
 * Valida token com o backend (com cache simples)
 */
const tokenCache = new Map<string, { valid: boolean; timestamp: number }>();
const CACHE_TTL = 30000; // 30 segundos

async function validateToken(token: string): Promise<boolean> {
  // Verificar cache
  const cached = tokenCache.get(token);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.valid;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/validate-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const isValid = response.ok;
    
    // Salvar no cache
    tokenCache.set(token, { valid: isValid, timestamp: Date.now() });
    
    return isValid;
  } catch (error) {
    console.warn('Erro ao validar token:', error);
    // Em caso de erro, assumir que o token é inválido
    tokenCache.set(token, { valid: false, timestamp: Date.now() });
    return false;
  }
}

/**
 * Cria resposta de redirecionamento
 */
function createRedirect(url: string, request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL(url, request.url));
  
  // Headers para evitar cache
  response.headers.set('Cache-Control', 'no-store');
  
  return response;
}

/**
 * Limpa cookies de autenticação
 */
function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete(MIDDLEWARE_CONFIG.COOKIES.AUTH_TOKEN);
  response.cookies.delete(MIDDLEWARE_CONFIG.COOKIES.USER_DATA);
}

/**
 * Obtém o dashboard correto baseado na role do usuário
 */
function getDashboardForRole(role: string): string {
  const roleMap: Record<string, string> = {
    'SYSTEM_ADMIN': '/dashboard/system-admin',
    'INSTITUTION_ADMIN': '/dashboard/institution-admin',
    'SCHOOL_MANAGER': '/dashboard/school-manager',
    'TEACHER': '/dashboard/teacher',
    'STUDENT': '/dashboard/student',
    'GUARDIAN': '/dashboard/guardian',
  };

  return roleMap[role.toUpperCase()] || '/dashboard/student';
}

/**
 * Middleware principal
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`🔧 Middleware: Processando ${pathname}`);

  // 0. NUNCA processar rotas de API - deixar para o Next.js
  if (pathname.startsWith('/api/')) {
    console.log(`🔧 Middleware: Rota de API ignorada: ${pathname}`);
    return NextResponse.next();
  }

  // 1. Permitir rotas públicas sempre
  if (isPublicRoute(pathname)) {
    console.log(`🔧 Middleware: Rota pública permitida: ${pathname}`);
    return NextResponse.next();
  }

  // 2. TEMPORÁRIO: Desabilitar middleware para resolver loop - usar ClientAuthGuard
  if (isProtectedRoute(pathname)) {
    console.log(`🔧 Middleware: Rota protegida ${pathname} - TEMPORARIAMENTE PERMITIDA`);
    console.log(`🔧 Middleware: Usando ClientAuthGuard para proteção no lado do cliente`);
    return NextResponse.next();
    
    /* CÓDIGO COMENTADO TEMPORARIAMENTE PARA RESOLVER LOOP
    const token = request.cookies.get(MIDDLEWARE_CONFIG.COOKIES.AUTH_TOKEN)?.value;
    const userDataCookie = request.cookies.get(MIDDLEWARE_CONFIG.COOKIES.USER_DATA)?.value;
    
    // Verificar também se há token no header Authorization (para casos onde cookies falham)
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    // Verificar header customizado também
    const customToken = request.headers.get('x-auth-token');
    
    console.log(`🔧 Middleware: Verificando autenticação para ${pathname}`);
    console.log(`🔧 Middleware: Cookie token: ${token ? 'Presente' : 'Ausente'}`);
    console.log(`🔧 Middleware: Header token: ${headerToken ? 'Presente' : 'Ausente'}`);
    console.log(`🔧 Middleware: Custom token: ${customToken ? 'Presente' : 'Ausente'}`);
    console.log(`🔧 Middleware: UserData cookie: ${userDataCookie ? 'Presente' : 'Ausente'}`);
    
    // Permitir acesso se houver token nos cookies OU nos headers
    const hasValidToken = token || headerToken || customToken;
    
    if (!hasValidToken) {
      console.log(`🔧 Middleware: Sem token válido, redirecionando para login`);
      return createRedirect('/login', request);
    }
    
    console.log(`🔧 Middleware: Token válido encontrado, permitindo acesso`);
    return NextResponse.next();
    */
  }

  // 3. Para outras rotas, permitir
  console.log(`🔧 Middleware: Rota não protegida, permitindo: ${pathname}`);
  return NextResponse.next();
}

/**
 * Configuração do matcher
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - handled by Next.js)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 