import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { clearAllDataForUnauthorized, clearAuthDataOnly } from '@/utils/clearAllData';
import { buildLoginUrl } from '@/utils/urlBuilder';

/**
 * Hook personalizado para redirecionamentos com limpeza de dados
 */
export const useRedirectWithClearData = () => {
  const router = useRouter();

  /**
   * Redireciona para login com limpeza completa de dados
   */
  const redirectToLoginWithClearData = useCallback(async (reason: string = 'unauthorized') => {
    try {
      console.log(`🔄 Redirecionando para login com limpeza de dados. Motivo: ${reason}`);
      await clearAllDataForUnauthorized();
      router.push(buildLoginUrl({ error: reason }));
    } catch (error) {
      console.log('❌ Erro durante limpeza de dados no redirecionamento:', error);
      // Redirecionar mesmo com erro na limpeza
      router.push(buildLoginUrl({ error: reason }));
    }
  }, [router]);

  /**
   * Redireciona para qualquer URL com limpeza de dados de autenticação
   */
  const redirectWithAuthClear = useCallback(async (url: string) => {
    try {
      console.log(`🔄 Redirecionando para ${url} com limpeza de dados de autenticação`);
      clearAuthDataOnly();
      router.push(url);
    } catch (error) {
      console.log('❌ Erro durante limpeza de dados de autenticação:', error);
      // Redirecionar mesmo com erro na limpeza
      router.push(url);
    }
  }, [router]);

  /**
   * Redireciona para qualquer URL com limpeza completa de dados
   */
  const redirectWithFullClear = useCallback(async (url: string) => {
    try {
      console.log(`🔄 Redirecionando para ${url} com limpeza completa de dados`);
      await clearAllDataForUnauthorized();
      router.push(url);
    } catch (error) {
      console.log('❌ Erro durante limpeza completa de dados:', error);
      // Redirecionar mesmo com erro na limpeza
      router.push(url);
    }
  }, [router]);

  return {
    redirectToLoginWithClearData,
    redirectWithAuthClear,
    redirectWithFullClear
  };
}; 