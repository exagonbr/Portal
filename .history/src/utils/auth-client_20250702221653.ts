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
