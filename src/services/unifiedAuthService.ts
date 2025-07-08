// Serviço unificado de autenticação que gerencia localStorage, cookies e Redis
import { CookieManager } from '@/utils/cookieManager';
import { SessionService, SessionData } from './sessionService';
import { getDashboardPath } from '@/utils/roleRedirect';
import { getApiUrl } from '@/config/urls';
import { clearAllDataForUnauthorized } from '@/utils/clearAllData';

// Flag para evitar loops infinitos durante carregamento e sincronização
let isLoadingData = false;
let isSyncingStorages = false;

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
    institution_name?: string;
  };
  sessionId?: string;
  expiresIn: number;
}

export interface LoginResponse {
  success: boolean;
  data?: AuthData;
  message: string;
}

export class UnifiedAuthService {
  /**
   * Salva dados de autenticação em todos os locais (localStorage, cookies, Redis)
   */
  static async saveAuthData(authData: AuthData): Promise<{
    success: boolean;
    sessionId?: string;
    message: string;
  }> {
    try {
      console.log('💾 Salvando dados de autenticação em todos os locais...');

      // 1. Salvar no localStorage
      this.saveToLocalStorage(authData);

      // 2. Salvar nos cookies
      this.saveToCookies(authData);

      // 3. Criar sessão no Redis
      const sessionData: SessionData = {
        userId: authData.user.id,
        email: authData.user.email,
        role: authData.user.role,
        permissions: authData.user.permissions,
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        deviceInfo: this.getDeviceInfo()
      };

      const sessionResult = await SessionService.createSession(
        sessionData,
        authData.accessToken,
        authData.expiresIn
      );

      if (sessionResult.success && sessionResult.data) {
        // Atualizar sessionId nos outros locais de armazenamento
        const updatedAuthData = { ...authData, sessionId: sessionResult.data.sessionId };
        this.updateSessionId(sessionResult.data.sessionId);

        console.log('✅ Dados salvos em todos os locais com sessão:', sessionResult.data.sessionId);
        
        return {
          success: true,
          sessionId: sessionResult.data.sessionId,
          message: 'Dados salvos com sucesso'
        };
      } else {
        console.warn('⚠️ Dados salvos localmente, mas sessão Redis falhou:', sessionResult.message);
        return {
          success: true,
          message: 'Dados salvos localmente (Redis indisponível)'
        };
      }

    } catch (error) {
      console.error('❌ Erro ao salvar dados de autenticação:', error);
      return {
        success: false,
        message: 'Erro ao salvar dados de autenticação'
      };
    }
  }

  /**
   * Carrega dados de autenticação de todos os locais
   */
  static loadAuthData(): {
    localStorage: AuthData | null;
    cookies: AuthData | null;
    merged: AuthData | null;
  } {
    // Proteção contra loop infinito
    if (isLoadingData) {
      console.warn('⚠️ Detectada chamada recursiva a loadAuthData(), retornando dados vazios');
      return {
        localStorage: null,
        cookies: null,
        merged: null
      };
    }

    try {
      isLoadingData = true;
      console.log('📂 Carregando dados de autenticação...');

      const localStorageData = this.loadFromLocalStorage();
      const cookieData = this.loadFromCookies();

      // Priorizar dados mais recentes (localStorage geralmente é mais atualizado)
      const merged = localStorageData || cookieData;

      console.log('📋 Dados carregados:', {
        hasLocalStorage: !!localStorageData,
        hasCookies: !!cookieData,
        hasMerged: !!merged
      });

      return {
        localStorage: localStorageData,
        cookies: cookieData,
        merged
      };
    } finally {
      isLoadingData = false;
    }
  }

  /**
   * Remove dados de autenticação de todos os locais
   */
  static async clearAuthData(sessionId?: string | null, token?: string | null): Promise<void> {
    // 1. Remover do localStorage
    this.clearLocalStorage();

    // 2. Remover dos cookies
    CookieManager.clearAuthCookies();

    // 3. Remover sessão do Redis
    if (sessionId && token) {
      try {
        await SessionService.deleteSession(sessionId, token);
      } catch (error) {
        console.error('❌ Erro ao excluir sessão do Redis:', error);
        // Continuar mesmo com erro
      }
    }
  }

  /**
   * Realiza o logout completo do usuário
   * Limpa todos os dados e redireciona para a página de login
   */
  static async performCompleteLogout(redirectToLogin: boolean = true): Promise<boolean> {
    try {
      console.log('🔓 Iniciando logout completo...');
      
      // 1. Obter dados antes de limpar
      const token = this.getAccessToken();
      const sessionId = this.getSessionId();
      
      // 2. Chamar API de logout
      if (token) {
        try {
          await fetch(`${getApiUrl()}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
          });
          console.log('✅ API de logout chamada com sucesso');
        } catch (err) {
          console.error('⚠️ Erro ao chamar API de logout:', err);
          // Continuar mesmo com erro na API
        }
      }
      
      // 3. Limpar dados de autenticação
      await this.clearAuthData(sessionId, token);
      
      // 4. Limpar todos os outros dados
      await clearAllDataForUnauthorized();
      
      console.log('✅ Logout completo realizado - todos os dados limpos');
      
      // 5. Redirecionar para login se solicitado
      if (redirectToLogin && typeof window !== 'undefined') {
        window.location.href = '/auth/login?logout=true';
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro durante logout completo:', error);
      
      // Tentar limpeza de emergência
      try {
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
          CookieManager.clearAuthCookies();
        }
      } catch (e) {
        console.error('❌ Erro na limpeza de emergência:', e);
      }
      
      // Redirecionar mesmo com erro
      if (redirectToLogin && typeof window !== 'undefined') {
        window.location.href = '/auth/login?logout=error';
      }
      
      return false;
    }
  }

  /**
   * Atualiza token de acesso em todos os locais
   */
  static async updateAccessToken(newToken: string, sessionId?: string): Promise<void> {
    console.log('🔄 Atualizando token de acesso...');

    try {
      // 1. Atualizar localStorage diretamente sem usar loadAuthData
      try {
        const userStr = localStorage.getItem('user');
        if (userStr && newToken) {
          localStorage.setItem('accessToken', newToken);
          localStorage.setItem('auth_token', newToken);
          localStorage.setItem('token', newToken);
          localStorage.setItem('authToken', newToken);
        }
      } catch (error) {
        console.error('❌ Erro ao atualizar token no localStorage:', error);
      }

      // 2. Atualizar cookies
      CookieManager.updateAccessToken(newToken);

      // 3. Estender sessão no Redis
      if (sessionId) {
        await SessionService.extendSession(sessionId, 60 * 60 * 2, newToken); // 2 horas
      }

      console.log('✅ Token atualizado em todos os locais');
    } catch (error) {
      console.error('❌ Erro ao atualizar token:', error);
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  static isAuthenticated(): boolean {
    // Verificar diretamente no localStorage e cookies sem usar loadAuthData
    try {
      const lsToken = localStorage.getItem('accessToken') || 
                     localStorage.getItem('auth_token') || 
                     localStorage.getItem('token');
      
      if (lsToken) return true;
      
      const cookieToken = CookieManager.get('access_token');
      return !!cookieToken;
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      return false;
    }
  }

  /**
   * Obtém usuário atual
   */
  static getCurrentUser(): any | null {
    try {
      // Tentar obter do localStorage primeiro
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      
      // Se não encontrar, tentar dos cookies
      return CookieManager.getAuthData().user;
    } catch (error) {
      console.error('❌ Erro ao obter usuário atual:', error);
      return null;
    }
  }

  /**
   * Obtém token de acesso atual
   */
  static getAccessToken(): string | null {
    try {
      // Tentar obter do localStorage primeiro
      const token = localStorage.getItem('accessToken') || 
                    localStorage.getItem('auth_token') || 
                    localStorage.getItem('token');
      
      if (token) return token;
      
      // Se não encontrar, tentar dos cookies
      return CookieManager.get('access_token');
    } catch (error) {
      console.error('❌ Erro ao obter access token:', error);
      return null;
    }
  }

  /**
   * Obtém ID da sessão atual
   */
  static getSessionId(): string | null {
    try {
      // Tentar obter do localStorage primeiro
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) return sessionId;
      
      // Se não encontrar, tentar dos cookies
      return CookieManager.get('session_id');
    } catch (error) {
      console.error('❌ Erro ao obter sessionId:', error);
      return null;
    }
  }

  /**
   * Sincroniza dados entre storages
   */
  static syncStorages(): void {
    // Proteção contra loop infinito
    if (isSyncingStorages) {
      console.warn('⚠️ Detectada chamada recursiva a syncStorages(), abortando');
      return;
    }

    try {
      isSyncingStorages = true;
      
      // Carregar dados sem usar loadAuthData para evitar loops
      let user = null;
      let accessToken = null;
      let refreshToken = null;
      let sessionId: string | undefined = undefined;
      
      try {
        // Tentar obter do localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) user = JSON.parse(userStr);
        accessToken = localStorage.getItem('accessToken');
        refreshToken = localStorage.getItem('refreshToken');
        const storedSessionId = localStorage.getItem('sessionId');
        if (storedSessionId) sessionId = storedSessionId;
        
        // Se não encontrar no localStorage, tentar dos cookies
        if (!user || !accessToken || !refreshToken) {
          const cookieData = CookieManager.getAuthData();
          if (!user && cookieData.user) user = cookieData.user;
          if (!accessToken && cookieData.accessToken) accessToken = cookieData.accessToken;
          if (!refreshToken && cookieData.refreshToken) refreshToken = cookieData.refreshToken;
          if (!sessionId && cookieData.sessionId) sessionId = cookieData.sessionId || undefined;
        }
        
        // Se temos dados suficientes, salvar em ambos os lugares
        if (user && accessToken && refreshToken) {
          // Garantir que os tipos estão corretos para a interface AuthData
          const authData: AuthData = {
            user,
            accessToken,
            refreshToken,
            sessionId,
            expiresIn: 0
          };
          
          this.saveToLocalStorage(authData);
          this.saveToCookies(authData);
          console.log('✅ Dados sincronizados entre storages');
        }
      } catch (error) {
        console.error('❌ Erro ao sincronizar storages:', error);
      }
    } finally {
      isSyncingStorages = false;
    }
  }

  /**
   * Atualiza atividade do usuário
   */
  static async updateActivity(): Promise<void> {
    try {
      const sessionId = this.getSessionId();
      const token = this.getAccessToken();
      
      if (sessionId && token) {
        await SessionService.updateActivity(sessionId, token);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar atividade:', error);
    }
  }

  private static saveToLocalStorage(authData: AuthData): void {
    try {
      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      localStorage.setItem('user', JSON.stringify(authData.user));
      
      if (authData.sessionId) {
        localStorage.setItem('sessionId', authData.sessionId);
      }
      
      // Salvar também em chaves legadas para compatibilidade
      localStorage.setItem('auth_token', authData.accessToken);
      localStorage.setItem('token', authData.accessToken);
      localStorage.setItem('authToken', authData.accessToken);
    } catch (error) {
      console.error('❌ Erro ao salvar no localStorage:', error);
    }
  }

  private static loadFromLocalStorage(): AuthData | null {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');
      const sessionId = localStorage.getItem('sessionId');

      if (!accessToken || !refreshToken || !userStr) {
        return null;
      }

      const user = JSON.parse(userStr);

      return {
        accessToken,
        refreshToken,
        user,
        sessionId: sessionId || undefined,
        expiresIn: 0 // Será calculado se necessário
      };
    } catch (error) {
      console.error('❌ Erro ao carregar do localStorage:', error);
      return null;
    }
  }

  private static clearLocalStorage(): void {
    try {
      // Limpar tokens principais
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      
      // Limpar tokens legados
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user_data');
      
      console.log('🧹 localStorage limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar localStorage:', error);
    }
  }

  private static saveToCookies(authData: AuthData): void {
    CookieManager.setAuthCookies({
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      user: authData.user,
      sessionId: authData.sessionId
    });
  }

  private static loadFromCookies(): AuthData | null {
    try {
      const cookieData = CookieManager.getAuthData();

      if (!cookieData.accessToken || !cookieData.refreshToken || !cookieData.user) {
        return null;
      }

      return {
        accessToken: cookieData.accessToken,
        refreshToken: cookieData.refreshToken,
        user: cookieData.user,
        sessionId: cookieData.sessionId || undefined,
        expiresIn: 0
      };
    } catch (error) {
      console.error('❌ Erro ao carregar dos cookies:', error);
      return null;
    }
  }

  private static updateSessionId(sessionId: string): void {
    try {
      localStorage.setItem('sessionId', sessionId);
      CookieManager.set('session_id', sessionId, {
        maxAge: 60 * 60 * 24, // 1 dia
        secure: true,
        sameSite: 'lax'
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar sessionId:', error);
    }
  }

  private static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  private static getDeviceInfo(): string {
    const platform = navigator.platform;
    const userAgent = navigator.userAgent;
    return `${platform} - ${userAgent}`;
  }
} 