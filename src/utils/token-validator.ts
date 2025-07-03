/**
 * Utilitário para validação de tokens de autenticação
 */

export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  payload?: any;
  error?: string;
}

/**
 * Valida um token JWT
 */
export function validateToken(token: string): TokenValidationResult {
  if (!token) {
    return {
      isValid: false,
      isExpired: false,
      error: 'Token não fornecido'
    };
  }

  try {
    // Decodificar o token JWT (sem verificar assinatura)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {
        isValid: false,
        isExpired: false,
        error: 'Formato de token inválido'
      };
    }

    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    // Verificar se o token expirou
    const isExpired = payload.exp && payload.exp < now;
    
    return {
      isValid: !isExpired,
      isExpired,
      payload,
      error: isExpired ? 'Token expirado' : undefined
    };
  } catch (error) {
    return {
      isValid: false,
      isExpired: false,
      error: 'Erro ao decodificar token'
    };
  }
}

/**
 * Obtém o token do localStorage e valida
 */
export function getAndValidateToken(): TokenValidationResult {
  if (typeof window === 'undefined') {
    return {
      isValid: false,
      isExpired: false,
      error: 'Ambiente servidor - localStorage não disponível'
    };
  }

  const token = localStorage.getItem('accessToken');
  if (!token) {
    return {
      isValid: false,
      isExpired: false,
      error: 'Token não encontrado no localStorage'
    };
  }

  return validateToken(token);
}

/**
 * Verifica se o usuário está autenticado com token válido
 */
export function isAuthenticated(): { authenticated: boolean; needsRefresh: boolean; error?: string } {
  const result = getAndValidateToken();
  
  if (!result.isValid) {
    return {
      authenticated: false,
      needsRefresh: result.isExpired,
      error: result.error || 'Token inválido'
    };
  }
  
  // Verificar se o token está próximo de expirar (menos de 5 minutos)
  if (result.payload?.exp) {
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = result.payload.exp - now;
    
    if (timeUntilExpiry < 300) { // Menos de 5 minutos
      return {
        authenticated: true,
        needsRefresh: true,
        error: undefined
      };
    }
  }
  
  return {
    authenticated: true,
    needsRefresh: false,
    error: undefined
  };
}

/**
 * Obtém o token atual do localStorage
 */
export function getCurrentToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Tentar múltiplas chaves possíveis
  return localStorage.getItem('accessToken') ||
         localStorage.getItem('auth_token') ||
         localStorage.getItem('token') ||
         localStorage.getItem('authToken');
}

/**
 * Sincroniza o token com o apiClient
 */
export async function syncTokenWithApiClient(token?: string): Promise<boolean> {
  try {
    const tokenToSync = token || getCurrentToken();
    
    if (!tokenToSync) {
      console.warn('⚠️ [SYNC-TOKEN] Nenhum token para sincronizar');
      return false;
    }
    
    // Importar apiClient dinamicamente para evitar dependências circulares
    const { apiClient } = await import('../lib/api-client');
    
    if (apiClient && typeof apiClient.setAuthToken === 'function') {
      apiClient.setAuthToken(tokenToSync);
      console.log('✅ [SYNC-TOKEN] Token sincronizado com apiClient');
      return true;
    } else {
      console.warn('⚠️ [SYNC-TOKEN] apiClient não disponível ou sem método setAuthToken');
      return false;
    }
  } catch (error) {
    console.error('❌ [SYNC-TOKEN] Erro ao sincronizar token:', error);
    return false;
  }
}

/**
 * Limpa todos os tokens de autenticação
 */
export function clearAllTokens(): void {
  if (typeof window === 'undefined') return;
  
  // Lista de possíveis chaves de token
  const tokenKeys = [
    'accessToken',
    'auth_token',
    'token',
    'authToken',
    'refreshToken',
    'refresh_token',
    'user',
    'userData'
  ];
  
  // Limpar localStorage
  tokenKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Limpar sessionStorage
  tokenKeys.forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  // Limpar cookies relacionados
  const authCookies = ['accessToken', 'refreshToken', 'session', 'auth', 'token'];
  authCookies.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
  });
  
  console.log('🧹 [CLEAR-TOKENS] Todos os tokens foram limpos');
}

/**
 * Executa diagnóstico de autenticação
 */
export function debugAuth(): void {
  console.group('🔍 Debug de Autenticação');
  
  const token = getCurrentToken();
  console.log('Token encontrado:', !!token);
  
  if (token) {
    const validation = validateToken(token);
    console.log('Token válido:', validation.isValid);
    console.log('Token expirado:', validation.isExpired);
    if (validation.payload) {
      console.log('Payload do token:', validation.payload);
    }
    if (validation.error) {
      console.log('Erro:', validation.error);
    }
  }
  
  console.groupEnd();
}