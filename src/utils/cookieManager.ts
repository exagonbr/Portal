// Utilitário para gerenciar cookies de autenticação
import { isDevelopment } from './env';

interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export class CookieManager {
  private static defaultOptions: CookieOptions = {
    path: '/',
    secure: !isDevelopment(),
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  };

  /**
   * Define um cookie
   */
  static set(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof document === 'undefined') return;

    const opts = { ...this.defaultOptions, ...options };
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (opts.expires) {
      cookieString += `; expires=${opts.expires.toUTCString()}`;
    }

    if (opts.maxAge) {
      cookieString += `; max-age=${opts.maxAge}`;
    }

    if (opts.domain) {
      cookieString += `; domain=${opts.domain}`;
    }

    if (opts.path) {
      cookieString += `; path=${opts.path}`;
    }

    if (opts.secure) {
      cookieString += `; secure`;
    }

    if (opts.httpOnly) {
      cookieString += `; httponly`;
    }

    if (opts.sameSite) {
      cookieString += `; samesite=${opts.sameSite}`;
    }

    document.cookie = cookieString;
  }

  /**
   * Obtém um cookie
   */
  static get(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      let c = cookie.trim();
      if (c.indexOf(nameEQ) === 0) {
        const value = c.substring(nameEQ.length);
        return decodeURIComponent(value);
      }
    }

    return null;
  }

  /**
   * Remove um cookie
   */
  static remove(name: string, options: Partial<CookieOptions> = {}): void {
    const opts = { ...this.defaultOptions, ...options };
    this.set(name, '', { 
      ...opts, 
      expires: new Date(0),
      maxAge: -1 
    });
  }

  /**
   * Verifica se um cookie existe
   */
  static exists(name: string): boolean {
    return this.get(name) !== null;
  }

  /**
   * Define cookies de autenticação
   */
  static setAuthCookies(data: {
    accessToken: string;
    refreshToken: string;
    user: any;
    sessionId?: string;
  }): void {
    // Token de acesso (curta duração)
    this.set('auth_token', data.accessToken, {
      maxAge: 60 * 60 * 2, // 2 horas
      secure: true,
      sameSite: 'lax'
    });

    // Refresh token (longa duração)
    this.set('refresh_token', data.refreshToken, {
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      secure: true,
      sameSite: 'lax'
    });

    // Dados do usuário
    this.set('user_data', JSON.stringify(data.user), {
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      secure: true,
      sameSite: 'lax'
    });

    // ID da sessão (se fornecido)
    if (data.sessionId) {
      this.set('session_id', data.sessionId, {
        maxAge: 60 * 60 * 24 * 1, // 1 dia
        secure: true,
        sameSite: 'lax'
      });
    }
  }

  /**
   * Obtém todos os dados de autenticação dos cookies
   */
  static getAuthData(): {
    accessToken: string | null;
    refreshToken: string | null;
    user: any | null;
    sessionId: string | null;
    isAuthenticated: boolean;
  } {
    const accessToken = this.get('auth_token');
    const refreshToken = this.get('refresh_token');
    const sessionId = this.get('session_id');
    
    let user = null;
    try {
      const userData = this.get('user_data');
      if (userData) {
        user = JSON.parse(userData);
      }
    } catch (error) {
      console.warn('Erro ao parsear dados do usuário dos cookies:', error);
    }

    return {
      accessToken,
      refreshToken,
      user,
      sessionId,
      isAuthenticated: !!accessToken
    };
  }

  /**
   * Remove todos os cookies de autenticação
   */
  static clearAuthCookies(): void {
    // Lista completa de cookies de autenticação
    const authCookies = [
      'auth_token',
      'refresh_token',
      'user_data',
      'session_id',
      'accessToken',
      'token',
      'authToken',
      'is_authenticated',
      'next-auth.session-token',
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token',
      'jid'
    ];
    
    // Remover cada cookie com diferentes combinações de domínio e caminho
    authCookies.forEach(cookieName => {
      this.remove(cookieName);
      
      // Tentar remover com diferentes caminhos e domínios para garantir
      if (typeof document !== 'undefined' && typeof window !== 'undefined') {
        try {
          const domains = ['', window.location.hostname, `.${window.location.hostname}`];
          const paths = ['/', '', '/api', '/api/auth', '/auth'];
          
          domains.forEach(domain => {
            paths.forEach(path => {
              const domainPart = domain ? `;domain=${domain}` : '';
              const pathPart = path ? `;path=${path}` : '';
              document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT${pathPart}${domainPart}`;
            });
          });
        } catch (error) {
          console.error('❌ Erro ao limpar cookies com domínios/caminhos específicos:', error);
        }
      }
    });
    
    console.log('🧹 Cookies de autenticação limpos');
  }

  /**
   * Atualiza o token de acesso
   */
  static updateAccessToken(newToken: string): void {
    this.set('auth_token', newToken, {
      maxAge: 60 * 60 * 2, // 2 horas
      secure: true,
      sameSite: 'lax'
    });
  }
} 