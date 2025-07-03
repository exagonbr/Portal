/**
 * Serviço de Limpeza Geral de Emergência
 * 
 * Este serviço é responsável por realizar uma limpeza completa do sistema
 * em caso de loops, erros críticos ou problemas de autenticação.
 */

export interface CleanupResult {
  localStorageCleared: boolean;
  sessionStorageCleared: boolean;
  cookiesCleared: boolean;
  indexedDBCleared: boolean;
  redirectedToLogin: boolean;
  timestamp: string;
}

export class EmergencyCleanupService {
  private static instance: EmergencyCleanupService;

  public static getInstance(): EmergencyCleanupService {
    if (!EmergencyCleanupService.instance) {
      EmergencyCleanupService.instance = new EmergencyCleanupService();
    }
    return EmergencyCleanupService.instance;
  }

  /**
   * Executa limpeza geral completa do sistema
   */
  public async executeFullCleanup(): Promise<CleanupResult> {
    console.log('🚨 INICIANDO LIMPEZA GERAL DE EMERGÊNCIA...');
    
    const result: CleanupResult = {
      localStorageCleared: false,
      sessionStorageCleared: false,
      cookiesCleared: false,
      indexedDBCleared: false,
      redirectedToLogin: false,
      timestamp: new Date().toISOString()
    };

    try {
      // 1. Limpar localStorage
      result.localStorageCleared = this.clearLocalStorage();
      
      // 2. Limpar sessionStorage
      result.sessionStorageCleared = this.clearSessionStorage();
      
      // 3. Limpar cookies
      result.cookiesCleared = this.clearAllCookies();
      
      // 4. Limpar IndexedDB
      result.indexedDBCleared = await this.clearIndexedDB();
      
      // 5. Limpar cache do navegador (se possível)
      await this.clearBrowserCache();
      
      // 6. Notificar servidor sobre limpeza (se possível)
      await this.notifyServerCleanup();
      
      // 7. Redirecionar para login
      result.redirectedToLogin = this.redirectToLogin();
      
      console.log('✅ LIMPEZA GERAL CONCLUÍDA:', result);
      return result;

    } catch (error) {
      console.error('❌ Erro durante limpeza geral:', error);
      // Mesmo com erro, tenta redirecionar para login
      this.redirectToLogin();
      throw error;
    }
  }

  /**
   * Limpa localStorage completamente
   */
  private clearLocalStorage(): boolean {
    try {
      if (typeof Storage !== 'undefined' && localStorage) {
        // Lista de chaves específicas para remover
        const keysToRemove = [
          'accessToken',
          'auth_token',
          'token',
          'authToken',
          'user',
          'userSession',
          'systemSettings',
          'preferences',
          'cache',
          'sessionData',
          'refreshToken',
          'lastActivity',
          'courseProgress',
          'bookProgress',
          'videoProgress',
          'notifications',
          'theme',
          'language'
        ];

        // Remove chaves específicas
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });

        // Remove todas as chaves que começam com prefixos conhecidos
        const prefixes = ['portal_', 'auth_', 'session_', 'cache_', 'user_', 'course_', 'book_'];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
          if (prefixes.some(prefix => key.startsWith(prefix))) {
            localStorage.removeItem(key);
          }
        });

        console.log('✅ localStorage limpo com sucesso');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao limpar localStorage:', error);
      return false;
    }
  }

  /**
   * Limpa sessionStorage completamente
   */
  private clearSessionStorage(): boolean {
    try {
      if (typeof Storage !== 'undefined' && sessionStorage) {
        sessionStorage.clear();
        console.log('✅ sessionStorage limpo com sucesso');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao limpar sessionStorage:', error);
      return false;
    }
  }

  /**
   * Limpa todos os cookies
   */
  private clearAllCookies(): boolean {
    try {
      if (typeof document !== 'undefined') {
        // Lista de cookies conhecidos
        const cookieNames = [
          'accessToken',
          'auth_token',
          'token',
          'authToken',
          'session',
          'sessionId',
          'refreshToken',
          'user_session',
          'jid',
          'csrf_token',
          'remember_token'
        ];

        // Remove cookies específicos
        cookieNames.forEach(cookieName => {
          this.deleteCookie(cookieName);
        });

        // Tenta remover todos os cookies existentes
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name) {
            this.deleteCookie(name);
          }
        });

        console.log('✅ Cookies limpos com sucesso');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao limpar cookies:', error);
      return false;
    }
  }

  /**
   * Remove um cookie específico
   */
  private deleteCookie(name: string): void {
    const domains = [
      window.location.hostname,
      `.${window.location.hostname}`,
      'localhost',
      '.localhost'
    ];

    const paths = ['/', '/api', '/auth'];

    domains.forEach(domain => {
      paths.forEach(path => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
      });
    });
  }

  /**
   * Limpa IndexedDB
   */
  private async clearIndexedDB(): Promise<boolean> {
    try {
      if ('indexedDB' in window) {
        // Lista de bancos de dados conhecidos
        const dbNames = [
          'PortalDB',
          'AuthDB',
          'CacheDB',
          'UserDB',
          'CourseDB',
          'BookDB'
        ];

        for (const dbName of dbNames) {
          try {
            const deleteReq = indexedDB.deleteDatabase(dbName);
            await new Promise((resolve, reject) => {
              deleteReq.onsuccess = () => resolve(true);
              deleteReq.onerror = () => reject(deleteReq.error);
            });
          } catch (error) {
            console.warn(`⚠️ Erro ao deletar IndexedDB ${dbName}:`, error);
          }
        }

        console.log('✅ IndexedDB limpo com sucesso');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao limpar IndexedDB:', error);
      return false;
    }
  }

  /**
   * Limpa cache do navegador (se possível)
   */
  private async clearBrowserCache(): Promise<void> {
    try {
      // Tenta limpar cache usando Service Worker (se disponível)
      if ('serviceWorker' in navigator && 'caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('✅ Cache do navegador limpo');
      }
    } catch (error) {
      console.warn('⚠️ Não foi possível limpar cache do navegador:', error);
    }
  }

  /**
   * Notifica o servidor sobre a limpeza
   */
  private async notifyServerCleanup(): Promise<void> {
    try {
      await fetch('/api/auth/emergency-cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'client_cleanup',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      });
      console.log('✅ Servidor notificado sobre limpeza');
    } catch (error) {
      console.warn('⚠️ Não foi possível notificar servidor:', error);
    }
  }

  /**
   * Redireciona para página de login
   */
  private redirectToLogin(): boolean {
    try {
      if (typeof window !== 'undefined') {
        // Adiciona parâmetro para indicar que houve limpeza
        const loginUrl = '/login?cleanup=true&reason=emergency';
        
        // Força redirecionamento
        window.location.href = loginUrl;
        
        console.log('✅ Redirecionamento para login executado');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao redirecionar para login:', error);
      return false;
    }
  }

  /**
   * Detecta se há necessidade de limpeza baseado em padrões suspeitos
   */
  public detectLoopCondition(): boolean {
    try {
      // Verifica se há muitos tokens/dados em localStorage
      const localStorageSize = JSON.stringify(localStorage).length;
      
      // Verifica se há cookies suspeitos
      const cookieCount = document.cookie.split(';').length;
      
      // Verifica se há erros repetitivos no console
      const errorCount = this.getConsoleErrorCount();
      
      // Verifica se há redirecionamentos infinitos
      const redirectCount = this.getRedirectCount();

      const isLoopDetected = 
        localStorageSize > 1000000 || // Mais de 1MB em localStorage
        cookieCount > 50 ||           // Mais de 50 cookies
        errorCount > 100 ||           // Mais de 100 erros
        redirectCount > 10;           // Mais de 10 redirecionamentos

      if (isLoopDetected) {
        console.log('🔄 CONDIÇÃO DE LOOP DETECTADA!');
        console.log({
          localStorageSize,
          cookieCount,
          errorCount,
          redirectCount
        });
      }

      return isLoopDetected;
    } catch (error) {
      console.error('❌ Erro ao detectar condição de loop:', error);
      return false;
    }
  }

  /**
   * Obtém contagem de erros do console (aproximada)
   */
  private getConsoleErrorCount(): number {
    try {
      // Esta é uma aproximação - em produção seria melhor usar um sistema de logging
      const errorKey = 'console_error_count';
      const count = parseInt(sessionStorage.getItem(errorKey) || '0');
      return count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Obtém contagem de redirecionamentos
   */
  private getRedirectCount(): number {
    try {
      const redirectKey = 'redirect_count';
      const count = parseInt(sessionStorage.getItem(redirectKey) || '0');
      return count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Incrementa contador de redirecionamentos
   */
  public incrementRedirectCount(): void {
    try {
      const redirectKey = 'redirect_count';
      const count = parseInt(sessionStorage.getItem(redirectKey) || '0');
      sessionStorage.setItem(redirectKey, (count + 1).toString());
    } catch (error) {
      console.warn('⚠️ Erro ao incrementar contador de redirecionamento:', error);
    }
  }

  /**
   * Executa limpeza automática se condições de loop forem detectadas
   */
  public async autoCleanupIfNeeded(): Promise<boolean> {
    if (this.detectLoopCondition()) {
      console.log('🚨 EXECUTANDO LIMPEZA AUTOMÁTICA...');
      await this.executeFullCleanup();
      return true;
    }
    return false;
  }
}

// Função utilitária para uso rápido
export const emergencyCleanup = async (): Promise<CleanupResult> => {
  const service = EmergencyCleanupService.getInstance();
  return await service.executeFullCleanup();
};

// Função para detectar e limpar automaticamente
export const autoCleanupIfNeeded = async (): Promise<boolean> => {
  const service = EmergencyCleanupService.getInstance();
  return await service.autoCleanupIfNeeded();
};

export default EmergencyCleanupService; 