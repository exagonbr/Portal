/**
 * Utilitário para diagnosticar e corrigir problemas de autenticação
 */

export interface AuthDiagnosticResult {
  hasToken: boolean;
  tokenSource?: string;
  tokenValid?: boolean;
  tokenExpired?: boolean;
  apiConnectivity?: boolean;
  recommendations: string[];
}

/**
 * Diagnostica problemas de autenticação
 */
export async function diagnoseAuthProblem(): Promise<AuthDiagnosticResult> {
  const result: AuthDiagnosticResult = {
    hasToken: false,
    recommendations: []
  };

  console.log('🔍 Iniciando diagnóstico de autenticação...');

  // 1. Verificar se há token armazenado
  const token = getStoredAuthToken();
  if (!token) {
    result.recommendations.push('Nenhum token encontrado - faça login novamente');
    return result;
  }

  result.hasToken = true;
  result.tokenSource = getTokenSource();

  // 2. Verificar se o token está expirado
  const tokenInfo = parseJWTToken(token);
  if (tokenInfo && tokenInfo.exp) {
    const isExpired = tokenInfo.exp * 1000 < Date.now();
    result.tokenExpired = isExpired;
    
    if (isExpired) {
      result.recommendations.push('Token expirado - faça login novamente');
      return result;
    }
  }

  // 3. Testar conectividade com a API
  try {
    const apiTest = await testApiConnection(token);
    result.apiConnectivity = apiTest.success;
    result.tokenValid = apiTest.success;

    if (!apiTest.success) {
      result.recommendations.push(`Falha na API: ${apiTest.error}`);
      if (apiTest.status === 401) {
        result.recommendations.push('Token inválido ou mal formatado');
      }
    } else {
      result.recommendations.push('Autenticação funcionando corretamente');
    }
  } catch (error) {
    result.apiConnectivity = false;
    result.recommendations.push(`Erro de conectividade: ${error}`);
  }

  return result;
}

/**
 * Obtém token armazenado de forma robusta
 */
function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  const sources = [
    'accessToken',
    'auth_token',
    'token',
    'authToken'
  ];

  // Verificar localStorage
  for (const source of sources) {
    const token = localStorage.getItem(source);
    if (token && token.length > 10) {
      return token;
    }
  }

  // Verificar sessionStorage
  for (const source of sources) {
    const token = sessionStorage.getItem(source);
    if (token && token.length > 10) {
      return token;
    }
  }

  return null;
}

/**
 * Identifica a fonte do token
 */
function getTokenSource(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  const sources = ['accessToken', 'auth_token', 'token', 'authToken'];

  for (const source of sources) {
    if (localStorage.getItem(source)) {
      return `localStorage.${source}`;
    }
  }

  for (const source of sources) {
    if (sessionStorage.getItem(source)) {
      return `sessionStorage.${source}`;
    }
  }

  return undefined;
}

/**
 * Parse JWT token para extrair informações
 */
function parseJWTToken(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Testa conectividade com a API
 */
async function testApiConnection(token: string): Promise<{
  success: boolean;
  status?: number;
  error?: string;
}> {
  try {
    const response = await fetch('/api/tv-shows?page=1&limit=1', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: response.ok,
      status: response.status,
      error: response.ok ? undefined : `${response.status} ${response.statusText}`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Corrige problemas comuns de autenticação
 */
export function fixAuthProblems(): void {
  console.log('🔧 Aplicando correções de autenticação...');

  // 1. Limpar tokens inválidos
  const token = getStoredAuthToken();
  if (token) {
    const tokenInfo = parseJWTToken(token);
    if (!tokenInfo || (tokenInfo.exp && tokenInfo.exp * 1000 < Date.now())) {
      console.log('❌ Removendo token expirado...');
      clearAllTokens();
      return;
    }
  }

  // 2. Normalizar armazenamento de token
  if (token) {
    console.log('✅ Normalizando armazenamento de token...');
    localStorage.setItem('accessToken', token);
    localStorage.setItem('auth_token', token);
  }

  console.log('✅ Correções aplicadas');
}

/**
 * Limpa todos os tokens armazenados
 */
export function clearAllTokens(): void {
  if (typeof window === 'undefined') return;

  const keys = ['accessToken', 'auth_token', 'token', 'authToken', 'refreshToken'];
  
  keys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  // Limpar cookies
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  
  console.log('🧹 Todos os tokens foram removidos');
}

/**
 * Força uma nova requisição com retry
 */
export async function retryWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredAuthToken();
  
  if (!token) {
    throw new Error('Token não encontrado');
  }

  const authOptions: RequestInit = {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  console.log('🔄 Fazendo requisição autenticada para:', url);
  
  const response = await fetch(url, authOptions);
  
  if (!response.ok) {
    console.error('❌ Requisição falhou:', response.status, response.statusText);
    
    if (response.status === 401) {
      console.log('🔄 Token inválido, limpando dados...');
      clearAllTokens();
      throw new Error('Token inválido - faça login novamente');
    }
  }

  return response;
}

/**
 * Hook para usar no console do navegador
 */
export function runAuthDiagnostic(): void {
  if (typeof window !== 'undefined') {
    console.log('🚀 Executando diagnóstico de autenticação...');
    
    diagnoseAuthProblem().then(result => {
      console.group('📋 Resultado do Diagnóstico');
      console.log('Token encontrado:', result.hasToken);
      console.log('Fonte do token:', result.tokenSource);
      console.log('Token válido:', result.tokenValid);
      console.log('Token expirado:', result.tokenExpired);
      console.log('API conectando:', result.apiConnectivity);
      console.log('Recomendações:', result.recommendations);
      console.groupEnd();
      
      if (result.hasToken && result.tokenExpired) {
        console.log('🔧 Aplicando correção automática...');
        fixAuthProblems();
      }
    });
  }
}

// Expor para uso global no console
if (typeof window !== 'undefined') {
  (window as any).runAuthDiagnostic = runAuthDiagnostic;
  (window as any).fixAuthProblems = fixAuthProblems;
  (window as any).clearAllTokens = clearAllTokens;
} 