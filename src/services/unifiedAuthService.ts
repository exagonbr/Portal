// Serviço unificado de autenticação que gerencia localStorage, cookies e Redis
import { CookieManager } from '@/utils/cookieManager';
import { SessionService, SessionData } from './sessionService';
import { getDashboardPath } from '@/utils/roleRedirect';
import { getApiUrl } from '@/config/urls';

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
  }

  /**
   * Remove dados de autenticação de todos os locais
   */
  static async clearAuthData(sessionId?: string, token?: string): Promise<void> {
    // 1. Remover do localStorage
    this.clearLocalStorage();

    // 2. Remover dos cookies
    CookieManager.clearAuthCookies();

    // 3. Remover sessão do Redis
    if (sessionId && token) {
      await SessionService.deleteSession(sessionId, token);
    }
  }

  /**
   * Atualiza token de acesso em todos os locais
   */
  static async updateAccessToken(newToken: string, sessionId?: string): Promise<void> {
    console.log('🔄 Atualizando token de acesso...');

    try {
      // 1. Atualizar localStorage
      const currentData = this.loadFromLocalStorage();
      if (currentData) {
        currentData.accessToken = newToken;
        this.saveToLocalStorage(currentData);
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
   * Verifica se o usuário está autenticado em qualquer local
   */
  static isAuthenticated(): boolean {
    const data = this.loadAuthData();
    return !!(data.merged?.accessToken && data.merged?.user);
  }

  /**
   * Obtém dados do usuário atual
   */
  static getCurrentUser(): AuthData['user'] | null {
    const data = this.loadAuthData();
    return data.merged?.user || null;
  }

  /**
   * Obtém token de acesso atual
   */
  static getAccessToken(): string | null {
    const data = this.loadAuthData();
    return data.merged?.accessToken || null;
  }

  /**
   * Obtém ID da sessão atual
   */
  static getSessionId(): string | null {
    const data = this.loadAuthData();
    return data.merged?.sessionId || null;
  }

  // Métodos privados para gerenciar localStorage
  private static saveToLocalStorage(authData: AuthData): void {
    try {
      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      localStorage.setItem('user', JSON.stringify(authData.user));
      
      if (authData.sessionId) {
        localStorage.setItem('sessionId', authData.sessionId);
      }

      console.log('💾 Dados salvos no localStorage');
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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      console.log('🧹 localStorage limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar localStorage:', error);
    }
  }

  // Métodos privados para gerenciar cookies
  private static saveToCookies(authData: AuthData): void {
    try {
      CookieManager.setAuthCookies({
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        user: authData.user,
        sessionId: authData.sessionId
      });
    } catch (error) {
      console.error('Erro ao salvar nos cookies:', error);
    }
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

  // Métodos utilitários
  private static updateSessionId(sessionId: string): void {
    try {
      localStorage.setItem('sessionId', sessionId);
      CookieManager.set('session_id', sessionId, {
        maxAge: 60 * 60 * 24 * 1, // 1 dia
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
    try {
      const screen = window.screen;
      return `${screen.width}x${screen.height}, ${navigator.platform}`;
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Sincroniza dados entre localStorage e cookies
   */
  static syncStorages(): void {
    console.log('🔄 Sincronizando dados entre storages...');
    
    const data = this.loadAuthData();
    
    if (data.localStorage && !data.cookies) {
      console.log('📋 Sincronizando localStorage → cookies');
      this.saveToCookies(data.localStorage);
    } else if (data.cookies && !data.localStorage) {
      console.log('📋 Sincronizando cookies → localStorage');
      this.saveToLocalStorage(data.cookies);
    }
  }

  /**
   * Atualiza atividade da sessão (heartbeat)
   */
  static async updateActivity(): Promise<void> {
    const sessionId = this.getSessionId();
    const token = this.getAccessToken();

    if (sessionId && token) {
      try {
        await SessionService.updateActivity(sessionId, token);
      } catch (error) {
        console.warn('⚠️ Erro ao atualizar atividade da sessão:', error);
      }
    }
  }
} 