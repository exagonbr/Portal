// Serviço simples e direto de autenticação - SEM LOOPS
import { CookieManager } from '@/utils/cookieManager';
import { SessionService, SessionData } from './sessionService';
import { SessionPersistenceService } from './sessionPersistenceService';
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
   * Salva dados de autenticação com persistência robusta
   */
  static async saveAuthData(authData: AuthData): Promise<{
    success: boolean;
    sessionId?: string;
    message: string;
  }> {
    try {
      console.log('💾 Salvando dados de autenticação...');

      // 1. Usar o novo sistema de persistência
      SessionPersistenceService.saveSession({
        userId: authData.user.id,
        email: authData.user.email,
        name: authData.user.name,
        role: authData.user.role,
        permissions: authData.user.permissions,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        sessionId: authData.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        expiresAt: Date.now() + (authData.expiresIn * 1000 || 60 * 60 * 1000), // 1h padrão
        refreshExpiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 dias
      });

      // 2. Manter compatibilidade com sistema legado
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('accessToken', authData.accessToken);
        localStorage.setItem('refreshToken', authData.refreshToken);
        localStorage.setItem('user', JSON.stringify(authData.user));
        
        // Compatibilidade com chaves legadas
        localStorage.setItem('auth_token', authData.accessToken);
        localStorage.setItem('token', authData.accessToken);
      }

      // 3. Salvar nos cookies - SIMPLES
      CookieManager.setAuthCookies({
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        user: authData.user,
        sessionId: authData.sessionId
      });

      // 4. Tentar criar sessão no Redis (opcional)
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

      console.log('✅ Dados salvos com persistência robusta');
      return {
        success: true,
        sessionId,
        message: 'Dados salvos com persistência robusta'
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
   * Obtém token de acesso - VERSÃO MELHORADA (assíncrona com refresh automático)
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      // Primeiro, tentar usar o sistema de persistência (com refresh automático)
      if (typeof window !== 'undefined') {
        const persistentToken = await SessionPersistenceService.getCurrentAccessToken();
        if (persistentToken) {
          return persistentToken;
        }
      }

      // Fallback para métodos legados
      const token = this.getAccessTokenSync();
      if (token) {
        return token;
      }

      // Se não encontrou token, limpar dados de autenticação
      await this.clearAuthData();
      return null;
    } catch {
      // Se houver erro, limpar dados de autenticação
      await this.clearAuthData();
      return null;
    }
  }

  /**
   * Obtém token de acesso - VERSÃO SÍNCRONA (sem refresh automático)
   */
  static getAccessTokenSync(): string | null {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('accessToken') || 
                   localStorage.getItem('auth_token') || 
                   localStorage.getItem('token') ||
                   CookieManager.get('access_token');
      
      // Se encontrou token, verificar se é válido
      if (token) {
        try {
          // Verificar se o token é um JWT válido
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const payload = JSON.parse(jsonPayload);
          const expirationTime = payload.exp * 1000; // Converter para milissegundos
          
          // Se o token expirou, retornar null
          if (Date.now() >= expirationTime) {
            return null;
          }
          
          return token;
        } catch {
          // Se houver erro ao decodificar o token, retornar null
          return null;
        }
      }
    }
    return CookieManager.get('access_token');
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
   * Verifica se está autenticado - VERSÃO MELHORADA
   */
  static isAuthenticated(): boolean {
    // Usar o sistema de persistência se disponível
    if (typeof window !== 'undefined') {
      const isValid = SessionPersistenceService.isSessionValid();
      if (isValid) return true;
    }

    // Fallback para verificação legada
    const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
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
      const token = await this.getAccessToken();
      
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
      
      const token = this.getAccessTokenSync();
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