import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole } from './types/roles';
import { getDashboardPath, isValidRole, convertBackendRole, getDashboardByPermissions, hasPermissionForRoute } from './utils/roleRedirect';

// Configuration constants
const CONFIG = {
  BASE_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001',
  API_VERSION: process.env.API_VERSION || 'v1',
  COOKIES: {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    SESSION_ID: 'session_id',
    USER_DATA: 'user_data'
  },
  // Controle de loops de redirecionamento
  MAX_REDIRECTS: 3,
  REDIRECT_COOLDOWN: 5000 // 5 segundos
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
    [UserRole.SYSTEM_ADMIN]: ['/dashboard/system-admin'],
    [UserRole.INSTITUTION_MANAGER]: ['/dashboard/institution-manager'],
    [UserRole.ACADEMIC_COORDINATOR]: ['/dashboard/coordinator'],
    [UserRole.GUARDIAN]: ['/dashboard/guardian']
  }
} as const;

// Controle de redirecionamentos para evitar loops
class RedirectController {
  private static redirectHistory = new Map<string, { count: number; lastRedirect: number }>();
  
  static canRedirect(sessionId: string | undefined, targetUrl: string): boolean {
    if (!sessionId) return true; // Se não há sessão, permite redirecionamento
    
    const key = `${sessionId}:${targetUrl}`;
    const history = this.redirectHistory.get(key);
    const now = Date.now();
    
    if (!history) {
      this.redirectHistory.set(key, { count: 1, lastRedirect: now });
      return true;
    }
    
    // Se passou o tempo de cooldown, reseta o contador
    if (now - history.lastRedirect > CONFIG.MAX_REDIRECTS) {
      history.count = 1;
      history.lastRedirect = now;
      return true;
    }
    
    // Se excedeu o máximo de redirecionamentos
    if (history.count >= CONFIG.MAX_REDIRECTS) {
      console.warn(`🔄 RedirectController: Bloqueando redirecionamento - máximo atingido para ${targetUrl}`);
      return false;
    }
    
    history.count++;
    history.lastRedirect = now;
    return true;
  }
  
  static cleanup(): void {
    const now = Date.now();
    // Usar Array.from() para compatibilidade com TypeScript
    const entries = Array.from(this.redirectHistory.entries());
    for (const [key, history] of entries) {
      if (now - history.lastRedirect > CONFIG.REDIRECT_COOLDOWN * 2) {
        this.redirectHistory.delete(key);
      }
    }
  }
}

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

  static createRedirectResponse(url: string, request: NextRequest, sessionId?: string): NextResponse {
    // Verifica se pode fazer o redirecionamento
    if (!RedirectController.canRedirect(sessionId, url)) {
      console.warn(`🚫 Middleware: Redirecionamento bloqueado para ${url} - possível loop`);
      return NextResponse.next(); // Se não pode redirecionar, continua na página atual
    }
    
    console.log(`🔄 Middleware: Redirecionando para: ${url}`);
    return NextResponse.redirect(new URL(url, request.url));
  }

  static createRedirectWithClearCookies(url: string, request: NextRequest, sessionId?: string): NextResponse {
    const response = this.createRedirectResponse(url, request, sessionId);
    this.clearAuthCookies(response);
    return response;
  }

  static parseUserData(userDataCookie: string): { role: string; name: string; id: string; permissions: string[] } | null {
    try {
      const decodedData = JSON.parse(decodeURIComponent(userDataCookie));
      
      // Validar estrutura mínima necessária
      if (!decodedData || typeof decodedData !== 'object') {
        console.error('Middleware: Dados de usuário inválidos (não é um objeto)');
        return null;
      }
      
      // Extrair role, garantindo que exista
      const role = decodedData.role;
      if (!role) {
        console.error('Middleware: Dados de usuário sem role definida');
        return null;
      }
      
      // Extrair nome e ID, usando fallbacks se não existirem
      const name = decodedData.name || 'Usuário';
      const id = decodedData.id || '0';
      
      // Extrair permissões, garantindo que seja um array
      let permissions: string[] = [];
      
      if (Array.isArray(decodedData.permissions)) {
        permissions = decodedData.permissions;
      } else if (decodedData.role && decodedData.role.permissions && Array.isArray(decodedData.role.permissions)) {
        // Formato alternativo onde as permissões estão dentro do objeto role
        permissions = decodedData.role.permissions;
      }
      
      console.log(`🔍 parseUserData: Processou dados de usuário ${name} (${role}) com ${permissions.length} permissões`);
      
      // Retorna objeto com estrutura consistente
      return {
        role,
        name,
        id,
        permissions
      };
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
        
        // Formatar objeto de usuário para incluir permissões de forma consistente
        if (data.valid && data.user) {
          // Extrair role e permissões do objeto do usuário
          // O backend pode enviar em diferentes formatos dependendo do endpoint
          const role = data.user.role?.name || data.user.role || 'unknown';
          const permissions = data.user.role?.permissions || data.user.permissions || [];
          
          console.log(`✅ SessionValidator: Token válido para usuário com role: ${role}`);
          console.log(`✅ SessionValidator: Permissões: ${permissions.join(', ')}`);
          
          // Retornar objeto de usuário com estrutura consistente
          return {
            valid: true,
            user: {
              ...data.user,
              role: role,
              permissions: permissions
            }
          };
        }
        
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

  static hasAccessToPath(userRole: string, userPermissions: string[] = [], pathname: string): boolean {
    if (!userRole) {
      console.warn('Middleware: Sem role definida, negando acesso');
      return false; // Se não tem role, nega acesso (mais seguro)
    }
    
    // Converte role do backend para formato do frontend
    const normalizedRole = convertBackendRole(userRole);
    console.log(`🔍 Middleware: Verificando acesso com role: ${userRole} → ${normalizedRole}`);
    
    // Primeiro verifica por permissões (novo método)
    if (userPermissions && userPermissions.length > 0) {
      // Log de todas as permissões para facilitar debug
      console.log(`🔑 Middleware: Verificando ${userPermissions.length} permissões: ${userPermissions.join(', ')}`);
      
      const hasPermission = hasPermissionForRoute(userPermissions, pathname);
      if (hasPermission) {
        console.log(`✅ Middleware: Acesso permitido por permissão para: ${pathname}`);
        return true;
      } else {
        console.log(`⚠️ Middleware: Permissões insuficientes para: ${pathname}`);
      }
    } else {
      console.log(`⚠️ Middleware: Nenhuma permissão definida para o usuário`);
    }
    
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

  static getCorrectDashboardForRole(userRole: string | undefined, userPermissions: string[] = []): string | null {
    if (!userRole) {
      console.warn('Middleware: Role não definida para redirecionamento');
      return null;
    }
    
    // Converte role do backend para formato do frontend
    const normalizedRole = convertBackendRole(userRole);
    
    // Prioridade 1: Dashboard baseado na role normalizada
    const roleDashboard = getDashboardPath(normalizedRole);
    
    // Prioridade 2: Dashboard baseado em permissões (só se não encontrou por role)
    if (userPermissions && userPermissions.length > 0 && !roleDashboard) {
      console.log(`🔍 Middleware: Verificando dashboard por permissões: ${userPermissions.join(', ')}`);
      const permissionBasedDashboard = getDashboardByPermissions(userRole, userPermissions);
      console.log(`Middleware: Dashboard baseado em permissões: ${permissionBasedDashboard}`);
      return permissionBasedDashboard;
    }
    
    console.log(`Middleware: Dashboard para role ${userRole} (${normalizedRole}): ${roleDashboard}`);
    return roleDashboard;
  }
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Cleanup do controlador de redirecionamentos periodicamente
  if (Math.random() < 0.01) { // 1% de chance a cada request
    RedirectController.cleanup();
  }
  
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
          
          // Utilizando dashboard baseado prioritariamente na role
          const dashboardPath = RoleAccessControl.getCorrectDashboardForRole(
            userData.role, 
            userData.permissions || []
          );
          
          if (dashboardPath && dashboardPath !== '/dashboard') {
            console.log(`✅ Middleware: Redirecionando usuário autenticado para: ${dashboardPath}`);
            return MiddlewareUtils.createRedirectResponse(dashboardPath, request, sessionId);
          } else {
            // Fallback para dashboard genérico se não conseguiu determinar específico
            return MiddlewareUtils.createRedirectResponse('/dashboard', request, sessionId);
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
      return MiddlewareUtils.createRedirectWithClearCookies('/login?error=unauthorized', request, sessionId);
    }

    // Atualizar dados do usuário se necessário
    if (authResult.user) {
      console.log(`🔄 Middleware: Processando dados de usuário autenticado`);
      const response = NextResponse.next();
      
      // Extrai informações relevantes do objeto de usuário
      const userData = {
        id: authResult.user.id,
        name: authResult.user.name || 'Usuário',
        email: authResult.user.email,
        role: authResult.user.role,
        permissions: authResult.user.permissions || []
      };
      
      console.log(`✅ Middleware: Atualizando dados do usuário ${userData.name}`);
      console.log(`🔑 Middleware: Role: ${userData.role}, Permissões: ${userData.permissions.length}`);
      
      // Atualiza o cookie de dados do usuário
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
          
          // Utilizando dashboard baseado prioritariamente na role
          const dashboardPath = RoleAccessControl.getCorrectDashboardForRole(
            userData.role,
            userData.permissions || []
          );
          
          if (dashboardPath && dashboardPath !== '/dashboard') {
            console.log(`✅ Middleware: Redirecionando para dashboard específico: ${dashboardPath}`);
            return MiddlewareUtils.createRedirectResponse(dashboardPath, request, sessionId);
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
          return MiddlewareUtils.createRedirectWithClearCookies('/login?error=invalid_user_data', request, sessionId);
        }
        
        const hasAccess = RoleAccessControl.hasAccessToPath(
          userData.role, 
          userData.permissions || [],
          pathname
        );
        
        if (!hasAccess) {
          console.log(`❌ Middleware: Acesso negado para ${pathname}`);
          
          // Redirecionar para o dashboard correto com base na role principal
          const correctDashboard = RoleAccessControl.getCorrectDashboardForRole(
            userData.role,
            userData.permissions || []
          );
          
          if (correctDashboard && correctDashboard !== pathname) {
            console.log(`🔄 Middleware: Redirecionando para dashboard correto: ${correctDashboard}`);
            return MiddlewareUtils.createRedirectResponse(correctDashboard, request, sessionId);
          } else {
            // Se não conseguiu determinar dashboard correto, vai para genérico
            return MiddlewareUtils.createRedirectResponse('/dashboard', request, sessionId);
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
