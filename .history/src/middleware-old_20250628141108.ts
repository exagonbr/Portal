import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole } from './types/roles';
import { ROLE_DASHBOARD_MAP, getDashboardPath, isValidRole } from './utils/roleRedirect';
// REMOVIDO: NextAuth JWT para evitar erros 404
// import { getToken } from 'next-auth/jwt';
// REMOVIDO: Rate limiting completamente
// import { applyRateLimit } from './middleware/rateLimit';
import { PRODUCTION_CONFIG, ProductionUtils } from './config/production';

// Configuration constants
const CONFIG = {
  BASE_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  BACKEND_URL: process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'https://portal.sabercon.com.br/api',
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
    '/api/auth',
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
    '/portal/videos',
    '/portal/courses',
    '/portal/assignments',
    '/portal/dashboard',
    '/portal/student',
    '/portal/reports'
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
    // Verificar se estamos em produção e ajustar a URL se necessário
    let redirectUrl = url;
    
    // Em produção, garantir que redirecionamentos para portal incluam o path correto
    if (process.env.NODE_ENV === 'production') {
      // Se a URL é relativa e começa com /portal, garantir que está correta
      if (url.startsWith('/portal') && !url.includes('portal.')) {
        // Manter a URL como está, mas garantir que não há duplicação
        redirectUrl = url;
      }
      
      // Se estamos redirecionando para login após logout, limpar query params problemáticos
      if (url.includes('/login') && url.includes('error=unauthorized')) {
        redirectUrl = '/login?logout=true';
      }
    }
    
    const response = NextResponse.redirect(new URL(redirectUrl, request.url), {
      // Definir status 303 para garantir que o navegador siga o redirecionamento mesmo após POST
      status: 303
    });
    
    // Adicionar headers para garantir que o redirecionamento funcione corretamente
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Redirect-Reason', 'middleware-auth');
    
    return response;
  }

  static createRedirectWithClearCookies(url: string, request: NextRequest): NextResponse {
    const response = this.createRedirectResponse(url, request);
    this.clearAuthCookies(response);
    
    // Adicionar header especial para indicar que deve limpar todos os dados no cliente
    if (url.includes('error=unauthorized') || url.includes('logout=true')) {
      response.headers.set('X-Clear-All-Data', 'true');
      response.headers.set('X-Logout-Redirect', 'true');
    }
    
    return response;
  }

  static parseUserData(userDataCookie: string): { role: string; name: string } | null {
    try {
      return JSON.parse(decodeURIComponent(userDataCookie));
    } catch (error) {
      console.error('Error parsing user data:', error);
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
  // Rastreia últimas validações para evitar loops
  private static validationCache = new Map<string, { valid: boolean; timestamp: number; user?: any }>();
  private static CACHE_TTL = 5000; // 5 segundos em milissegundos

  static async validateToken(token: string): Promise<{ valid: boolean; user?: any }> {
    try {
      // Verificar cache para evitar múltiplas validações do mesmo token em curto período
      const cachedValidation = this.validationCache.get(token);
      const now = Date.now();
      
      if (cachedValidation && (now - cachedValidation.timestamp < this.CACHE_TTL)) {
        console.log('✅ Middleware: Usando resultado de validação em cache');
        return { valid: cachedValidation.valid, user: cachedValidation.user };
      }
      
      console.log('Middleware: Validando token...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos timeout (reduzido)

      const response = await fetch(`${CONFIG.BACKEND_URL}/auth/validate-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store'
        },
        body: JSON.stringify({ token }),
        signal: controller.signal,
        cache: 'no-store'
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Middleware: Token validado com sucesso');
        
        // Salvar no cache
        this.validationCache.set(token, { 
          valid: data.valid, 
          user: data.user, 
          timestamp: now 
        });
        
        return { valid: data.valid, user: data.user };
      }
      
      console.log(`❌ Middleware: Token inválido ou expirado (status: ${response.status})`);
      
      // Salvar no cache mesmo se for inválido para evitar chamadas repetidas
      this.validationCache.set(token, { valid: false, timestamp: now });
      
      return { valid: false };
    } catch (error) {
      if (error instanceof Error) {
        // Se é erro de conectividade (fetch failed, network error, etc)
        if (error.name === 'AbortError' || error.message.includes('fetch failed')) {
          console.warn('⚠️ Middleware: Backend não disponível, permitindo acesso limitado');
          // Em modo offline/degradado, considera o token válido se existe
          return { valid: true, user: null };
        }
      }
      console.error('❌ Middleware: Erro ao validar token:', error);
      return { valid: false };
    }
  }

  static async isAuthenticated(token: string | undefined): Promise<{ authenticated: boolean; user?: any }> {
    if (!token) {
      console.log('❌ Middleware: Token não encontrado');
      return { authenticated: false };
    }

    try {
      // Verificar formato do token para evitar validação de tokens claramente inválidos
      if (token.length < 10 || !token.includes('.')) {
        console.log('❌ Middleware: Formato de token inválido');
        return { authenticated: false };
      }
      
      const validation = await this.validateToken(token);
      
      if (validation.valid) {
        console.log('✅ Middleware: Usuário autenticado com sucesso');
      } else {
        console.log('❌ Middleware: Falha na autenticação');
      }
      
      return { authenticated: validation.valid, user: validation.user };
    } catch (error) {
      console.error('❌ Middleware: Erro durante verificação de autenticação:', error);
      return { authenticated: false };
    }
  }
}

    // Map roles to dashboard routes
    const dashboardRoute = {
      'aluno': '/dashboard/student',
      'professor': '/dashboard/teacher',
      'gestor': '/dashboard/manager',
      'administrador': '/dashboard/admin',
      'coordenador acadêmico': '/dashboard/coordinator',
      'responsável': '/dashboard/guardian',
      // Fallback para roles em inglês (compatibilidade)
      'student': '/dashboard/student',
      'STUDENT': '/dashboard/student',
      'teacher': '/dashboard/teacher',
      'TEACHER': '/dashboard/teacher',
      'manager': '/dashboard/manager',
      'admin': '/dashboard/admin',
      'system_admin': '/dashboard/admin',
      'SYSTEM_ADMIN': '/dashboard/system-admin',
      'institution_manager': '/dashboard/manager',
      'INSTITUTION_MANAGER': '/dashboard/institution-manager',
      'academic_coordinator': '/dashboard/coordinator',
      'ACADEMIC_COORDINATOR': '/dashboard/coordinator',
      'guardian': '/dashboard/guardian',
      'GUARDIAN': '/dashboard/guardian',
    }



// Role-based access control
class RoleAccessControl {
  static validateRole(userRole: string | undefined): boolean {
    if (!userRole) {
      console.warn('Role não definida no middleware - usando fallback');
      return true; // Permite acesso mas sem role específica
    }
    // Normaliza a role para lowercase
    const normalizedRole = userRole.toLowerCase();
    if (!isValidRole(normalizedRole)) {
      console.error(`Role inválida detectada no middleware: ${userRole}`);
      return false;
    }
    return true;
  }

  static hasAccessToPath(userRole: string, pathname: string, searchParams?: URLSearchParams): boolean {
    if (!userRole) return true; // Se não tem role, permite acesso
    
    // Normaliza a role para lowercase
    const normalizedRole = userRole.toLowerCase();
    
    // SYSTEM_ADMIN tem acesso COMPLETO a todo o sistema
    if (normalizedRole === 'system_admin' || normalizedRole === 'administrador do sistema') {
      console.log(`✅ SYSTEM_ADMIN tem acesso completo ao caminho: ${pathname}`);
      return true;
    }
    

    
    // Verifica se é um caminho de dashboard específico
    const isDashboardPath = pathname.startsWith('/dashboard/');
    if (!isDashboardPath) return true; // Se não é dashboard, permite acesso
    
    // Se é o dashboard genérico, permite acesso (será redirecionado depois)
    if (pathname === '/dashboard') return true;
    
    // Verifica se o usuário está tentando acessar seu próprio dashboard
    const userDashboardPath = getDashboardPath(normalizedRole);
    if (userDashboardPath && pathname.startsWith(userDashboardPath)) {
      return true; // Permite acesso ao próprio dashboard
    }
    
    // Nega acesso a dashboards de outras roles
    return false;
  }

  static getCorrectDashboardForRole(userRole: string | undefined): string | null {
    if (!userRole) {
      console.log('❌ Role não definida, não é possível determinar dashboard');
      return null;
    }
    
    // Normaliza a role para lowercase
    const normalizedRole = userRole.toLowerCase();
    
    // Obter caminho do dashboard
    const dashboardPath = getDashboardPath(normalizedRole);
    
    if (!dashboardPath) {
      console.log(`❌ Dashboard não encontrado para role: ${normalizedRole}`);
      return null;
    }
    
    console.log(`✅ Dashboard para role ${normalizedRole}: ${dashboardPath}`);
    return dashboardPath;
  }
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Extract cookies
  const token = request.cookies.get(CONFIG.COOKIES.AUTH_TOKEN)?.value;
  const sessionId = request.cookies.get(CONFIG.COOKIES.SESSION_ID)?.value;
  const userDataCookie = request.cookies.get(CONFIG.COOKIES.USER_DATA)?.value;

  // 1. Handle public paths
  if (MiddlewareUtils.isPathMatch(pathname, ROUTES.PUBLIC)) {
    return NextResponse.next();
  }

  // 2. Check path types
  const isProtectedPath = MiddlewareUtils.isPathMatch(pathname, ROUTES.PROTECTED);
  const isAuthPath = MiddlewareUtils.isPathMatch(pathname, ROUTES.AUTH);

  // 4. Handle protected paths - authentication check
  if (isProtectedPath) {
    // Verificar se estamos em um ciclo de redirecionamento
    const redirectCount = request.cookies.get('redirect_count')?.value;
    const redirectCountInt = redirectCount ? parseInt(redirectCount) : 0;

    // Se já redirecionamos demais vezes (potencial loop), usar configuração de produção
    if (redirectCountInt > PRODUCTION_CONFIG.REDIRECT.MAX_REDIRECTS) {
      console.warn(`⚠️ Middleware: Detectado potencial loop de redirecionamento em ${pathname}`);
      
      // Usar rota de fallback baseada no contexto atual
      const fallbackRoute = ProductionUtils.getFallbackRoute(pathname);
      return MiddlewareUtils.createRedirectResponse(fallbackRoute, request);
    }

    const authResult = await SessionValidator.isAuthenticated(token);
    
    if (!authResult.authenticated) {
      console.log(`Middleware: Usuário não autenticado tentando acessar ${pathname}`);
      
      // Incrementar contador de redirecionamentos
      const response = MiddlewareUtils.createRedirectWithClearCookies(
        PRODUCTION_CONFIG.ROUTES.FALLBACK_ROUTES.UNAUTHORIZED, 
        request
      );
      
      const cookieConfig = ProductionUtils.getCookieConfig({
        HTTP_ONLY: false,
        MAX_AGE: 60 // 1 minuto apenas para contador
      });
      
      response.cookies.set('redirect_count', (redirectCountInt + 1).toString(), {
        httpOnly: cookieConfig.HTTP_ONLY,
        secure: cookieConfig.SECURE,
        sameSite: cookieConfig.SAME_SITE,
        maxAge: cookieConfig.MAX_AGE,
        path: '/',
      });
      
      return response;
    }

    // Limpar contador de redirecionamentos se autenticação bem-sucedida
    const response = NextResponse.next();
    response.cookies.delete('redirect_count');

    // Atualizar dados do usuário se necessário
    if (authResult.user && !userDataCookie) {
      console.log(`Middleware: Atualizando dados do usuário ${authResult.user.name}`);
      
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
    }
    
    return response;
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
    console.log('👤 Usuário autenticado tentando acessar página de login/registro');
    
    if (userDataCookie) {
      const userData = MiddlewareUtils.parseUserData(userDataCookie);
      if (userData) {
        console.log(`🔍 Usuário identificado: ${userData.name} (${userData.role})`);
        const dashboardPath = RoleAccessControl.getCorrectDashboardForRole(userData.role);
        if (dashboardPath) {
          console.log(`🔄 Redirecionando usuário autenticado de ${pathname} para ${dashboardPath}`);
          return MiddlewareUtils.createRedirectResponse(dashboardPath, request);
        }
      }
    }
    
    // Fallback to portal if role determination fails
    console.log('⚠️ Não foi possível determinar o dashboard correto, redirecionando para portal');
    // Em produção, usar uma rota mais específica para evitar loops
    const fallbackRoute = process.env.NODE_ENV === 'production' ? '/portal/books' : '/portal/videos';
    return MiddlewareUtils.createRedirectResponse(fallbackRoute, request);
  }

  // 5. Role-based access control for authenticated users
  if (userDataCookie) {
    const userData = MiddlewareUtils.parseUserData(userDataCookie);
    
    if (!userData) {
      console.log('Dados do usuário inválidos, redirecionando para login');
      return MiddlewareUtils.createRedirectWithClearCookies('/login?error=unauthorized', request);
    }

    console.log(`Middleware: Usuário ${userData.name} (${userData.role}) acessando ${pathname}`);

    // Validate role - se não tiver role, permite acesso mas sem permissões específicas
    if (userData.role && !RoleAccessControl.validateRole(userData.role)) {
      console.log(`Role inválida para usuário ${userData.name}: ${userData.role}`);
      return MiddlewareUtils.createRedirectWithClearCookies('/login?error=unauthorized', request);
    }

    // Redirect generic dashboard to role-specific dashboard PRIMEIRO
    if (pathname === '/dashboard') {
      console.log(`📊 Usuário ${userData.name} acessando dashboard genérico, determinando dashboard específico`);
      
      const specificDashboard = RoleAccessControl.getCorrectDashboardForRole(userData.role);
      if (specificDashboard) {
        console.log(`🔄 Redirecionando ${userData.name} (${userData.role}) de /dashboard para ${specificDashboard}`);
        
        // Criar resposta com redirecionamento 303 See Other para garantir que o navegador realize o redirecionamento
        const response = MiddlewareUtils.createRedirectResponse(specificDashboard, request);
        
        // Adicionar headers que podem ajudar em navegadores problemáticos
        response.headers.set('X-Redirect-From', '/dashboard');
        response.headers.set('X-Redirect-To', specificDashboard);
        
        return response;
      } else {
        console.log(`⚠️ Não foi possível determinar dashboard específico para ${userData.role}, mantendo no dashboard genérico`);
      }
    }

    // Check access permissions DEPOIS
    const searchParams = request.nextUrl.searchParams;
    if (!RoleAccessControl.hasAccessToPath(userData.role, pathname, searchParams)) {
      console.warn(`Usuário ${userData.name} (${userData.role}) tentou acessar ${pathname} sem permissão`);
      const correctDashboard = RoleAccessControl.getCorrectDashboardForRole(userData.role);
      
      // IMPORTANTE: Só redireciona se não estiver já no dashboard correto
      if (correctDashboard && pathname !== correctDashboard && !pathname.startsWith(correctDashboard)) {
        console.log(`Redirecionando para dashboard correto: ${correctDashboard}`);
        return MiddlewareUtils.createRedirectResponse(correctDashboard, request);
      }
      
      // Se já está no dashboard correto mas sem acesso, vai para portal
      if (!correctDashboard || pathname.startsWith(correctDashboard)) {
        console.log('Usuário já está no dashboard correto, permitindo acesso');
        // Não redireciona, deixa o RoleProtectedRoute lidar com isso
      } else {
        console.log('Redirecionando para portal como fallback');
        // Alternar entre diferentes rotas do portal para evitar loops
        const portalRoutes = ['/portal/books', '/portal/courses', '/portal/videos'];
        const currentPortalRoute = portalRoutes.find(route => pathname.startsWith(route));
        const fallbackRoute = currentPortalRoute ? '/portal/books' : '/portal/videos';
        return MiddlewareUtils.createRedirectResponse(fallbackRoute, request);
      }
    } else {
      console.log(`Acesso permitido para ${userData.name} em ${pathname}`);
    }
  }

  // 6. Create response with session headers
  const response = NextResponse.next();
  MiddlewareUtils.addSessionHeaders(response, sessionId, pathname);
  
  // Aplicar CORS headers - PERMITIR TODAS AS ORIGENS
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Credentials', 'false'); // Deve ser false com origin: '*'
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Cache-Control, Pragma, Accept, Origin, Cookie');
  response.headers.set('Access-Control-Max-Age', '86400');

  // Adicionar headers de segurança
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const preflight = new Response(null, { 
      status: 204, 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Cache-Control, Pragma, Accept, Origin, Cookie',
        'Access-Control-Allow-Credentials': 'false',
        'Access-Control-Max-Age': '86400',
        'Content-Length': '0'
      } 
    });
    return preflight;
  }

  // Log de requisições (em produção, usar um serviço de logging apropriado)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${request.method} ${pathname}`);
  }

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
