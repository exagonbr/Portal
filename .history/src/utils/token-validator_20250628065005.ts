/**
 * Utilitário para validação de tokens de autenticação
 */

export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  needsRefresh: boolean;
  error?: string;
  payload?: any;
}

/**
 * Valida se um token JWT está bem formado e não expirado
 */
export function validateToken(token: string): TokenValidationResult {
  if (!token || token.trim() === '') {
    return {
      isValid: false,
      isExpired: false,
      needsRefresh: true,
      error: 'Token não fornecido'
    };
  }

  // Verificar se é um JWT válido (3 partes separadas por ponto)
  const jwtParts = token.split('.');
  if (jwtParts.length !== 3) {
    return {
      isValid: false,
      isExpired: false,
      needsRefresh: true,
      error: 'Token não está no formato JWT válido'
    };
  }

  try {
    // Decodificar o payload para verificar expiração
    const payload = JSON.parse(atob(jwtParts[1]));
    
    // Verificar se tem os campos necessários
    if (!payload.userId) {
      return {
        isValid: false,
        isExpired: false,
        needsRefresh: true,
        error: 'Token não contém userId válido',
        payload
      };
    }

    // Verificar expiração
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp && payload.exp < now;
    
    // Verificar se precisa refresh (expira em menos de 5 minutos)
    const needsRefresh = payload.exp && (payload.exp - now) < 300;

    return {
      isValid: !isExpired,
      isExpired,
      needsRefresh,
      payload
    };
  } catch (error) {
    return {
      isValid: false,
      isExpired: false,
      needsRefresh: true,
      error: 'Erro ao decodificar payload do token: ' + (error instanceof Error ? error.message : String(error))
    };
  }
}

/**
 * Obtém o token mais recente de todas as fontes possíveis
 */
export function getCurrentToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Prioridade: localStorage > sessionStorage > cookies
  const possibleKeys = ['auth_token', 'token', 'authToken'];
  
  // Tentar localStorage primeiro
  for (const key of possibleKeys) {
    const token = localStorage.getItem(key);
    if (token && token.trim() !== '') {
      return token.trim();
    }
  }
  
  // Tentar sessionStorage
  for (const key of possibleKeys) {
    const token = sessionStorage.getItem(key);
    if (token && token.trim() !== '') {
      return token.trim();
    }
  }
  
  // Tentar cookies como último recurso
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (possibleKeys.includes(name) && value && value.trim() !== '') {
      return decodeURIComponent(value.trim());
    }
  }
  
  return null;
}

/**
 * Verifica se o usuário está autenticado e o token é válido
 */
export function isAuthenticated(): { 
  authenticated: boolean; 
  tokenValid: boolean; 
  needsRefresh: boolean;
  error?: string;
} {
  const token = getCurrentToken();
  
  if (!token) {
    return {
      authenticated: false,
      tokenValid: false,
      needsRefresh: true,
      error: 'Nenhum token encontrado'
    };
  }

  const validation = validateToken(token);
  
  return {
    authenticated: validation.isValid,
    tokenValid: validation.isValid,
    needsRefresh: validation.needsRefresh,
    error: validation.error
  };
}

/**
 * Limpa todos os tokens de autenticação
 */
export function clearAllTokens(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Limpar localStorage
  const keys = ['auth_token', 'token', 'authToken', 'user', 'user_session', 'userSession'];
  keys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  // Limpar cookies
  const cookiesToClear = ['auth_token', 'token', 'authToken', 'user_data', 'session_token', 'refresh_token'];
  cookiesToClear.forEach(cookieName => {
    document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${cookieName}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });
}

/**
 * Sincroniza o token com o apiClient
 */
export async function syncTokenWithApiClient(token?: string): Promise<boolean> {
  try {
    const tokenToSync = token || getCurrentToken();
    
    if (!tokenToSync) {
      console.warn('🔍 [TOKEN-VALIDATOR] Nenhum token para sincronizar');
      return false;
    }

    // Validar token antes de sincronizar
    const validation = validateToken(tokenToSync);
    if (!validation.isValid) {
      console.error('🔍 [TOKEN-VALIDATOR] Token inválido, não sincronizando:', validation.error);
      return false;
    }

    try {
      // Import direto do apiClient para evitar problemas de chunk loading
      const { apiClient } = await import('../lib/api-client');
      
      if (apiClient && typeof apiClient.setAuthToken === 'function') {
        apiClient.setAuthToken(tokenToSync);
        console.log('✅ [TOKEN-VALIDATOR] Token sincronizado com apiClient');
        return true;
      } else {
        console.warn('⚠️ [TOKEN-VALIDATOR] ApiClient não disponível, usando fallback');
        // Fallback: armazenar token diretamente
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', tokenToSync);
        }
        return true;
      }
    } catch (importError) {
      console.error('❌ [TOKEN-VALIDATOR] Erro ao importar apiClient:', importError);
      
      // Fallback: armazenar token diretamente sem apiClient
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', tokenToSync);
        console.log('✅ [TOKEN-VALIDATOR] Token armazenado via fallback');
        return true;
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ [TOKEN-VALIDATOR] Erro geral ao sincronizar token:', error);
    
    // Último fallback: tentar armazenar token diretamente
    try {
      const tokenToSync = token || getCurrentToken();
      if (tokenToSync && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', tokenToSync);
        console.log('✅ [TOKEN-VALIDATOR] Token salvo via fallback final');
        return true;
      }
    } catch (fallbackError) {
      console.error('❌ [TOKEN-VALIDATOR] Falha no fallback final:', fallbackError);
    }
    
    return false;
  }
} 