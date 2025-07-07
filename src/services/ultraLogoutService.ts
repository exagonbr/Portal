/**
 * Serviço para realizar logout ultra-completo
 * Limpa todos os dados de autenticação
 */

import { CookieManager } from '@/utils/cookieManager';

/**
 * Realiza um logout completo, limpando todos os dados
 */
export async function performUltraLogout(): Promise<void> {
  // 1. Limpar localStorage e sessionStorage
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
  }

  // 2. Limpar cookies
  CookieManager.clearAuthCookies();

  // 3. Chamar API de logout
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Erro ao chamar API de logout:', error);
  }

  // 4. Redirecionar para login
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login?logout=true';
  }
} 