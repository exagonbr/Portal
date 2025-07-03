import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
<<<<<<< HEAD

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
=======
import { UserRole } from './types/roles';
import { getDashboardPath, isValidRole, convertBackendRole } from './utils/roleRedirect';

// Configuration constants
const CONFIG = {
  BASE_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001/api',
  API_VERSION: process.env.API_VERSION || 'v1',
  COOKIES: {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    SESSION_ID: 'session_id',
    USER_DATA: 'user_data'
  }
} as const;

// Route definitions
const ROUTES = {
  // Public routes that bypass all authentication
  PUBLIC: [
    '/test-reader',
    '/books',
>>>>>>> master
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

<<<<<<< HEAD
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
=======
// Utility functions
class MiddlewareUtils {
  static isPathMatch(pathname: string, paths: readonly string[]): boolean {
    return paths.some(path => pathname.startsWith(path));
  }

  static clearAuthCookies(response: NextResponse): void {
    response.cookies.delete(CONFIG.COOKIES.AUTH_TOKEN);
    response.cookies.delete(CONFIG.COOKIES.SESSION_ID);
    response.cookies.delete(CONFIG.COOKIES.USER_DATA);
  }

  static createRedirectResponse(url: string, request: NextRequest): NextResponse {
    return NextResponse.redirect(new URL(url, request.url));
  }

  static createRedirectWithClearCookies(url: string, request: NextRequest): NextResponse {
    const response = this.createRedirectResponse(url, request);
    this.clearAuthCookies(response);
    return response;
  }

  static parseUserData(userDataCookie: string): { role: string; name: string } | null {
    try {
      return JSON.parse(decodeURIComponent(userDataCookie));
    } catch (error) {
      console.error('Middleware: Erro ao analisar dados do usuário:', error);
      return null;
    }
  }

  static addSessionHeaders(response: NextResponse, sessionId: string | undefined, pathname: string): void {
    if (sessionId) {
      response.headers.set('X-Session-ID', sessionId);
    }
    response.headers.set('X-Request-Path', pathname);
    response.headers.set('X-Request-Time', new Date().toISOString());
  }
}

// Session validation
class SessionValidator {
  static async validateToken(token: string): Promise<{ valid: boolean; user?: any }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

      const response = await fetch(`${CONFIG.BASE_URL}/api/auth/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return { valid: data.valid, user: data.user };
      }
      return { valid: false };
    } catch (error) {
      if (error instanceof Error) {
        // Se é erro de conectividade (fetch failed, network error, etc)
        if (error.name === 'AbortError' || error.message.includes('fetch failed')) {
          console.warn('⚠️ Middleware: Backend não disponível, permitindo acesso limitado');
          // Em modo offline/degradado, considera o token válido se existe
          // Isso permite que a aplicação funcione sem backend
          return { valid: true, user: null };
        }
      }
      console.error('❌ Middleware: Erro ao validar token:', error);
      return { valid: false };
    }
  }

  static async isAuthenticated(token: string | undefined): Promise<{ authenticated: boolean; user?: any }> {
    if (!token) {
      return { authenticated: false };
    }

    const validation = await this.validateToken(token);
    return { authenticated: validation.valid, user: validation.user };
  }
}

// Role-based access control
class RoleAccessControl {
  static validateRole(userRole: string | undefined): boolean {
    if (!userRole) {
      console.warn('Middleware: Role não definida - usando fallback');
      return true; // Permite acesso mas sem role específica
    }
    
    // Converte role do backend para formato do frontend
    const normalizedRole = convertBackendRole(userRole);
    
    if (!normalizedRole || !isValidRole(normalizedRole)) {
      console.error(`Middleware: Role inválida detectada: ${userRole} (normalizada: ${normalizedRole})`);
      return false;
    }
    
    console.log(`Middleware: Role válida: ${userRole} -> ${normalizedRole}`);
    return true;
  }

  static hasAccessToPath(userRole: string, pathname: string): boolean {
    if (!userRole) {
      console.warn('Middleware: Sem role definida, permitindo acesso');
      return true; // Se não tem role, permite acesso
    }
    
    // Converte role do backend para formato do frontend
    const normalizedRole = convertBackendRole(userRole);
    console.log(`🔍 Middleware: Verificando acesso com role: ${userRole} → ${normalizedRole}`);
    
    // Verifica se é um caminho de dashboard específico
    const isDashboardPath = pathname.startsWith('/dashboard/');
    if (!isDashboardPath) {
      console.log(`Middleware: Não é dashboard, permitindo acesso: ${pathname}`);
      return true; // Se não é dashboard, permite acesso
    }
    
    // Se é o dashboard genérico, permite acesso (será redirecionado depois)
    if (pathname === '/dashboard') {
      console.log('Middleware: Dashboard genérico, permitindo acesso');
      return true;
    }
    
    // Verifica se o usuário está tentando acessar seu próprio dashboard
    const userDashboardPath = getDashboardPath(normalizedRole);
    
    if (!userDashboardPath) {
      console.error(`❌ Middleware: Não foi possível determinar dashboard para role: ${normalizedRole}`);
      return false;
    }
    
    if (pathname.startsWith(userDashboardPath)) {
      console.log(`✅ Middleware: Acesso ao próprio dashboard permitido: ${pathname} (role: ${normalizedRole})`);
      return true; // Permite acesso ao próprio dashboard
    }
    
    // Permissões especiais para admin e manager
    if (normalizedRole === 'system_admin' || normalizedRole === 'admin' || 
        normalizedRole === 'administrador' || normalizedRole === 'SYSTEM_ADMIN') {
      console.log(`✅ Middleware: Acesso permitido para administrador: ${pathname}`);
      return true; // Admins podem acessar qualquer dashboard
    }
    
    if (normalizedRole === 'institution_manager' || normalizedRole === 'manager' || 
        normalizedRole === 'gestor' || normalizedRole === 'INSTITUTION_MANAGER') {
      console.log(`✅ Middleware: Acesso permitido para gestor: ${pathname}`);
      return true; // Managers podem acessar qualquer dashboard (exceto admin)
    }
    
    console.warn(`❌ Middleware: Acesso negado: ${pathname} (role: ${normalizedRole}, dashboard esperado: ${userDashboardPath})`);
    return false; // Nega acesso a dashboards de outras roles
  }

  static getCorrectDashboardForRole(userRole: string | undefined): string | null {
    if (!userRole) {
      console.warn('Middleware: Role não definida para redirecionamento');
      return null;
    }
    
    // Converte role do backend para formato do frontend
    const normalizedRole = convertBackendRole(userRole);
    const dashboard = getDashboardPath(normalizedRole);
    
    console.log(`Middleware: Dashboard para role ${userRole} (${normalizedRole}): ${dashboard}`);
    return dashboard;
>>>>>>> master
  }
  
  return false;
}

const isDev = process.env.NODE_ENV === 'development';

/**
 * Middleware principal - Simplificado para evitar loops
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
<<<<<<< HEAD
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
=======
  console.log(`🔍 Middleware: Processando ${pathname}`);
  
  // Extract cookies
  const token = request.cookies.get(CONFIG.COOKIES.AUTH_TOKEN)?.value;
  const sessionId = request.cookies.get(CONFIG.COOKIES.SESSION_ID)?.value;
  const userDataCookie = request.cookies.get(CONFIG.COOKIES.USER_DATA)?.value;

  // 1. Handle public paths
  if (MiddlewareUtils.isPathMatch(pathname, ROUTES.PUBLIC)) {
    console.log(`✅ Middleware: Rota pública permitida: ${pathname}`);
    return NextResponse.next();
  }

  // 2. Check path types
  const isProtectedPath = MiddlewareUtils.isPathMatch(pathname, ROUTES.PROTECTED);
  const isAuthPath = MiddlewareUtils.isPathMatch(pathname, ROUTES.AUTH);

  // 3. Process auth paths
  if (isAuthPath) {
    // Se já está autenticado e tenta acessar login/register, redireciona para dashboard
    if (token && userDataCookie) {
      try {
        const userData = MiddlewareUtils.parseUserData(userDataCookie);
        
        if (userData && userData.role) {
          console.log(`🔄 Middleware: Usuário já autenticado tentando acessar ${pathname}, redirecionando para dashboard`);
          
          const normalizedRole = convertBackendRole(userData.role);
          const dashboardPath = getDashboardPath(normalizedRole);
          
          if (dashboardPath) {
            console.log(`✅ Middleware: Redirecionando usuário autenticado para: ${dashboardPath}`);
            return MiddlewareUtils.createRedirectResponse(dashboardPath, request);
          }
        }
      } catch (error) {
        console.error('❌ Middleware: Erro ao processar redirecionamento de usuário autenticado:', error);
      }
    }
    return NextResponse.next(); // Permite acesso às rotas de autenticação
  }

  // 4. Handle protected paths - authentication check
  if (isProtectedPath) {
    const authResult = await SessionValidator.isAuthenticated(token);
    
    if (!authResult.authenticated) {
      console.log(`❌ Middleware: Usuário não autenticado tentando acessar ${pathname}`);
      return MiddlewareUtils.createRedirectWithClearCookies('/login?error=unauthorized', request);
    }

    // Atualizar dados do usuário se necessário
    if (authResult.user && !userDataCookie) {
      console.log(`🔄 Middleware: Atualizando dados do usuário ${authResult.user.name}`);
      const response = NextResponse.next();
      const userData = {
        role: authResult.user.role,
        name: authResult.user.name,
        id: authResult.user.id
      };
      response.cookies.set(CONFIG.COOKIES.USER_DATA, JSON.stringify(userData), { path: '/' });
      MiddlewareUtils.addSessionHeaders(response, sessionId, pathname);
      return response;
    }

    // Se o usuário está tentando acessar o dashboard genérico, redirecionar para o específico
    if (pathname === '/dashboard' && userDataCookie) {
      try {
        const userData = MiddlewareUtils.parseUserData(userDataCookie);
        
        if (userData && userData.role) {
          console.log(`🔄 Middleware: Redirecionando usuário de /dashboard para dashboard específico`);
          
          const normalizedRole = convertBackendRole(userData.role);
          const dashboardPath = getDashboardPath(normalizedRole);
          
          if (dashboardPath && dashboardPath !== '/dashboard') {
            console.log(`✅ Middleware: Redirecionando para dashboard específico: ${dashboardPath}`);
            return MiddlewareUtils.createRedirectResponse(dashboardPath, request);
          }
        }
      } catch (error) {
        console.error('❌ Middleware: Erro ao processar redirecionamento para dashboard específico:', error);
      }
    }

    // Verificar permissões de acesso ao dashboard específico
    if (pathname.startsWith('/dashboard/') && userDataCookie) {
      try {
        const userData = MiddlewareUtils.parseUserData(userDataCookie);
        
        if (!userData || !userData.role) {
          console.error('❌ Middleware: Dados de usuário inválidos para verificação de acesso');
          return MiddlewareUtils.createRedirectWithClearCookies('/login?error=invalid_user_data', request);
        }
        
        const hasAccess = RoleAccessControl.hasAccessToPath(userData.role, pathname);
        
        if (!hasAccess) {
          console.log(`❌ Middleware: Acesso negado para ${pathname}`);
          
          // Redirecionar para o dashboard correto
          const normalizedRole = convertBackendRole(userData.role);
          const correctDashboard = getDashboardPath(normalizedRole);
          
          if (correctDashboard) {
            console.log(`🔄 Middleware: Redirecionando para dashboard correto: ${correctDashboard}`);
            return MiddlewareUtils.createRedirectResponse(correctDashboard, request);
          } else {
            return MiddlewareUtils.createRedirectResponse('/dashboard', request);
          }
        }
      } catch (error) {
        console.error('❌ Middleware: Erro ao verificar permissões de acesso:', error);
      }
    }

    // Se tudo está ok, permitir acesso
    const response = NextResponse.next();
    MiddlewareUtils.addSessionHeaders(response, sessionId, pathname);
    return response;
  }

  // Permitir acesso a outras rotas
  return NextResponse.next();
>>>>>>> master
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