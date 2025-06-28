/**
 * Configurações específicas para produção
 */

export const PRODUCTION_CONFIG = {
  // Configurações de rotas
  ROUTES: {
    // Rota padrão após logout
    DEFAULT_LOGOUT_REDIRECT: '/login?logout=true',
    
    // Rotas de fallback para diferentes cenários
    FALLBACK_ROUTES: {
      PORTAL: '/portal/books',
      DASHBOARD: '/dashboard',
      AUTH_ERROR: '/login?error=auth_failed',
      UNAUTHORIZED: '/login?error=unauthorized'
    },
    
    // Rotas que devem ser evitadas em loops de redirecionamento
    LOOP_PREVENTION: [
      '/portal/videos',
      '/portal/dashboard'
    ]
  },
  
  // Configurações de cookies
  COOKIES: {
    DOMAIN: process.env.COOKIE_DOMAIN || undefined,
    SECURE: true,
    SAME_SITE: 'lax' as const,
    HTTP_ONLY: false, // Para permitir acesso via JavaScript quando necessário
    MAX_AGE: 60 * 60 * 24 * 7 // 7 dias
  },
  
  // Configurações de redirecionamento
  REDIRECT: {
    // Máximo de redirecionamentos antes de considerar loop
    MAX_REDIRECTS: 3,
    
    // Delay antes de redirecionamento (ms)
    REDIRECT_DELAY: 1000,
    
    // Status code para redirecionamentos
    STATUS_CODE: 303
  },
  
  // URLs de API
  API: {
    BACKEND_URL: process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'https://portal.sabercon.com.br/api',
    FRONTEND_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000'
  }
} as const;

/**
 * Utilitários para produção
 */
export class ProductionUtils {
  /**
   * Verifica se estamos em produção
   */
  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }
  
  /**
   * Obtém a rota de fallback apropriada baseada no contexto atual
   */
  static getFallbackRoute(currentPath: string): string {
    if (currentPath.startsWith('/portal')) {
      return PRODUCTION_CONFIG.ROUTES.FALLBACK_ROUTES.PORTAL;
    }
    
    if (currentPath.startsWith('/dashboard')) {
      return PRODUCTION_CONFIG.ROUTES.FALLBACK_ROUTES.DASHBOARD;
    }
    
    return PRODUCTION_CONFIG.ROUTES.DEFAULT_LOGOUT_REDIRECT;
  }
  
  /**
   * Verifica se uma rota pode causar loop de redirecionamento
   */
  static isLoopProneRoute(path: string): boolean {
    return PRODUCTION_CONFIG.ROUTES.LOOP_PREVENTION.some(route => path.startsWith(route));
  }
  
  /**
   * Obtém configurações de cookie para produção
   */
  static getCookieConfig(overrides: Partial<typeof PRODUCTION_CONFIG.COOKIES> = {}) {
    return {
      ...PRODUCTION_CONFIG.COOKIES,
      ...overrides,
      secure: this.isProduction() ? PRODUCTION_CONFIG.COOKIES.SECURE : false
    };
  }
  
  /**
   * Gera URL de redirecionamento com parâmetros apropriados
   */
  static generateRedirectUrl(basePath: string, params: Record<string, string> = {}): string {
    const url = new URL(basePath, PRODUCTION_CONFIG.API.FRONTEND_URL);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    return url.pathname + url.search;
  }
  
  /**
   * Limpa parâmetros problemáticos de URLs
   */
  static cleanUrl(url: string): string {
    try {
      const urlObj = new URL(url, PRODUCTION_CONFIG.API.FRONTEND_URL);
      
      // Remover parâmetros que podem causar problemas
      const problematicParams = ['error', 'redirect_count', 'loop'];
      problematicParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });
      
      return urlObj.pathname + (urlObj.search || '');
    } catch {
      return url;
    }
  }
}

export default PRODUCTION_CONFIG; 