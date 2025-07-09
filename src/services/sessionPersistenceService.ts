import { JWT_CONFIG } from '@/config/jwt';

interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  expiresAt: number;
  refreshExpiresAt: number;
  lastActivity: number;
}

interface RefreshResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  message?: string;
}

/**
 * Serviço para gerenciar persistência robusta de sessão
 * Garante que a sessão persista até logout explícito
 */
export class SessionPersistenceService {
  private static readonly STORAGE_KEY = 'session_data';
  private static readonly ACTIVITY_KEY = 'last_activity';
  private static readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutos
  private static readonly ACTIVITY_INTERVAL = 30 * 1000; // 30 segundos
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * Salva sessão de forma persistente
   */
  static saveSession(sessionData: Partial<SessionData>): void {
    try {
      const now = Date.now();
      
      const completeSession: SessionData = {
        userId: sessionData.userId || '',
        email: sessionData.email || '',
        name: sessionData.name || '',
        role: sessionData.role || '',
        permissions: sessionData.permissions || [],
        accessToken: sessionData.accessToken || '',
        refreshToken: sessionData.refreshToken || '',
        sessionId: sessionData.sessionId || '',
        expiresAt: sessionData.expiresAt || (now + 24 * 60 * 60 * 1000), // 24h padrão
        refreshExpiresAt: sessionData.refreshExpiresAt || (now + 7 * 24 * 60 * 60 * 1000), // 7 dias
        lastActivity: now
      };

      // Salvar em localStorage (persistente)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(completeSession));
      localStorage.setItem(this.ACTIVITY_KEY, now.toString());
      
      // Salvar em sessionStorage (backup)
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(completeSession));
      
      // Salvar em cookies com expiração longa
      this.setCookies(completeSession);
      
      // Iniciar monitoramento automático
      this.startSessionMonitoring();
      
      console.log('✅ Sessão salva com persistência:', {
        userId: completeSession.userId,
        expiresAt: new Date(completeSession.expiresAt).toLocaleString(),
        refreshExpiresAt: new Date(completeSession.refreshExpiresAt).toLocaleString()
      });
      
    } catch (error) {
      console.error('❌ Erro ao salvar sessão:', error);
    }
  }

  /**
   * Recupera sessão persistente
   */
  static getSession(): SessionData | null {
    try {
      // Tentar localStorage primeiro
      let sessionStr = localStorage.getItem(this.STORAGE_KEY);
      
      // Fallback para sessionStorage
      if (!sessionStr) {
        sessionStr = sessionStorage.getItem(this.STORAGE_KEY);
      }
      
      // Fallback para cookies
      if (!sessionStr) {
        sessionStr = this.getSessionFromCookies();
      }
      
      if (!sessionStr) {
        return null;
      }
      
      const session: SessionData = JSON.parse(sessionStr);
      const now = Date.now();
      
      // Verificar se refresh token ainda é válido
      if (session.refreshExpiresAt < now) {
        console.warn('⚠️ Refresh token expirado, removendo sessão');
        this.clearSession();
        return null;
      }
      
      // Atualizar última atividade
      session.lastActivity = now;
      localStorage.setItem(this.ACTIVITY_KEY, now.toString());
      
      return session;
      
    } catch (error) {
      console.error('❌ Erro ao recuperar sessão:', error);
      return null;
    }
  }

  /**
   * Verifica se a sessão é válida
   */
  static isSessionValid(): boolean {
    const session = this.getSession();
    if (!session) return false;
    
    const now = Date.now();
    
    // Verificar se refresh token ainda é válido
    return session.refreshExpiresAt > now && 
           session.accessToken && 
           session.refreshToken;
  }

  /**
   * Verifica se o access token precisa ser renovado
   */
  static needsTokenRefresh(): boolean {
    const session = this.getSession();
    if (!session) return false;
    
    const now = Date.now();
    const timeToExpiry = session.expiresAt - now;
    
    return timeToExpiry < this.REFRESH_THRESHOLD;
  }

  /**
   * Renova o access token usando refresh token
   */
  static async refreshAccessToken(): Promise<RefreshResponse> {
    try {
      const session = this.getSession();
      if (!session?.refreshToken) {
        return { success: false, message: 'Refresh token não encontrado' };
      }
      
      console.log('🔄 Renovando access token...');
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: session.refreshToken
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro ao renovar token:', errorData);
        
        // Se refresh token é inválido, limpar sessão
        if (response.status === 401) {
          this.clearSession();
        }
        
        return { 
          success: false, 
          message: errorData.message || 'Erro ao renovar token' 
        };
      }
      
      const data = await response.json();
      
      if (data.success && data.accessToken) {
        // Atualizar sessão com novo token
        const updatedSession = {
          ...session,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || session.refreshToken,
          expiresAt: data.expiresAt || (Date.now() + 60 * 60 * 1000), // 1h padrão
          lastActivity: Date.now()
        };
        
        // Salvar sessão atualizada
        this.saveSession(updatedSession);
        
        return {
          success: true,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt
        };
      }
      
      return {
        success: false,
        message: 'Resposta inválida do servidor'
      };
      
    } catch (error) {
      console.error('❌ Erro ao renovar token:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Inicia monitoramento automático da sessão
   */
  static startSessionMonitoring(): void {
    // Limpar interval anterior se existir
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(async () => {
      const session = this.getSession();
      
      if (!session) {
        this.stopSessionMonitoring();
        return;
      }
      
      // Verificar se precisa renovar token
      if (this.needsTokenRefresh()) {
        await this.refreshAccessToken();
      }
      
      // Atualizar atividade
      this.updateActivity();
      
    }, this.ACTIVITY_INTERVAL);
    
    console.log('🔄 Monitoramento de sessão iniciado');
  }

  /**
   * Para o monitoramento automático
   */
  static stopSessionMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Monitoramento de sessão parado');
    }
  }

  /**
   * Atualiza registro de atividade
   */
  static updateActivity(): void {
    const now = Date.now();
    localStorage.setItem(this.ACTIVITY_KEY, now.toString());
    
    // Atualizar sessão se existir
    const session = this.getSession();
    if (session) {
      session.lastActivity = now;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    }
  }

  /**
   * Obtém o access token atual, renovando se necessário
   */
  static async getCurrentAccessToken(): Promise<string | null> {
    try {
      const session = this.getSession();
      if (!session) {
        return null;
      }
      
      const now = Date.now();
      
      // Se o token expirou, tentar renovar
      if (session.expiresAt <= now) {
        console.log('🔄 Token expirado, tentando renovar...');
        const refreshResult = await this.refreshAccessToken();
        
        if (!refreshResult.success) {
          console.warn('⚠️ Falha ao renovar token:', refreshResult.message);
          await this.forceLogout();
          return null;
        }
        
        return refreshResult.accessToken || null;
      }
      
      // Se está próximo de expirar, renovar em background
      if (this.needsTokenRefresh()) {
        console.log('🔄 Token próximo de expirar, renovando em background...');
        this.refreshAccessToken().catch(error => {
          console.error('❌ Erro ao renovar token em background:', error);
        });
      }
      
      return session.accessToken;
    } catch (error) {
      console.error('❌ Erro ao obter access token:', error);
      await this.forceLogout();
      return null;
    }
  }

  /**
   * Limpa toda a sessão
   */
  static clearSession(): void {
    try {
      // Parar monitoramento
      this.stopSessionMonitoring();
      
      // Limpar localStorage
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.ACTIVITY_KEY);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      
      // Limpar sessionStorage
      sessionStorage.removeItem(this.STORAGE_KEY);
      
      // Limpar cookies
      this.clearCookies();
      
      console.log('🧹 Sessão completamente limpa');
      
    } catch (error) {
      console.error('❌ Erro ao limpar sessão:', error);
    }
  }

  /**
   * Define cookies de sessão
   */
  private static setCookies(session: SessionData): void {
    const maxAge = Math.floor((session.refreshExpiresAt - Date.now()) / 1000);
    
    // Cookie de autenticação
    document.cookie = `auth_token=${session.accessToken}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
    
    // Cookie de refresh
    document.cookie = `refresh_token=${session.refreshToken}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
    
    // Cookie de dados do usuário
    document.cookie = `user_data=${encodeURIComponent(JSON.stringify({
      id: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
      permissions: session.permissions
    }))}; path=/; max-age=${maxAge}; SameSite=Lax`;
    
    // Cookie de sessão ID
    document.cookie = `session_id=${session.sessionId}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }

  /**
   * Recupera sessão dos cookies
   */
  private static getSessionFromCookies(): string | null {
    try {
      const cookies = document.cookie.split('; ');
      const userDataCookie = cookies.find(c => c.startsWith('user_data='));
      
      if (!userDataCookie) return null;
      
      const userData = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]));
      const authToken = cookies.find(c => c.startsWith('auth_token='))?.split('=')[1];
      const refreshToken = cookies.find(c => c.startsWith('refresh_token='))?.split('=')[1];
      const sessionId = cookies.find(c => c.startsWith('session_id='))?.split('=')[1];
      
      if (!authToken || !refreshToken) return null;
      
      const session: SessionData = {
        userId: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        permissions: userData.permissions || [],
        accessToken: authToken,
        refreshToken: refreshToken,
        sessionId: sessionId || '',
        expiresAt: Date.now() + 60 * 60 * 1000, // 1h padrão
        refreshExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 dias
        lastActivity: Date.now()
      };
      
      return JSON.stringify(session);
      
    } catch (error) {
      console.error('❌ Erro ao recuperar sessão dos cookies:', error);
      return null;
    }
  }

  /**
   * Limpa todos os cookies de sessão
   */
  private static clearCookies(): void {
    const cookiesToClear = [
      'auth_token',
      'refresh_token',
      'user_data',
      'session_id',
      'session_expires'
    ];
    
    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
  }

  /**
   * Força logout completo
   */
  static async forceLogout(): Promise<void> {
    try {
      const session = this.getSession();
      
      // Tentar invalidar sessão no servidor
      if (session?.sessionId) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`
          },
          body: JSON.stringify({
            sessionId: session.sessionId
          })
        });
      }
      
    } catch (error) {
      console.warn('⚠️ Erro ao invalidar sessão no servidor:', error);
    } finally {
      // Sempre limpar dados locais
      this.clearSession();
    }
  }
}

// Inicializar monitoramento quando o serviço é carregado (se há sessão)
if (typeof window !== 'undefined') {
  if (SessionPersistenceService.isSessionValid()) {
    SessionPersistenceService.startSessionMonitoring();
  }
} 