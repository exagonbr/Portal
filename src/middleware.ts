import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
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
    '/test-simple',
    '/test-dashboard',
    '/test-student',
    '/debug-auth',
    '/test-dashboard-simple',
    '/test-auth-integration',
    '/test-julia-login',
    '/portal',
    '/portal/books',
    '/portal/videos'
  ],
  
  // Authentication routes
  AUTH: ['/login', '/register'],
  
  // Protected routes requiring authentication
  PROTECTED: [
    '/dashboard',
    '/courses',
    '/lessons',
    '/live',
    '/chat',
    '/profile'
  ],
  
  // Role-specific dashboard routes
  ROLE_SPECIFIC: {
    [UserRole.STUDENT]: ['/dashboard/student'],
    [UserRole.TEACHER]: ['/dashboard/teacher'],
    [UserRole.SYSTEM_ADMIN]: ['/dashboard/admin'],
    [UserRole.INSTITUTION_MANAGER]: ['/dashboard/institution-manager'],
    [UserRole.ACADEMIC_COORDINATOR]: ['/dashboard/coordinator'],
    [UserRole.GUARDIAN]: ['/dashboard/guardian']
  }
} as const;

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
    if (userDashboardPath && pathname.startsWith(userDashboardPath)) {
      console.log(`Middleware: Acesso ao próprio dashboard permitido: ${pathname} (role: ${normalizedRole})`);
      return true; // Permite acesso ao próprio dashboard
    }
    
    console.warn(`Middleware: Acesso negado: ${pathname} (role: ${normalizedRole}, dashboard esperado: ${userDashboardPath})`);
    // Nega acesso a dashboards de outras roles
    return false;
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
  }
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
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
        id: authResult.user.id,
        name: authResult.user.name,
        email: authResult.user.email,
        role: authResult.user.role,
      };
      response.cookies.set(CONFIG.COOKIES.USER_DATA, encodeURIComponent(JSON.stringify(userData)), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });
      return response;
    }
  }

  // 4.5. Handle portal paths with degraded access when backend is unavailable
  if (pathname.startsWith('/portal')) {
    // Se tem token mas não conseguiu validar (backend offline), permite acesso limitado
    if (token && !userDataCookie) {
      console.log('⚠️ Middleware: Modo degradado ativado para portal - backend indisponível');
      const response = NextResponse.next();
      // Define dados temporários para modo offline
      const offlineUserData = {
        id: 'offline-user',
        name: 'Usuário Offline',
        email: 'offline@local',
        role: 'student', // Role padrão para modo offline
        offline: true
      };
      response.cookies.set(CONFIG.COOKIES.USER_DATA, encodeURIComponent(JSON.stringify(offlineUserData)), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hora apenas para modo offline
        path: '/',
      });
      return response;
    }
    // Se não tem token, permite acesso público ao portal
    if (!token) {
      console.log('✅ Middleware: Acesso público ao portal permitido');
      return NextResponse.next();
    }
  }

  // 4. Handle authenticated users trying to access auth pages
  if (isAuthPath && token) {
    if (userDataCookie) {
      const userData = MiddlewareUtils.parseUserData(userDataCookie);
      if (userData) {
        const dashboardPath = RoleAccessControl.getCorrectDashboardForRole(userData.role);
        if (dashboardPath) {
          console.log(`🔄 Middleware: Usuário autenticado tentando acessar ${pathname}, redirecionando para ${dashboardPath}`);
          return MiddlewareUtils.createRedirectResponse(dashboardPath, request);
        }
      }
    }
    // Fallback to portal if role determination fails
    console.log(`🔄 Middleware: Falha na determinação da role, redirecionando para portal`);
    return MiddlewareUtils.createRedirectResponse('/portal/videos', request);
  }

  // 5. Role-based access control for authenticated users
  if (userDataCookie) {
    const userData = MiddlewareUtils.parseUserData(userDataCookie);
    
    if (!userData) {
      console.log('❌ Middleware: Dados do usuário inválidos, redirecionando para login');
      return MiddlewareUtils.createRedirectWithClearCookies('/login?error=unauthorized', request);
    }

    console.log(`👤 Middleware: Usuário ${userData.name} (${userData.role}) acessando ${pathname}`);

    // Validate role - se não tiver role, permite acesso mas sem permissões específicas
    if (userData.role && !RoleAccessControl.validateRole(userData.role)) {
      console.log(`❌ Middleware: Role inválida para usuário ${userData.name}: ${userData.role}`);
      return MiddlewareUtils.createRedirectWithClearCookies('/login?error=unauthorized', request);
    }

    // Redirect generic dashboard to role-specific dashboard PRIMEIRO
    if (pathname === '/dashboard') {
      const specificDashboard = RoleAccessControl.getCorrectDashboardForRole(userData.role);
      if (specificDashboard) {
        console.log(`🚀 Middleware: Redirecionando ${userData.name} (${userData.role}) de /dashboard para ${specificDashboard}`);
        return MiddlewareUtils.createRedirectResponse(specificDashboard, request);
      } else {
        console.warn(`⚠️ Middleware: Dashboard específico não encontrado para ${userData.role}, mantendo /dashboard`);
      }
    }

    // Check access permissions DEPOIS
    if (!RoleAccessControl.hasAccessToPath(userData.role, pathname)) {
      console.warn(`🚫 Middleware: Usuário ${userData.name} (${userData.role}) tentou acessar ${pathname} sem permissão`);
      const correctDashboard = RoleAccessControl.getCorrectDashboardForRole(userData.role);
      
      // IMPORTANTE: Só redireciona se não estiver já no dashboard correto
      if (correctDashboard && pathname !== correctDashboard && !pathname.startsWith(correctDashboard)) {
        console.log(`🔄 Middleware: Redirecionando para dashboard correto: ${correctDashboard}`);
        return MiddlewareUtils.createRedirectResponse(correctDashboard, request);
      }
      
      // Se já está no dashboard correto mas sem acesso, vai para portal
      if (!correctDashboard || pathname.startsWith(correctDashboard)) {
        console.log('ℹ️ Middleware: Usuário já está no dashboard correto, permitindo acesso');
        // Não redireciona, deixa o RoleProtectedRoute lidar com isso
      } else {
        console.log('🔄 Middleware: Redirecionando para portal/videos como fallback');
        return MiddlewareUtils.createRedirectResponse('/portal/videos', request);
      }
    } else {
      console.log(`✅ Middleware: Acesso permitido para ${userData.name} em ${pathname}`);
    }
  }

  // 6. Create response with session headers
  const response = NextResponse.next();
  MiddlewareUtils.addSessionHeaders(response, sessionId, pathname);
  
  console.log(`✅ Middleware: Processamento concluído para ${pathname}`);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
