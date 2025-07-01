/**
 * Serviço centralizado para gerenciar o processo completo de logout
 * Garante que todos os dados sejam limpos corretamente
 */

export class LogoutService {
  /**
   * Realiza logout completo limpando localStorage, sessionStorage, cookies e backend
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

      // 5. Notificar backend sobre logout
      await this.notifyBackendLogout();

      // 6. Pequena pausa para garantir que tudo foi processado
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('✅ LogoutService: Logout completo realizado com sucesso');
    } catch (error) {
      console.log('❌ LogoutService: Erro durante logout:', error);
      // Executar limpeza de emergência
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
      console.log('❌ LogoutService: Erro ao limpar localStorage:', error);
      // Fallback: limpar tudo
      try {
        localStorage.clear();
      } catch (fallbackError) {
        console.log('❌ LogoutService: Erro no fallback do localStorage:', fallbackError);
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
      console.log('❌ LogoutService: Erro ao limpar sessionStorage:', error);
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
        '__Host-next-auth.csrf-token',
        'redirect_count' // Limpar contador de redirecionamentos
      ];

      cookiesToClear.forEach(cookieName => {
        // Limpar para diferentes paths e domínios
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        
        // Em produção, limpar também para subdomínios
        if (process.env.NODE_ENV === 'production') {
          const hostname = window.location.hostname;
          const parts = hostname.split('.');
          if (parts.length > 2) {
            const rootDomain = parts.slice(-2).join('.');
            document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${rootDomain}`;
          }
        }
      });

      console.log('✅ LogoutService: Cookies limpos');
    } catch (error) {
      console.log('❌ LogoutService: Erro ao limpar cookies:', error);
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
      console.log('❌ LogoutService: Erro ao notificar backend:', error);
      // Não bloqueia o logout se falhar
    }
  }

  /**
   * Limpeza de emergência quando algo falha
   */
  private static async emergencyCleanup(): Promise<void> {
    try {
      console.log('🚨 LogoutService: Executando limpeza de emergência');
      
      if (typeof window !== 'undefined') {
        // Limpar localStorage
        try {
          localStorage.clear();
        } catch (e) {
          console.log('Erro ao limpar localStorage na emergência:', e);
        }
        
        // Limpar sessionStorage
        try {
          sessionStorage.clear();
        } catch (e) {
          console.log('Erro ao limpar sessionStorage na emergência:', e);
        }
      }
      
      console.log('✅ LogoutService: Limpeza de emergência concluída');
    } catch (error) {
      console.log('❌ LogoutService: Erro na limpeza de emergência:', error);
    }
  }

  /**
   * Determina a melhor rota de redirecionamento após logout
   */
  private static getLogoutRedirectUrl(): string {
    if (typeof window === 'undefined') return '/login';
    
    const currentPath = window.location.pathname;
    
    // Se estamos em uma rota do portal, redirecionar para login com parâmetro específico
    if (currentPath.startsWith('/portal')) {
      return '/login?from=portal';
    }
    
    // Se estamos em dashboard, redirecionar para login com parâmetro específico
    if (currentPath.startsWith('/dashboard')) {
      return '/login?from=dashboard';
    }
    
    // Redirecionamento padrão
    return '/login?logout=true';
  }

  /**
   * Método público para logout completo com redirecionamento
   */
  static async logoutAndRedirect(): Promise<void> {
    try {
      await this.performCompleteLogout();
      
      // Determinar URL de redirecionamento
      const redirectUrl = this.getLogoutRedirectUrl();
      
      // Aguardar um pouco antes do redirecionamento para garantir que tudo foi processado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirecionar usando window.location para garantir limpeza completa
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.log('❌ LogoutService: Erro no logout, forçando redirecionamento:', error);
      // Forçar redirecionamento mesmo com erro
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login?error=logout_failed';
      }
    }
  }
}

export default LogoutService; 