/**
 * Serviço centralizado para gerenciar o processo completo de logout
 * Garante que todos os dados sejam limpos corretamente
 */

export class LogoutService {
  /**
   * Realiza logout completo limpando localStorage, sessionStorage, cookies, Redis e backend
   */
  static async performCompleteLogout(): Promise<void> {
    console.log('🔄 LogoutService: Iniciando logout completo');

    try {
      // 1. Limpar localStorage
      await this.clearLocalStorage();

      // 2. Limpar sessionStorage
      await this.clearSessionStorage();

      // 3. Limpar cookies
      await this.clearCookies();

      // 4. Invalidar sessão no Redis
      await this.invalidateRedisSession();

      // 5. Notificar backend sobre logout
      await this.notifyBackendLogout();

      // 6. Aguardar um pouco para garantir que tudo foi processado
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('✅ LogoutService: Logout completo realizado com sucesso');
    } catch (error) {
      console.error('❌ LogoutService: Erro durante logout:', error);
      // Mesmo com erro, tentar limpeza de emergência
      await this.emergencyCleanup();
      throw error;
    }
  }

  /**
   * Limpa localStorage
   */
  private static async clearLocalStorage(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      console.log('🔄 LogoutService: Limpando localStorage');
      
      const keysToRemove = [
        'auth_token',
        'refresh_token',
        'session_id',
        'user',
        'user_data',
        'auth_expires_at',
        'next-auth.session-token',
        'next-auth.csrf-token',
        '__Secure-next-auth.session-token',
        '__Host-next-auth.csrf-token'
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log('✅ LogoutService: localStorage limpo');
    } catch (error) {
      console.error('❌ LogoutService: Erro ao limpar localStorage:', error);
      // Fallback: limpar tudo
      try {
        localStorage.clear();
      } catch (fallbackError) {
        console.error('❌ LogoutService: Erro no fallback do localStorage:', fallbackError);
      }
    }
  }

  /**
   * Limpa sessionStorage
   */
  private static async clearSessionStorage(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      console.log('🔄 LogoutService: Limpando sessionStorage');
      sessionStorage.clear();
      console.log('✅ LogoutService: sessionStorage limpo');
    } catch (error) {
      console.error('❌ LogoutService: Erro ao limpar sessionStorage:', error);
    }
  }

  /**
   * Limpa cookies
   */
  private static async clearCookies(): Promise<void> {
    if (typeof document === 'undefined') return;

    try {
      console.log('🔄 LogoutService: Limpando cookies');
      
      const cookiesToClear = [
        'auth_token',
        'refresh_token',
        'session_id',
        'user_data',
        'next-auth.session-token',
        'next-auth.csrf-token',
        '__Secure-next-auth.session-token',
        '__Host-next-auth.csrf-token'
      ];

      cookiesToClear.forEach(cookieName => {
        // Limpar para diferentes paths e domínios
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
      });

      console.log('✅ LogoutService: Cookies limpos');
    } catch (error) {
      console.error('❌ LogoutService: Erro ao limpar cookies:', error);
    }
  }

  /**
   * Invalida sessão no Redis
   */
  private static async invalidateRedisSession(): Promise<void> {
    try {
      console.log('🔄 LogoutService: Invalidando sessão no Redis');
      
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        console.log('ℹ️ LogoutService: Nenhum session_id encontrado para invalidar');
        return;
      }

      const response = await fetch('/api/sessions/invalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        console.log('✅ LogoutService: Sessão Redis invalidada');
      } else {
        console.warn('⚠️ LogoutService: Erro ao invalidar sessão no Redis');
      }
    } catch (error) {
      console.error('❌ LogoutService: Erro ao invalidar sessão no Redis:', error);
      // Não bloqueia o logout se falhar
    }
  }

  /**
   * Notifica backend sobre logout
   */
  private static async notifyBackendLogout(): Promise<void> {
    try {
      console.log('🔄 LogoutService: Notificando backend sobre logout');
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        console.log('✅ LogoutService: Backend notificado sobre logout');
      } else {
        console.warn('⚠️ LogoutService: Erro ao notificar backend sobre logout');
      }
    } catch (error) {
      console.error('❌ LogoutService: Erro ao notificar backend:', error);
      // Não bloqueia o logout se falhar
    }
  }

  /**
   * Limpeza de emergência em caso de erro
   */
  private static async emergencyCleanup(): Promise<void> {
    console.log('🚨 LogoutService: Executando limpeza de emergência');
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      if (typeof document !== 'undefined') {
        // Limpar todos os cookies possíveis
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
      }
      
      console.log('✅ LogoutService: Limpeza de emergência concluída');
    } catch (error) {
      console.error('❌ LogoutService: Erro na limpeza de emergência:', error);
    }
  }

  /**
   * Redireciona para a página de login
   */
  static redirectToLogin(): void {
    if (typeof window !== 'undefined') {
      // Usar window.location.href para garantir recarregamento completo
      window.location.href = '/login';
    }
  }

  /**
   * Método público para logout completo com redirecionamento
   */
  static async logoutAndRedirect(): Promise<void> {
    try {
      await this.performCompleteLogout();
      this.redirectToLogin();
    } catch (error) {
      console.error('❌ LogoutService: Erro no logout, forçando redirecionamento:', error);
      // Mesmo com erro, redirecionar
      this.redirectToLogin();
    }
  }
}

export default LogoutService; 