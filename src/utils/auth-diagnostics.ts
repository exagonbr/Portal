/**
 * Utilitário de diagnóstico de autenticação
 * Fornece ferramentas para debugar problemas de autenticação
 */

import { getCurrentToken, validateToken, isAuthenticated } from './token-validator';

export interface AuthDiagnosticResult {
  timestamp: string;
  browser: string;
  url: string;
  token: {
    found: boolean;
    source?: string;
    length?: number;
    preview?: string;
    isJWT?: boolean;
    isValid?: boolean;
    isExpired?: boolean;
    payload?: any;
    error?: string;
  };
  storage: {
    localStorage: Record<string, any>;
    sessionStorage: Record<string, any>;
    cookies: Record<string, string>;
  };
  apiClient: {
    baseURL?: string;
    hasToken?: boolean;
  };
  recommendations: string[];
}

/**
 * Executa diagnóstico completo de autenticação
 */
export function runAuthDiagnostics(): AuthDiagnosticResult {
  const result: AuthDiagnosticResult = {
    timestamp: new Date().toISOString(),
    browser: typeof window !== 'undefined' ? navigator.userAgent : 'Server-side',
    url: typeof window !== 'undefined' ? window.location.href : 'N/A',
    token: {
      found: false
    },
    storage: {
      localStorage: {},
      sessionStorage: {},
      cookies: {}
    },
    apiClient: {},
    recommendations: []
  };

  if (typeof window === 'undefined') {
    result.recommendations.push('Diagnóstico executado no servidor - funcionalidade limitada');
    return result;
  }

  // 1. Verificar token atual
  const currentToken = getCurrentToken();
  if (currentToken) {
    result.token.found = true;
    result.token.length = currentToken.length;
    result.token.preview = currentToken.substring(0, 20) + '...';
    result.token.isJWT = currentToken.split('.').length === 3;

    // Validar token
    const validation = validateToken(currentToken);
    result.token.isValid = validation.isValid;
    result.token.isExpired = validation.isExpired;
    result.token.payload = validation.payload;
    result.token.error = validation.error;

    // Determinar fonte do token
    const possibleKeys = ['auth_token', 'token', 'authToken'];
    for (const key of possibleKeys) {
      const storedToken = localStorage.getItem(key);
      if (storedToken === currentToken) {
        result.token.source = `localStorage.${key}`;
        break;
      }
    }
    if (!result.token.source) {
      for (const key of possibleKeys) {
        const storedToken = sessionStorage.getItem(key);
        if (storedToken === currentToken) {
          result.token.source = `sessionStorage.${key}`;
          break;
        }
      }
    }
    if (!result.token.source) {
      result.token.source = 'cookies';
    }
  } else {
    result.recommendations.push('Nenhum token encontrado - faça login novamente');
  }

  // 2. Verificar localStorage
  const localStorageKeys = ['auth_token', 'token', 'authToken', 'user', 'userData', 'user_session'];
  localStorageKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      result.storage.localStorage[key] = {
        length: value.length,
        preview: value.substring(0, 50) + (value.length > 50 ? '...' : ''),
        isNull: value === 'null',
        isUndefined: value === 'undefined'
      };
    }
  });

  // 3. Verificar sessionStorage
  localStorageKeys.forEach(key => {
    const value = sessionStorage.getItem(key);
    if (value) {
      result.storage.sessionStorage[key] = {
        length: value.length,
        preview: value.substring(0, 50) + (value.length > 50 ? '...' : ''),
        isNull: value === 'null',
        isUndefined: value === 'undefined'
      };
    }
  });

  // 4. Verificar cookies
  const cookies = document.cookie.split(';');
  cookies.forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      result.storage.cookies[name] = decodeURIComponent(value);
    }
  });

  // 5. Verificar status de autenticação
  const authStatus = isAuthenticated();
  if (!authStatus.authenticated) {
    result.recommendations.push(`Autenticação inválida: ${authStatus.error}`);
  }

  // 6. Verificar apiClient
  try {
    // Tentar importar apiClient dinamicamente
    import('../lib/api-client').then(({ apiClient }) => {
      result.apiClient.baseURL = (apiClient as any).baseURL;
      result.apiClient.hasToken = !!(apiClient as any).getAuthToken?.();
    }).catch(() => {
      result.recommendations.push('Não foi possível verificar apiClient');
    });
  } catch (error) {
    result.recommendations.push('Erro ao verificar apiClient');
  }

  // 7. Gerar recomendações
  if (result.token.found && result.token.isExpired) {
    result.recommendations.push('Token expirado - faça login novamente');
  }

  if (result.token.found && !result.token.isValid) {
    result.recommendations.push('Token inválido - limpe o cache e faça login novamente');
  }

  if (!result.token.found && Object.keys(result.storage.localStorage).length === 0) {
    result.recommendations.push('Nenhum dado de autenticação encontrado - faça login');
  }

  if (result.token.found && result.token.length < 50) {
    result.recommendations.push('Token muito curto - pode estar corrompido');
  }

  return result;
}

/**
 * Limpa todos os dados de autenticação
 */
export function clearAllAuthData(): void {
  if (typeof window === 'undefined') return;

  console.log('🧹 [AUTH-DIAGNOSTICS] Limpando todos os dados de autenticação...');

  // Limpar localStorage
  const keys = ['auth_token', 'token', 'authToken', 'user', 'userData', 'user_session', 'userSession'];
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

  console.log('✅ [AUTH-DIAGNOSTICS] Dados de autenticação limpos');
}

/**
 * Testa conectividade com APIs críticas
 */
export async function testApiConnectivity(): Promise<{
  healthCheck: boolean;
  userStats: boolean;
  institutions: boolean;
  errors: string[];
}> {
  const result = {
    healthCheck: false,
    userStats: false,
    institutions: false,
    errors: [] as string[]
  };

  // Teste 1: Health check
  try {
    const response = await fetch('/api/health-check', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    result.healthCheck = response.ok;
    if (!response.ok) {
      result.errors.push(`Health check failed: ${response.status}`);
    }
  } catch (error) {
    result.errors.push(`Health check error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }

  // Teste 2: User stats (com autenticação)
  try {
    const token = getCurrentToken();
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/users/stats', {
      method: 'GET',
      headers
    });
    result.userStats = response.ok;
    if (!response.ok) {
      const text = await response.text();
      result.errors.push(`User stats failed: ${response.status} - ${text.substring(0, 100)}`);
    }
  } catch (error) {
    result.errors.push(`User stats error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }

  // Teste 3: Institutions (com autenticação)
  try {
    const token = getCurrentToken();
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/institutions', {
      method: 'GET',
      headers
    });
    result.institutions = response.ok;
    if (!response.ok) {
      const text = await response.text();
      result.errors.push(`Institutions failed: ${response.status} - ${text.substring(0, 100)}`);
    }
  } catch (error) {
    result.errors.push(`Institutions error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }

  return result;
}

/**
 * Função para executar no console do navegador
 */
export function debugAuth(): void {
  console.group('🔍 DIAGNÓSTICO DE AUTENTICAÇÃO');
  
  const diagnostics = runAuthDiagnostics();
  console.log('📋 Diagnóstico completo:', diagnostics);
  
  console.log('🎫 Token:', {
    encontrado: diagnostics.token.found,
    válido: diagnostics.token.isValid,
    expirado: diagnostics.token.isExpired,
    fonte: diagnostics.token.source,
    comprimento: diagnostics.token.length,
    erro: diagnostics.token.error
  });
  
  console.log('💾 Storage:', diagnostics.storage);
  
  if (diagnostics.recommendations.length > 0) {
    console.log('💡 Recomendações:', diagnostics.recommendations);
  }
  
  // Testar conectividade
  testApiConnectivity().then(connectivity => {
    console.log('🌐 Conectividade:', connectivity);
    console.groupEnd();
  });
}

// Expor função globalmente para uso no console
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
  (window as any).clearAllAuth = clearAllAuthData;
  (window as any).testApiConnectivity = testApiConnectivity;
}
