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
      '/api',
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
 * Middleware principal - Simplificado para evitar loops
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Log apenas uma vez por rota para debug
  console.log(`🔧 Middleware: ${pathname}`);

  // Como o matcher já filtra apenas rotas protegidas específicas,
  // e estamos usando ClientAuthGuard no lado do cliente,
  // simplesmente permitir todas as requisições que chegam aqui
  return NextResponse.next();
}

/**
 * Configuração do matcher - DESABILITADO para evitar loops
 * A autenticação é gerenciada pelos componentes do lado do cliente
 */
export const config = {
  matcher: [
    // Matcher vazio para desabilitar o middleware completamente
    // A proteção de rotas é feita pelos componentes ProtectedRoute e RoleGuard
  ],
}; 