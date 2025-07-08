// Serviço simples e direto de autenticação - SEM LOOPS
import { CookieManager } from '@/utils/cookieManager';
import { SessionService, SessionData } from './sessionService';
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

/**
 * Serviço simplificado de autenticação
 * Sem loops, sem complexidades, apenas o essencial
 */
export class UnifiedAuthService {
  
  /**
   * Salva dados de autenticação APENAS no localStorage
   */
  static async saveAuthData(authData: AuthData): Promise<{
    success: boolean;
    sessionId?: string;
    message: string;
  }> {
    try {
      console.log('💾 Salvando dados de autenticação...');

      // 1. Salvar no localStorage - SIMPLES E DIRETO
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('accessToken', authData.accessToken);
        localStorage.setItem('refreshToken', authData.refreshToken);
        localStorage.setItem('user', JSON.stringify(authData.user));
        
        // Compatibilidade com chaves legadas
        localStorage.setItem('auth_token', authData.accessToken);
        localStorage.setItem('token', authData.accessToken);
      }

      // 2. Salvar nos cookies - SIMPLES
      CookieManager.setAuthCookies({
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        user: authData.user,
        sessionId: authData.sessionId
      });

      // 3. Tentar criar sessão no Redis (opcional)
      let sessionId = authData.sessionId;
      try {
        const sessionData: SessionData = {
          userId: authData.user.id,
          email: authData.user.email,
          role: authData.user.role,
          permissions: authData.user.permissions,
          loginTime: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          ipAddress: 'unknown',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          deviceInfo: typeof navigator !== 'undefined' ? navigator.platform : 'unknown'
        };

        const sessionResult = await SessionService.createSession(
          sessionData,
          authData.accessToken,
          authData.expiresIn
        );

        if (sessionResult.success && sessionResult.data?.sessionId) {
          sessionId = sessionResult.data.sessionId;
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            localStorage.setItem('sessionId', sessionId);
          }
          console.log('✅ Sessão Redis criada:', sessionId);
        }
      } catch (error) {
        console.warn('⚠️ Redis indisponível, continuando sem sessão:', error);
      }

      console.log('✅ Dados salvos com sucesso');
      return {
        success: true,
        sessionId,
        message: 'Dados salvos com sucesso'
      };

    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error);
      return {
        success: false,
        message: 'Erro ao salvar dados de autenticação'
      };
    }
  }

  /**
   * Obtém token de acesso - SIMPLES
   */
  static getAccessToken(): string | null {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        return localStorage.getItem('accessToken') || 
               localStorage.getItem('auth_token') || 
               localStorage.getItem('token') ||
               CookieManager.get('access_token');
      } else {
        // Em ambiente de servidor, tenta apenas o CookieManager
        return CookieManager.get('access_token');
      }
    } catch {
      return null;
    }
  }

  /**
   * Obtém usuário atual - SIMPLES
   */
  static getCurrentUser(): any | null {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          return JSON.parse(userStr);
        }
      }
      return CookieManager.getAuthData().user || null;
    } catch {
      return null;
    }
  }

  /**
   * Obtém ID da sessão - SIMPLES
   */
  static getSessionId(): string | null {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        return localStorage.getItem('sessionId') || 
               CookieManager.get('session_id');
      } else {
        return CookieManager.get('session_id');
      }
    } catch {
      return null;
    }
  }

  /**
   * Verifica se está autenticado - SIMPLES
   */
  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Limpa TODOS os dados de autenticação - SIMPLES E DIRETO
   */
  static async clearAuthData(sessionId?: string | null, token?: string | null): Promise<void> {
    try {
      console.log('🧹 Limpando dados de autenticação...');

      // 1. Limpar localStorage
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const keysToRemove = [
          'accessToken', 'refreshToken', 'user', 'sessionId',
          'auth_token', 'token', 'authToken', 'user_data'
        ];
        
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            // Ignorar erros individuais
          }
        });
      }

      // 2. Limpar cookies
      CookieManager.clearAuthCookies();

      // 3. Tentar limpar sessão Redis (opcional)
      if (sessionId && token) {
        try {
          await SessionService.deleteSession(sessionId, token);
          console.log('✅ Sessão Redis removida');
        } catch (error) {
          console.warn('⚠️ Erro ao remover sessão Redis:', error);
        }
      }

      console.log('✅ Dados de autenticação limpos');
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
    }
  }

  /**
   * Atualiza token de acesso - SIMPLES
   */
  static async updateAccessToken(newToken: string, sessionId?: string): Promise<void> {
    try {
      console.log('🔄 Atualizando token...');

      // Atualizar localStorage
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('accessToken', newToken);
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('token', newToken);
      }

      // Atualizar cookies
      CookieManager.updateAccessToken(newToken);

      // Tentar estender sessão Redis (opcional)
      if (sessionId) {
        try {
          await SessionService.extendSession(sessionId, 60 * 60 * 2, newToken);
        } catch (error) {
          console.warn('⚠️ Erro ao estender sessão Redis:', error);
        }
      }

      console.log('✅ Token atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar token:', error);
    }
  }

  /**
   * Atualiza atividade do usuário - SIMPLES
   */
  static async updateActivity(): Promise<void> {
    try {
      const sessionId = this.getSessionId();
      const token = this.getAccessToken();
      
      if (sessionId && token) {
        await SessionService.updateActivity(sessionId, token);
      }
    } catch (error) {
      // Falha silenciosa - não é crítico
    }
  }

  /**
   * Logout completo - SIMPLES, SEM LOOPS
   */
  static async performCompleteLogout(redirectToLogin: boolean = true): Promise<boolean> {
    try {
      console.log('🔓 UnifiedAuthService: Iniciando logout completo...');
      
      const token = this.getAccessToken();
      const sessionId = this.getSessionId();
      
      // 1. Chamar API de logout (opcional, com timeout)
      if (token) {
        try {
          console.log('📡 Notificando backend sobre logout...');
          await fetch(`${getApiUrl()}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined // Timeout de 5 segundos se disponível
          });
          console.log('✅ Backend notificado sobre logout');
        } catch (error) {
          console.warn('⚠️ Erro ao notificar backend (ignorando):', error);
        }
      }
      
      // 2. Limpar todos os dados de autenticação
      await this.clearAuthData(sessionId, token);
      
      // 3. Limpeza adicional para garantir que tudo seja removido
      if (typeof window !== 'undefined') {
        try {
          // Limpar todos os storages
          if (typeof localStorage !== 'undefined') {
            localStorage.clear();
          }
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.clear();
          }
          
          // Limpar todos os cookies
          if (typeof document !== 'undefined' && document.cookie) {
            document.cookie.split(";").forEach(function(c) { 
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
          }
          
          console.log('🧹 Limpeza completa de dados realizada');
        } catch (error) {
          console.warn('⚠️ Erro na limpeza adicional:', error);
        }
      }
      
      // 4. Redirecionar se solicitado usando window.location para garantir nova sessão
      if (redirectToLogin && typeof window !== 'undefined') {
        console.log('🔄 Redirecionando para login...');
        window.location.href = '/auth/login?logout=true';
      }
      
      console.log('✅ Logout completo realizado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      
      // Limpeza de emergência
      try {
        if (typeof window !== 'undefined') {
          console.log('🚨 Executando limpeza de emergência...');
          if (typeof localStorage !== 'undefined') {
            localStorage.clear();
          }
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.clear();
          }
          CookieManager.clearAuthCookies();
          
          // Limpar cookies manualmente também
          if (typeof document !== 'undefined' && document.cookie) {
            document.cookie.split(";").forEach(function(c) { 
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
          }
        }
      } catch (emergencyError) {
        console.error('❌ Erro na limpeza de emergência:', emergencyError);
      }
      
      if (redirectToLogin && typeof window !== 'undefined') {
        window.location.href = '/auth/login?logout=error';
      }
      
      return false;
    }
  }

  // REMOVIDAS todas as funções complexas que causavam loops:
  // - loadAuthData() 
  // - syncStorages()
  // - Métodos privados desnecessários
  // - Flags de proteção contra loop (não precisam mais)
} 