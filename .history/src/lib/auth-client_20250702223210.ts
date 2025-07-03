/**
 * Cliente de Autenticação Frontend
 * Gerencia tokens, localStorage, cookies e estado de autenticação
 * Autor: Kilo Code
 * Data: 2025-01-07
 */

import { User, AuthSession } from '@/middleware/auth';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  expiresAt: string | null;
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
    token: string;
    refreshToken: string;
    sessionId: string;
    expiresIn: number;
    expiresAt: string;
  };
  message?: string;
}

class AuthClient {
  private static instance: AuthClient;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    sessionId: null,
    expiresAt: null,
    permissions: []
  };

  private listeners: Array<(state: AuthState) => void> = [];
  private refreshTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeFromStorage();
    this.setupAutoRefresh();
  }

  public static getInstance(): AuthClient {
    if (!AuthClient.instance) {
      AuthClient.instance = new AuthClient();
    }
    return AuthClient.instance;
  }

  /**
   * Inicializar estado da autenticação do localStorage/cookies
   */
  private initializeFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      // Tentar localStorage primeiro
      const storedAuth = localStorage.getItem('auth_state');
      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth);
        this.authState = { ...this.authState, ...parsedAuth };
      }

      // Verificar cookies como fallback
      const token = this.getCookie('authToken') || this.getCookie('token');
      const refreshToken = this.getCookie('refreshToken');
      const sessionId = this.getCookie('sessionId');
      const userCookie = this.getCookie('user');

      if (token && !this.authState.token) {
        this.authState.token = token;
        this.authState.refreshToken = refreshToken;
        this.authState.sessionId = sessionId;
        
        if (userCookie) {
          try {
            this.authState.user = JSON.parse(decodeURIComponent(userCookie));
            this.authState.permissions = this.authState.user?.permissions || [];
            this.authState.isAuthenticated = true;
          } catch (error) {
            console.error('❌ [AUTH-CLIENT] Erro ao parsear cookie do usuário:', error);
          }
        }
      }

      // Verificar se o token expirou
      if (this.authState.expiresAt && new Date() > new Date(this.authState.expiresAt)) {
        console.log('⏰ [AUTH-CLIENT] Token expirado, tentando renovar...');
        this.refreshAccessToken();
      }

    } catch (error) {
      console.error('❌ [AUTH-CLIENT] Erro ao inicializar do storage:', error);
      this.clearAuthState();
    }
  }

  /**
   * Fazer login
   */
  public async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('🔐 [AUTH-CLIENT] Iniciando login...');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include' // Incluir cookies
      });

      const result: LoginResponse = await response.json();

      if (result.success && result.data) {
        const { user, accessToken, refreshToken, sessionId, expiresAt } = result.data;

        // Atualizar estado
        this.authState = {
          isAuthenticated: true,
          user,
          token: accessToken,
          refreshToken,
          sessionId,
          expiresAt,
          permissions: user.permissions
        };

        // Salvar no localStorage
        this.saveToStorage();

        // Configurar auto-refresh
        this.setupAutoRefresh();

        // Notificar listeners
        this.notifyListeners();

        console.log('✅ [AUTH-CLIENT] Login realizado com sucesso');
        console.log('👤 [AUTH-CLIENT] Usuário:', user.email, '(' + user.role + ')');
        console.log('🔑 [AUTH-CLIENT] Permissões:', user.permissions.length);
      }

      return result;

    } catch (error: any) {
      console.error('❌ [AUTH-CLIENT] Erro no login:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Fazer logout
   */
  public async logout(): Promise<void> {
    try {
      console.log('🚪 [AUTH-CLIENT] Fazendo logout...');

      if (this.authState.token) {
        // Chamar API de logout
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authState.token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
      }

    } catch (error) {
      console.error('❌ [AUTH-CLIENT] Erro no logout:', error);
    } finally {
      // Limpar estado local independentemente do resultado da API
      this.clearAuthState();
      console.log('✅ [AUTH-CLIENT] Logout concluído');
    }
  }

  /**
   * Renovar token de acesso
   */
  public async refreshAccessToken(): Promise<boolean> {
    if (!this.authState.refreshToken) {
      console.log('❌ [AUTH-CLIENT] Sem refresh token disponível');
      this.clearAuthState();
      return false;
    }

    try {
      console.log('🔄 [AUTH-CLIENT] Renovando token...');

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.authState.refreshToken
        }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success && result.data) {
        const { accessToken, refreshToken, expiresIn } = result.data;

        // Atualizar tokens
        this.authState.token = accessToken;
        this.authState.refreshToken = refreshToken;
        this.authState.expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

        // Salvar no localStorage
        this.saveToStorage();

        // Reconfigurar auto-refresh
        this.setupAutoRefresh();

        // Notificar listeners
        this.notifyListeners();

        console.log('✅ [AUTH-CLIENT] Token renovado com sucesso');
        return true;
      } else {
        console.log('❌ [AUTH-CLIENT] Falha ao renovar token:', result.message);
        this.clearAuthState();
        return false;
      }

    } catch (error) {
      console.error('❌ [AUTH-CLIENT] Erro ao renovar token:', error);
      this.clearAuthState();
      return false;
    }
  }

  /**
   * Verificar se o usuário tem uma permissão específica
   */
  public hasPermission(permission: string): boolean {
    return this.authState.permissions.includes(permission);
  }

  /**
   * Verificar se o usuário tem uma das permissões especificadas
   */
  public hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Verificar se o usuário tem todas as permissões especificadas
   */
  public hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Verificar se o usuário tem um role específico
   */
  public hasRole(role: string): boolean {
    return this.authState.user?.role === role;
  }

  /**
   * Verificar se o usuário tem um dos roles especificados
   */
  public hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.authState.user?.role || '');
  }

  /**
   * Obter estado atual da autenticação
   */
  public getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Obter token de acesso atual
   */
  public getAccessToken(): string | null {
    return this.authState.token;
  }

  /**
   * Verificar se está autenticado
   */
  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated && !!this.authState.token;
  }

  /**
   * Adicionar listener para mudanças no estado de autenticação
   */
  public addAuthListener(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    // Retornar função para remover o listener
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Configurar renovação automática do token
   */
  private setupAutoRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.authState.expiresAt || !this.authState.isAuthenticated) {
      return;
    }

    const expiresAt = new Date(this.authState.expiresAt).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    // Renovar 2 minutos antes da expiração
    const refreshTime = Math.max(timeUntilExpiry - 2 * 60 * 1000, 30 * 1000);

    console.log(`⏰ [AUTH-CLIENT] Auto-refresh configurado para ${Math.round(refreshTime / 1000)}s`);

    this.refreshTimer = setTimeout(() => {
      this.refreshAccessToken();
    }, refreshTime);
  }

  /**
   * Salvar estado no localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('auth_state', JSON.stringify(this.authState));
    } catch (error) {
      console.error('❌ [AUTH-CLIENT] Erro ao salvar no localStorage:', error);
    }
  }

  /**
   * Limpar estado de autenticação
   */
  private clearAuthState(): void {
    this.authState = {
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      sessionId: null,
      expiresAt: null,
      permissions: []
    };

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // Limpar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_state');
    }

    // Notificar listeners
    this.notifyListeners();
  }

  /**
   * Notificar todos os listeners sobre mudanças no estado
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getAuthState());
      } catch (error) {
        console.error('❌ [AUTH-CLIENT] Erro ao notificar listener:', error);
      }
    });
  }

  /**
   * Obter valor de um cookie
   */
  private getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    
    return null;
  }
}

// Exportar instância singleton
export const authClient = AuthClient.getInstance();

// Hook para React (se estiver usando React)
export function useAuth() {
  const [authState, setAuthState] = React.useState<AuthState>(authClient.getAuthState());

  React.useEffect(() => {
    const unsubscribe = authClient.addAuthListener(setAuthState);
    return unsubscribe;
  }, []);

  return {
    ...authState,
    login: authClient.login.bind(authClient),
    logout: authClient.logout.bind(authClient),
    refreshToken: authClient.refreshAccessToken.bind(authClient),
    hasPermission: authClient.hasPermission.bind(authClient),
    hasAnyPermission: authClient.hasAnyPermission.bind(authClient),
    hasAllPermissions: authClient.hasAllPermissions.bind(authClient),
    hasRole: authClient.hasRole.bind(authClient),
    hasAnyRole: authClient.hasAnyRole.bind(authClient),
    getAccessToken: authClient.getAccessToken.bind(authClient)
  };
}

export default authClient;