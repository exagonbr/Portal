/**
 * Utilitário para renovação automática de tokens de autenticação
 */

import { validateToken } from './token-validator';

export interface TokenRefreshResult {
  success: boolean;
  newToken?: string;
  error?: string;
}

export interface RefreshTokenOptions {
  refreshToken?: string;
  apiEndpoint?: string;
  onSuccess?: (newToken: string) => void;
  onError?: (error: string) => void;
}

/**
 * Tenta renovar o token de autenticação usando o refresh token
 */
export async function refreshAuthToken(options: RefreshTokenOptions = {}): Promise<TokenRefreshResult> {
  try {
    // Obter refresh token
    const refreshToken = options.refreshToken || getStoredRefreshToken();
    
    if (!refreshToken) {
      return {
        success: false,
        error: 'Refresh token não encontrado'
      };
    }

    // Endpoint padrão para renovação
    const endpoint = options.apiEndpoint || '/api/auth/refresh';

    // Fazer requisição para renovar token
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: refreshToken
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Falha ao renovar token: ${response.status} ${errorText}`
      };
    }

    const data = await response.json();
    
    if (!data.success || !data.data?.accessToken) {
      return {
        success: false,
        error: data.message || 'Resposta inválida do servidor'
      };
    }

    const newToken = data.data.accessToken;
    
    // Salvar novo token
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', newToken);
      
      // Salvar novo refresh token se fornecido
      if (data.data.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }
    }

    // Chamar callback de sucesso
    if (options.onSuccess) {
      options.onSuccess(newToken);
    }

    return {
      success: true,
      newToken: newToken
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    // Chamar callback de erro
    if (options.onError) {
      options.onError(errorMessage);
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Obtém o refresh token armazenado
 */
function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('refreshToken') || 
         sessionStorage.getItem('refreshToken');
}

/**
 * Verifica se o token precisa ser renovado e faz a renovação automaticamente
 */
export async function autoRefreshToken(options: RefreshTokenOptions = {}): Promise<boolean> {
  try {
    const validation = validateToken(getCurrentToken() || '');
    
    // Se o token é válido e não está próximo do vencimento, não precisa renovar
    if (validation.isValid && validation.payload?.exp) {
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = validation.payload.exp - now;
      
      // Renovar se faltam menos de 5 minutos para expirar
      if (timeUntilExpiry > 300) {
        return true; // Token ainda válido
      }
    }

    // Token expirado ou próximo do vencimento, tentar renovar
    const result = await refreshAuthToken(options);
    return result.success;

  } catch (error) {
    console.error('Erro na renovação automática do token:', error);
    return false;
  }
}

/**
 * Obtém o token atual do localStorage
 */
function getCurrentToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Configura renovação automática periódica do token
 */
export function setupAutoTokenRefresh(options: RefreshTokenOptions & { intervalMinutes?: number } = {}): () => void {
  if (typeof window === 'undefined') {
    return () => {}; // Retorna função vazia no servidor
  }

  const intervalMinutes = options.intervalMinutes || 4; // Verificar a cada 4 minutos
  const intervalMs = intervalMinutes * 60 * 1000;

  const intervalId = setInterval(async () => {
    try {
      await autoRefreshToken(options);
    } catch (error) {
      console.error('Erro na renovação automática periódica:', error);
    }
  }, intervalMs);

  // Retorna função para limpar o intervalo
  return () => {
    clearInterval(intervalId);
  };
}

/**
 * Intercepta requisições fetch para adicionar renovação automática
 */
export function createTokenRefreshInterceptor(options: RefreshTokenOptions = {}) {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Tentar renovar token antes da requisição se necessário
    await autoRefreshToken(options);

    // Fazer requisição original
    const response = await originalFetch(input, init);

    // Se receber 401, tentar renovar token e repetir requisição
    if (response.status === 401) {
      const refreshResult = await refreshAuthToken(options);
      
      if (refreshResult.success && refreshResult.newToken) {
        // Atualizar header Authorization se presente
        const newInit = { ...init };
        if (newInit.headers) {
          const headers = new Headers(newInit.headers);
          headers.set('Authorization', `Bearer ${refreshResult.newToken}`);
          newInit.headers = headers;
        }

        // Repetir requisição com novo token
        return originalFetch(input, newInit);
      }
    }

    return response;
  };

  // Retorna função para restaurar fetch original
  return () => {
    window.fetch = originalFetch;
  };
}

/**
 * Limpa todos os dados de token
 */
export function clearTokenData(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
}