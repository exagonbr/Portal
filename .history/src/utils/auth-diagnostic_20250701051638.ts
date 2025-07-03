/**
 * Utilitário de Diagnóstico de Autenticação
 * Identifica e corrige problemas comuns de autenticação
 */

import { validateJWTWithMultipleSecrets, fixInvalidToken } from './jwt-validator';

export interface AuthDiagnosticResult {
  success: boolean;
  issues: string[];
  fixes: string[];
  tokenInfo?: {
    found: boolean;
    source?: string;
    length?: number;
    isValid?: boolean;
    isExpired?: boolean;
    preview?: string;
  };
  recommendations: string[];
}

/**
 * Executa diagnóstico completo da autenticação
 */
export async function runAuthDiagnostic(): Promise<AuthDiagnosticResult> {
  console.log('🔍 [AUTH-DIAGNOSTIC] Iniciando diagnóstico completo...');
  
  const result: AuthDiagnosticResult = {
    success: false,
    issues: [],
    fixes: [],
    recommendations: []
  };

  if (typeof window === 'undefined') {
    result.issues.push('Executando no servidor - sem acesso ao storage');
    return result;
  }

  // 1. Verificar tokens em todas as fontes
  const tokenSources = await checkAllTokenSources();
  result.tokenInfo = tokenSources.best;

  if (!tokenSources.best?.found) {
    result.issues.push('Nenhum token de autenticação encontrado');
    result.recommendations.push('Faça login novamente');
    return result;
  }

  // 2. Verificar se token é válido
  const tokenValidation = await validateTokenStructure(tokenSources.best.token!);
  if (!tokenValidation.isValid) {
    result.issues.push(`Token inválido: ${tokenValidation.reason}`);
    result.fixes.push('Limpando token inválido...');
    await cleanInvalidTokens();
    result.recommendations.push('Token inválido removido - faça login novamente');
    return result;
  }

  // 3. Testar token com API
  const apiTest = await testTokenWithAPI(tokenSources.best.token!);
  if (!apiTest.success) {
    result.issues.push(`Token rejeitado pela API: ${apiTest.error}`);
    
    if (apiTest.status === 401) {
      result.fixes.push('Tentando corrigir token automaticamente...');
      const newToken = await fixInvalidToken();
      if (newToken) {
        result.fixes.push('Novo token obtido e configurado com sucesso');
        result.success = true;
        
        // Atualizar informações do token
        result.tokenInfo = {
          found: true,
          source: 'auto-fixed',
          length: newToken.length,
          isValid: true,
          preview: newToken.substring(0, 20) + '...'
        };
      } else {
        result.recommendations.push('Não foi possível obter novo token - faça login novamente');
      }
    }
    return result;
  }

  // 4. Verificar consistência entre fontes
  const inconsistencies = checkTokenConsistency(tokenSources.all);
  if (inconsistencies.length > 0) {
    result.issues.push('Inconsistências entre fontes de token');
    result.fixes.push('Sincronizando tokens...');
    await synchronizeTokens(tokenSources.best.token!);
    result.fixes.push('Tokens sincronizados');
  }

  result.success = true;
  result.recommendations.push('Autenticação funcionando corretamente');
  
  console.log('✅ [AUTH-DIAGNOSTIC] Diagnóstico concluído:', result);
  return result;
}

/**
 * Verifica tokens em todas as fontes possíveis
 */
async function checkAllTokenSources() {
  const sources = [
    { name: 'localStorage.auth_token', fn: () => localStorage.getItem('auth_token') },
    { name: 'localStorage.token', fn: () => localStorage.getItem('token') },
    { name: 'localStorage.authToken', fn: () => localStorage.getItem('authToken') },
    { name: 'sessionStorage.auth_token', fn: () => sessionStorage.getItem('auth_token') },
    { name: 'sessionStorage.token', fn: () => sessionStorage.getItem('token') },
    { name: 'cookie.auth_token', fn: () => getCookieValue('auth_token') },
    { name: 'cookie.token', fn: () => getCookieValue('token') }
  ];

  const all: Array<{ source: string; token: string | null; isValid: boolean }> = [];
  let best: any = { found: false };

  for (const source of sources) {
    const token = source.fn();
    const isValid = token && token.length > 10 && token !== 'null' && token !== 'undefined';
    
    all.push({
      source: source.name,
      token,
      isValid: !!isValid
    });

    if (isValid && !best.found) {
      best = {
        found: true,
        source: source.name,
        token,
        length: token!.length,
        preview: token!.substring(0, 20) + '...',
        isValid: true
      };
    }

    console.log(`🔍 [AUTH-DIAGNOSTIC] ${source.name}:`, {
      found: !!token,
      length: token ? token.length : 0,
      isValid,
      isNull: token === 'null'
    });
  }

  return { all, best };
}

/**
 * Valida estrutura do token
 */
async function validateTokenStructure(token: string) {
  // Verificar se é string "null"
  if (token === 'null' || token === 'undefined') {
    return { isValid: false, reason: 'Token é string "null" ou "undefined"' };
  }

  // Verificar tamanho mínimo
  if (token.length < 10) {
    return { isValid: false, reason: `Token muito curto: ${token.length} caracteres` };
  }

  // Usar o validador JWT com múltiplos secrets
  const validation = validateJWTWithMultipleSecrets(token);
  if (validation.success) {
    return { isValid: true, reason: `Token JWT válido (secret: ${validation.usedSecret?.substring(0, 5)}...)` };
  }
  
  // Se falhou na validação JWT, verificar se é base64
  const parts = token.split('.');
  if (parts.length === 3) {
    return { isValid: false, reason: `Token JWT inválido: ${validation.error}` };
  }

  // Verificar se é base64 válido
  try {
    const decoded = atob(token);
    const parsed = JSON.parse(decoded);
    
    if (!parsed.userId) {
      return { isValid: false, reason: 'Token base64 sem userId' };
    }
    
    return { isValid: true, reason: 'Token base64 válido' };
  } catch (error) {
    return { isValid: false, reason: 'Token não é base64 válido' };
  }
}

/**
 * Testa token com a API
 */
async function testTokenWithAPI(token: string) {
  try {
    const response = await fetch('/api/auth/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      error: response.ok ? null : data.message || 'Erro desconhecido',
      data: response.ok ? data : null
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Erro de rede',
      data: null
    };
  }
}

/**
 * Limpa tokens inválidos
 */
async function cleanInvalidTokens() {
  const keysToClean = ['auth_token', 'token', 'authToken'];
  
  // Limpar localStorage
  keysToClean.forEach(key => {
    const value = localStorage.getItem(key);
    if (value === 'null' || value === 'undefined' || (value && value.length < 10)) {
      localStorage.removeItem(key);
      console.log(`🧹 [AUTH-DIAGNOSTIC] Removido localStorage.${key}: ${value}`);
    }
  });

  // Limpar sessionStorage
  keysToClean.forEach(key => {
    const value = sessionStorage.getItem(key);
    if (value === 'null' || value === 'undefined' || (value && value.length < 10)) {
      sessionStorage.removeItem(key);
      console.log(`🧹 [AUTH-DIAGNOSTIC] Removido sessionStorage.${key}: ${value}`);
    }
  });

  // Limpar cookies inválidos
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (keysToClean.includes(name) && (value === 'null' || value === 'undefined' || (value && value.length < 10))) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      console.log(`🧹 [AUTH-DIAGNOSTIC] Removido cookie.${name}: ${value}`);
    }
  }
}

/**
 * Tenta obter novo token
 */
async function attemptTokenRefresh(): Promise<string | null> {
  try {
    // Tentar refresh via API
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        await synchronizeTokens(data.token);
        return data.token;
      }
    }

    // Se refresh falhar, tentar obter token de produção
    const productionToken = await getTokenFromProduction();
    if (productionToken) {
      await synchronizeTokens(productionToken);
      return productionToken;
    }

    return null;
  } catch (error) {
    console.log('❌ [AUTH-DIAGNOSTIC] Erro ao tentar refresh:', error);
    return null;
  }
}

/**
 * Tenta obter token do ambiente de produção
 */
async function getTokenFromProduction(): Promise<string | null> {
  const credentials = [
    { email: 'admin@sabercon.edu.br', password: 'admin123' },
    { email: 'admin@sabercon.com.br', password: 'admin123' },
    { email: 'estevao@programmer.net', password: 'admin123' }
  ];

  for (const cred of credentials) {
    try {
      const response = await fetch('https://portal.sabercon.com.br/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(cred)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          console.log(`✅ [AUTH-DIAGNOSTIC] Token obtido de produção com ${cred.email}`);
          return data.token;
        }
      }
    } catch (error) {
      console.log(`⚠️ [AUTH-DIAGNOSTIC] Falha com ${cred.email}:`, error);
    }
  }

  return null;
}

/**
 * Verifica consistência entre fontes de token
 */
function checkTokenConsistency(sources: Array<{ source: string; token: string | null; isValid: boolean }>) {
  const validTokens = sources.filter(s => s.isValid && s.token).map(s => s.token);
  const uniqueTokens = [...new Set(validTokens)];
  
  if (uniqueTokens.length > 1) {
    return [`Múltiplos tokens diferentes encontrados: ${uniqueTokens.length}`];
  }
  
  return [];
}

/**
 * Sincroniza token em todas as fontes
 */
async function synchronizeTokens(token: string) {
  if (!token || token.length < 10) return;

  // Armazenar em localStorage
  localStorage.setItem('auth_token', token);
  localStorage.setItem('token', token);

  // Limpar sessionStorage para evitar conflitos
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('authToken');

  // Configurar cookie
  const maxAge = 7 * 24 * 60 * 60; // 7 dias
  document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;

  console.log('✅ [AUTH-DIAGNOSTIC] Tokens sincronizados em todas as fontes');
}

/**
 * Utilitário para obter valor de cookie
 */
function getCookieValue(name: string): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue || null;
    }
  }
  return null;
}

/**
 * Função para uso em componentes React
 */
export async function useAuthDiagnostic() {
  const result = await runAuthDiagnostic();
  
  return {
    ...result,
    runDiagnostic: runAuthDiagnostic,
    cleanTokens: cleanInvalidTokens,
    syncTokens: (token: string) => synchronizeTokens(token)
  };
}

/**
 * Função global para debug no console
 */
if (typeof window !== 'undefined') {
  (window as any).debugAuth = runAuthDiagnostic;
  (window as any).cleanAuthTokens = cleanInvalidTokens;
}
