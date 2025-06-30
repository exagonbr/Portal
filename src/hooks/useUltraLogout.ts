/**
 * Hook para realizar logout ultra-completo
 * Limpa TUDO TUDO TUDO e volta para o login
 */

import { useCallback } from 'react';
import { performUltraLogout } from '../services/ultraLogoutService';

export function useUltraLogout() {
  const logout = useCallback(async () => {
    try {
      console.log('🚨 useUltraLogout: Iniciando logout ultra-completo...');
      
      // Confirmar com o usuário se necessário
      const confirmLogout = window.confirm(
        'Tem certeza que deseja sair? Todos os dados serão limpos e você será redirecionado para o login.'
      );
      
      if (!confirmLogout) {
        console.log('❌ useUltraLogout: Logout cancelado pelo usuário');
        return false;
      }
      
      // Executar ultra logout
      await performUltraLogout();
      
      return true;
    } catch (error) {
      console.error('❌ useUltraLogout: Erro durante logout:', error);
      
      // Fallback: redirecionamento manual
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login?logout=error';
      }
      
      return false;
    }
  }, []);

  const logoutWithoutConfirmation = useCallback(async () => {
    try {
      console.log('🚨 useUltraLogout: Logout sem confirmação...');
      await performUltraLogout();
      return true;
    } catch (error) {
      console.error('❌ useUltraLogout: Erro durante logout sem confirmação:', error);
      
      // Fallback: redirecionamento manual
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login?logout=error';
      }
      
      return false;
    }
  }, []);

  const emergencyLogout = useCallback(async () => {
    try {
      console.log('🚨 useUltraLogout: LOGOUT DE EMERGÊNCIA...');
      
      // Limpeza de emergência imediata
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        
        // Limpar cookies principais
        const mainCookies = ['auth_token', 'session_id', 'user_data', 'refresh_token'];
        mainCookies.forEach(cookie => {
          document.cookie = `${cookie}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
      }
      
      // Redirecionar imediatamente
      window.location.href = '/auth/login?logout=emergency';
      
      return true;
    } catch (error) {
      console.error('❌ useUltraLogout: Erro no logout de emergência:', error);
      return false;
    }
  }, []);

  return {
    logout,                    // Logout com confirmação
    logoutWithoutConfirmation, // Logout sem confirmação
    emergencyLogout           // Logout de emergência
  };
} 