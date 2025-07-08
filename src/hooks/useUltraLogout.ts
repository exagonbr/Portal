/**
 * Hook para realizar logout ultra-completo
 * Limpa TUDO TUDO TUDO e volta para o login
 */

import { useCallback } from 'react';
import { UnifiedAuthService } from '@/services/unifiedAuthService';
import { CookieManager } from '@/utils/cookieManager';

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
      
      // Executar logout completo usando o UnifiedAuthService
      const success = await UnifiedAuthService.performCompleteLogout(true);
      
      if (!success) {
        // Se o UnifiedAuthService falhou, fazer limpeza manual e redirecionar
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
          window.location.href = '/auth/login?logout=fallback';
        }
      }
      
      return success;
    } catch (error) {
      console.log('❌ useUltraLogout: Erro durante logout:', error);
      
      // Fallback: limpeza manual e redirecionamento
      if (typeof window !== 'undefined') {
        try {
          localStorage.clear();
          sessionStorage.clear();
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
        } catch (cleanupError) {
          console.error('❌ Erro na limpeza de fallback:', cleanupError);
        }
        window.location.href = '/auth/login?logout=error';
      }
      
      return false;
    }
  }, []);

  const logoutWithoutConfirmation = useCallback(async () => {
    try {
      console.log('🚨 useUltraLogout: Logout sem confirmação...');
      const success = await UnifiedAuthService.performCompleteLogout(true);
      
      if (!success) {
        // Se o UnifiedAuthService falhou, fazer limpeza manual e redirecionar
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
          window.location.href = '/auth/login?logout=fallback';
        }
      }
      
      return success;
    } catch (error) {
      console.log('❌ useUltraLogout: Erro durante logout sem confirmação:', error);
      
      // Fallback: limpeza manual e redirecionamento
      if (typeof window !== 'undefined') {
        try {
          localStorage.clear();
          sessionStorage.clear();
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
        } catch (cleanupError) {
          console.error('❌ Erro na limpeza de fallback:', cleanupError);
        }
        window.location.href = '/auth/login?logout=error';
      }
      
      return false;
    }
  }, []);

  const emergencyLogout = useCallback(async () => {
    try {
      // Limpeza de emergência imediata
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        
        // Limpar cookies
        CookieManager.clearAuthCookies();
      }
      
      // Redirecionar imediatamente
      window.location.href = '/auth/login?logout=emergency';
      
      return true;
    } catch (error) {
      console.error('Erro no logout de emergência:', error);
      return false;
    }
  }, []);

  return {
    logout,                    // Logout com confirmação
    logoutWithoutConfirmation, // Logout sem confirmação
    emergencyLogout           // Logout de emergência
  };
} 