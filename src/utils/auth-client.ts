/**
 * Utilitário de autenticação para o lado cliente
 * Gerencia tokens, localStorage, cookies e sessões
 */

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLogin?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  expiresIn: number;
}

export interface AuthSession {
  user: UserData;
  tokens: AuthTokens;
  sessionId: string;
  loginTime: string;
}

// Chaves para localStorage
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_DATA: 'auth_user_data',
  SESSION_ID: 'auth_session_id',
  EXPIRES_AT: 'auth_expires_at',
  REMEMBER_ME: 'auth_remember_me'
} as const;

// Nomes dos cookies
const COOKIE_NAMES = {
  TOKEN: 'token',
  AUTH_TOKEN: 'auth_token',
  AUTH_TOKEN_JS: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  SESSION_ID: 'sessionId'
} as const;

/**
 * Classe para gerenciar autenticação no cliente
 */
export class AuthClient {
  private static instance: AuthClient;
  private refreshTimer: NodeJS.Timeout | null = null;

  private constructor() {
    // Inicializar auto-refresh se houver token válido
    this.initializeAutoRefresh();
  }

  public static getInstance(): AuthClient {
    if (!AuthClient.instance) {
      AuthClient.instance = new AuthClient();
    }
    return AuthClient.instance;
  }

  /**
   * Salvar dados de autenticação após login
   */
  public saveAuthData(authData: {
    user: UserData;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt: string;
    rememberMe?: boolean;
  }): void {
    try {
      const { user, accessToken, refreshToken, expiresIn, expiresAt, rememberMe = false } = authData;
      const sessionId = `sess_${user.id}_${Date.now()}`;
      const loginTime = new Date().toISOString();

      // Salvar no localStorage (se rememberMe for true)
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
        localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt);
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      } else {
        // Usar sessionStorage para sessões temporárias
        sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
        sessionStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt);
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      }

      // Configurar cookies (os cookies já são definidos pelo servidor)
      this.setCookie(COOKIE_NAMES.AUTH_TOKEN_JS, accessToken, expiresIn);
      this.setCookie(COOKIE_NAMES.SESSION_ID, sessionId, rememberMe ? 7 * 24 * 60 * 60 : expiresIn);

      // Inicializar auto-refresh
      this.setupAutoRefresh(expiresIn);

      console.log('✅ [AUTH-CLIENT] Dados de autenticação salvos', {
        user: user.email,
        role: user.role,
        rememberMe,
        expiresAt
      });

    } catch (error) {
      console.error('❌ [AUTH-CLIENT] Erro ao salvar dados de autenticação:', error);
    }
  }

  /**
   * Obter token de acesso atual
   */
  public getAccessToken(): string | null {
    try {
      // Tentar localStorage primeiro (remember me)
      let token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      // Se não encontrar, tentar sessionStorage
      if (!token) {
        token = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      }

      // Se não encontrar, tentar cookies
      if (!token) {
        token = this.getCookie(COOKIE_NAMES.AUTH_TOKEN_JS) || 
                this.getCookie(COOKIE_NAMES.TOKEN) ||
                this.getCookie(COOKIE_NAMES.AUTH_TOKEN);
      }

      return token;
    } catch (error) {
      console.error('❌ [AUTH-CLIENT] Erro ao obter token de acesso:', error);
      return null;
    }
  }

  /**
   * Obter refresh token
   */
  public getRefreshToken(): string | null {
    try {
      let token = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!token) {
        token = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      }

      if (!token) {
        token = this.getCookie(COOKIE_NAMES.REFRESH_TOKEN);
      }

      return token;
    } catch (error) {
      console.error('❌ [AUTH-CLIENT] Erro ao obter refresh token:', error);
      return null;
    }
  }

  /**
   * Obter dados do usuário
   */
  public getUserData(): UserData | null {
    try {
      let userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (!userData) {
        userData = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
      }

      if (!userData) {
        const userCookie = this.getCookie(COOKIE_NAMES.USER);
        if (userCookie) {
          userData = decodeURIComponent(userCookie);
        }
      }

      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ [AUTH-CLIENT] Erro ao obter dados do usuário:', error);
      return null;
    }
  }

  /**
   * Verificar se o usuário está autenticado
   */
  public isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const userData = this.getUserData();
    
    if (!token || !userData) {
      return false;
    }

    // Verificar se o token não expirou
    const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT) || 
                     sessionStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
    
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      console.log('⚠️ [AUTH-CLIENT] Token expirado, tentando refresh...');
      this.refreshToken();
      return false;
    }

    return true;
  }

  /**
   * Verificar se o usuário tem uma permissão específica
   */
  public hasPermission(permission: string): boolean {
    const userData = this.getUserData();
    return userData?.permissions?.includes(permission) || false;
  }

  /**
   * Verificar se o usuário tem uma role específica
   */
  public hasRole(role: string): boolean {
    const userData = this.getUserData();
    return userData?.role === role;
  }

  /**
   * Renovar token de acesso
   */
  public async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        console.log('❌ [AUTH-CLIENT] Refresh token não encontrado');
        this.logout();
        return false;
      }

      console.log('🔄 [AUTH-CLIENT] Renovando token de acesso...');

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        console.log('❌ [AUTH-CLIENT] Falha ao renovar token');
        this.logout();
        return false;
      }

      const data = await response.json();
      
      if (data.success) {
        // Atualizar tokens
        const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
        const storage = rememberMe ? localStorage : sessionStorage;
        
        storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.data.token);
        storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.data.refreshToken);
        storage.setItem(STORAGE_KEYS.EXPIRES_AT, data.data.expiresAt);

        // Atualizar cookie JavaScript
        this.setCookie(COOKIE_NAMES.AUTH_TOKEN_JS, data.data.token, data.data.expiresIn);

        // Reconfigurar auto-refresh
        this.setupAutoRefresh(data.data.expiresIn);

        console.log('✅ [AUTH-CLIENT] Token renovado com sucesso');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ [AUTH-CLIENT] Erro ao renovar token:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Fazer logout
   */
  public async logout(): Promise<void> {
    try {
      // Tentar fazer logout no servidor
      const token = this.getAccessToken();
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => {
          // Ignorar erros de logout no servidor
        });
      }

      // Limpar dados locais
      this.clearAuthData();

      console.log('✅ [AUTH-CLIENT] Logout realizado');
    } catch (error) {
      console.error('❌ [AUTH-CLIENT] Erro durante logout:', error);
      // Mesmo com erro, limpar dados locais
      this.clearAuthData();
    }
  }

  /**
   * Limpar todos os dados de autenticação
   */
  private clearAuthData(): void {
    // Limpar localStorage
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Limpar cookies JavaScript
    Object.values(COOKIE_NAMES).forEach(name => {
      this.deleteCookie(name);
    });

    // Parar auto-refresh
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Configurar renovação automática de token
   */
  private setupAutoRefresh(expiresIn: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Renovar token 2 minutos antes de expirar
    const refreshTime = Math.max((expiresIn - 120) * 1000, 60000); // Mínimo 1 minuto

    this.refreshTimer = setTimeout(() => {
      this.refreshToken();
    }, refreshTime);

    console.log(`🔄 [AUTH-CLIENT] Auto-refresh configurado para ${Math.round(refreshTime / 1000)}s`);
  }

  /**
   * Inicializar auto-refresh se houver sessão ativa
   */
  private initializeAutoRefresh(): void {
    if (this.isAuthenticated()) {
      const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT) || 
                       sessionStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
      
      if (expiresAt) {
        const now = new Date().getTime();
        const expires = new Date(expiresAt).getTime();
        const expiresIn = Math.max((expires - now) / 1000, 0);
        
        if (expiresIn > 0) {
          this.setupAutoRefresh(expiresIn);
        }
      }
    }
  }

  /**
   * Utilitários para cookies
   */
  private setCookie(name: string, value: string, maxAge: number): void {
    try {
      document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Strict`;
    } catch (error) {
      console.error('❌ [AUTH-CLIENT] Erro ao definir cookie:', error);
    }
  }

  private getCookie(name: string): string | null {
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
      return null;
    } catch (error) {
      console.error('❌ [AUTH-CLIENT] Erro ao obter cookie:', error);
      return null;
    }
  }

  private deleteCookie(name: string): void {
    try {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    } catch (error) {
      console.error('❌ [AUTH-CLIENT] Erro ao deletar cookie:', error);
    }
  }
}

// Instância singleton
export const authClient = AuthClient.getInstance();

// Hooks para React (se necessário)
export const useAuth = () => {
  const isAuthenticated = authClient.isAuthenticated();
  const userData = authClient.getUserData();
  
  return {
    isAuthenticated,
    user: userData,
    hasPermission: (permission: string) => authClient.hasPermission(permission),
    hasRole: (role: string) => authClient.hasRole(role),
    logout: () => authClient.logout(),
    refreshToken: () => authClient.refreshToken()
  };
};

export default authClient;