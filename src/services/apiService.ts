import { getAuthentication } from '@/lib/auth-utils';
import { PaginatedResponse } from '@/types/api';
import { UnifiedAuthService } from '@/services/unifiedAuthService';
import { AuthHeaderService } from './authHeaderService';

const API_BASE_URL = '';

// Configurações de timeout e retry
const API_CONFIG = {
  DEFAULT_TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
  RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504], // Códigos que devem ser retentados
};

/**
 * Cria um fetch com timeout configurável
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = API_CONFIG.DEFAULT_TIMEOUT
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Timeout após ${timeout}ms - Servidor demorou muito para responder`);
    }
    throw error;
  }
};

/**
 * Implementa retry automático para requisições
 */
const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  timeout: number = API_CONFIG.DEFAULT_TIMEOUT,
  maxRetries: number = API_CONFIG.RETRY_ATTEMPTS
): Promise<Response> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [API] Tentativa ${attempt}/${maxRetries} para ${url}`);
      
      const response = await fetchWithTimeout(url, options, timeout);
      
      // Se a resposta foi bem-sucedida, retornar
      if (response.ok) {
        if (attempt > 1) {
          console.log(`✅ [API] Sucesso na tentativa ${attempt} para ${url}`);
        }
        return response;
      }
      
      // Se é um erro que deve ser retentado e ainda há tentativas
      if (API_CONFIG.RETRY_STATUS_CODES.includes(response.status) && attempt < maxRetries) {
        console.warn(`⚠️ [API] Erro ${response.status} na tentativa ${attempt}, tentando novamente...`);
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt));
        continue;
      }
      
      // Se não deve ser retentado ou é a última tentativa, retornar a resposta
      return response;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Se é a última tentativa, re-throw o erro
      if (attempt >= maxRetries) {
        console.error(`❌ [API] Todas as ${maxRetries} tentativas falharam para ${url}:`, lastError);
        throw lastError;
      }
      
      // Se é erro de timeout ou conexão, tentar novamente
      if (lastError.message.includes('Timeout') || lastError.message.includes('fetch')) {
        console.warn(`⚠️ [API] ${lastError.message} na tentativa ${attempt}, tentando novamente em ${API_CONFIG.RETRY_DELAY * attempt}ms...`);
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt));
        continue;
      }
      
      // Para outros tipos de erro, não tentar novamente
      throw lastError;
    }
  }
  
  throw lastError || new Error('Falha desconhecida após todas as tentativas');
};

/**
 * Retorna uma mensagem de erro amigável baseada no status HTTP
 */
const getErrorMessage = (status: number, statusText?: string): string => {
  const messages: Record<number, string> = {
    400: 'Dados inválidos enviados para o servidor',
    403: 'Acesso negado - você não tem permissão para essa operação',
    404: 'Recurso não encontrado',
    408: 'Tempo limite esgotado - tente novamente',
    429: 'Muitas requisições - aguarde um pouco antes de tentar novamente',
    500: 'Erro interno do servidor',
    502: 'Servidor temporariamente indisponível',
    503: 'Serviço temporariamente indisponível',
    504: 'Servidor demorou muito para responder - tente novamente',
  };
  
  return messages[status] || `Erro na API: ${status} - ${statusText || 'Sem descrição'}`;
};

/**
 * Retorna os headers padrões para as requisições à API.
 * Inclui o token de autenticação se estiver disponível.
 */
const getHeaders = async (): Promise<Headers> => {
  return AuthHeaderService.getHeaders();
};

/**
 * Manipulador de resposta de fetch.
 * @param response A resposta do fetch.
 * @returns Uma promessa que resolve com os dados JSON.
 * @throws Um erro se a resposta não for 'ok'.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Tratamento especial para erro 401 (Não autorizado)
    if (response.status === 401) {
      console.error('❌ [API] Erro de autenticação: Token inválido ou expirado');
      
      // Verificar se estamos no navegador
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Redirecionar apenas se estamos no navegador e não em um ambiente de servidor
          if (typeof document !== 'undefined' && !document.URL.includes('/api/')) {
            console.log('🔄 [API] Redirecionando para página de login após erro 401');
            window.location.href = '/auth/login?error=session_expired';
            return { success: false, redirected: true } as unknown as T;
          }
        } catch (error) {
          console.error('❌ [API] Erro ao limpar tokens:', error);
        }
      }
      
      // Retornar um erro JSON em vez de redirecionar
      return {
        success: false,
        message: 'Sessão expirada ou usuário não autenticado',
        data: null
      } as unknown as T;
    }
    
    // Tentar obter a mensagem de erro do corpo da resposta
    let errorMessage: string;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || getErrorMessage(response.status, response.statusText);
    } catch {
      errorMessage = getErrorMessage(response.status, response.statusText);
    }
    
    // Incluir a URL da requisição na mensagem de erro para facilitar a depuração
    const requestUrl = response.url || 'URL desconhecida';
    console.error(`❌ [API] Erro ${response.status} ao acessar ${requestUrl}: ${errorMessage}`);
    
    throw new Error(`${errorMessage} (URL: ${requestUrl})`);
  }
  
  try {
    return await response.json();
  } catch (error) {
    console.error('❌ [API] Erro ao fazer parse do JSON:', error);
    throw new Error('Erro ao processar resposta do servidor');
  }
}

/**
 * Faz uma requisição GET à API.
 */
export const apiGet = async <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
  // Construir URL de forma segura para SSR
  let url: URL;
  if (typeof window !== 'undefined') {
    url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);
  } else {
    // No servidor, usar URL absoluta
    url = new URL(`${API_BASE_URL}${endpoint}`, 'https://portal.sabercon.com.br');
  }
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  const headers = await getHeaders();
  const response = await fetchWithRetry(url.toString(), { headers });
  return handleResponse<T>(response);
};

/**
 * Faz uma requisição POST à API.
 */
export const apiPost = async <T>(
  endpoint: string, 
  data: any, 
  options: { headers?: Record<string, string> } = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const baseHeaders = await getHeaders();
  
  // Combinar headers padrão com os headers personalizados
  const mergedHeaders = new Headers();
  
  // Adicionar headers padrão
  baseHeaders.forEach((value, key) => {
    mergedHeaders.set(key, value);
  });
  
  // Adicionar headers personalizados
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      mergedHeaders.set(key, value);
    });
  }
  
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: mergedHeaders,
    body: JSON.stringify(data)
  });
  return handleResponse<T>(response);
};

/**
 * Faz uma requisição PUT à API.
 */
export const apiPut = async <T>(endpoint: string, data: any): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = await getHeaders();
  const response = await fetchWithRetry(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data)
  });
  return handleResponse<T>(response);
};

/**
 * Faz uma requisição DELETE à API.
 */
export const apiDelete = async (endpoint: string): Promise<void> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = await getHeaders();
  const response = await fetchWithRetry(url, {
    method: 'DELETE',
    headers
  });
  await handleResponse(response);
};

/**
 * Faz uma requisição PATCH à API.
 */
export const apiPatch = async <T>(endpoint: string, data: any): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = await getHeaders();
  const response = await fetchWithRetry(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data)
  });
  return handleResponse<T>(response);
};
