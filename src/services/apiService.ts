import { getAuthentication } from '@/lib/auth-utils';
import { PaginatedResponse } from '@/types/api';
import { UnifiedAuthService } from '@/services/unifiedAuthService';

const API_BASE_URL = '/api';

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
const getHeaders = (): Headers => {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  // Busca o accessToken usando o serviço unificado
  const accessToken = UnifiedAuthService.getAccessToken();
  
  // Verificar se o token existe e tem formato válido
  if (accessToken && typeof accessToken === 'string' && accessToken.length > 20) {
    console.log(`🔑 [API] Usando token para requisição (${accessToken.substring(0, 10)}...)`);
    headers.set('Authorization', `Bearer ${accessToken}`);
    
    // Adicionar também como cookie para maior compatibilidade
    if (typeof document !== 'undefined') {
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
    }
  } else {
    console.warn("⚠️ [API] Token de autenticação não encontrado ou inválido. As requisições à API podem falhar.");
    console.log("🔍 [API] Token encontrado:", accessToken);
    
    // Tentar recuperar token de outras fontes - verificando se estamos no navegador
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof document !== 'undefined') {
      try {
        const alternativeTokens = [
          localStorage.getItem('accessToken'),
          localStorage.getItem('token'),
          localStorage.getItem('authToken'),
          document.cookie.split(';').find(c => c.trim().startsWith('accessToken='))?.split('=')[1]
        ].filter(Boolean);
        
        if (alternativeTokens.length > 0) {
          console.log("🔄 [API] Tentando usar token alternativo");
          const token = alternativeTokens[0];
          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
          }
        }
      } catch (error) {
        console.error("❌ [API] Erro ao tentar acessar tokens alternativos:", error);
      }
    }
  }
  return headers;
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
      
      // Se estiver no navegador, podemos redirecionar para a página de login
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          // Limpar tokens inválidos
          localStorage.removeItem('accessToken');
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Redirecionar para login após um pequeno delay
          setTimeout(() => {
            window.location.href = '/auth/login?auth_error=expired';
          }, 100);
        } catch (error) {
          console.error('❌ [API] Erro ao limpar tokens:', error);
        }
      }
      
      throw new Error('Sessão expirada ou usuário não autenticado');
    }
    
    // Tratamento especial para erro 504 (Gateway Timeout)
    if (response.status === 504) {
      console.error('❌ [API] Erro 504: Gateway Timeout - Servidor demorou muito para responder');
      throw new Error('Servidor demorou muito para responder. Tente novamente em alguns momentos.');
    }
    
    // Tratamento para outros erros 5xx (Erros do servidor)
    if (response.status >= 500) {
      console.error(`❌ [API] Erro ${response.status}: Erro interno do servidor`);
      throw new Error(`Erro interno do servidor (${response.status}). Tente novamente mais tarde.`);
    }
    
    try {
      const error = await response.json();
      throw new Error(error.message || getErrorMessage(response.status, response.statusText));
    } catch (e) {
      // Se não conseguir fazer parse do JSON, usar mensagem amigável
      const errorMessage = getErrorMessage(response.status, response.statusText);
      throw new Error(errorMessage);
    }
  }
  // Retorna um objeto vazio se o status for 204 No Content
  if (response.status === 204) {
    return {} as T;
  }
  return response.json() as Promise<T>;
}

/**
 * Realiza uma requisição GET para a API.
 * @param endpoint O endpoint da API.
 * @param params Os parâmetros de query.
 * @returns Uma promessa que resolve com os dados da resposta.
 */
export const apiGet = async <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
  let query = '';
  if (params) {
    // Filtrar parâmetros undefined, null ou vazios
    const filteredParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filteredParams[key] = String(value);
      }
    });
    query = new URLSearchParams(filteredParams).toString();
  }
  
  const url = query ? `${API_BASE_URL}${endpoint}?${query}` : `${API_BASE_URL}${endpoint}`;
  
  // Verificar token antes de fazer a requisição
  const token = UnifiedAuthService.getAccessToken();
  if (!token && typeof window !== 'undefined') {
    console.warn('Tentativa de requisição sem token de autenticação:', endpoint);
  }
  
  try {
    const response = await fetchWithRetry(url, {
      headers: getHeaders(),
      credentials: 'include',
    });
    return handleResponse<T>(response);
  } catch (error) {
    console.error(`❌ [API] Erro ao fazer requisição GET para ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Realiza uma requisição POST para a API.
 * @param endpoint O endpoint da API.
 * @param data O corpo da requisição.
 * @returns Uma promessa que resolve com os dados da resposta.
 */
export const apiPost = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  } catch (error) {
    console.error(`❌ [API] Erro ao fazer requisição POST para ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Realiza uma requisição PUT para a API.
 * @param endpoint O endpoint da API.
 * @param data O corpo da requisição.
 * @returns Uma promessa que resolve com os dados da resposta.
 */
export const apiPut = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  } catch (error) {
    console.error(`❌ [API] Erro ao fazer requisição PUT para ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Realiza uma requisição PATCH para a API.
 * @param endpoint O endpoint da API.
 * @param data O corpo da requisição.
 * @returns Uma promessa que resolve com os dados da resposta.
 */
export const apiPatch = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  } catch (error) {
    console.error(`❌ [API] Erro ao fazer requisição PATCH para ${endpoint}:`, error);
    throw error;
  }
};


/**
 * Realiza uma requisição DELETE para a API.
 * @param endpoint O endpoint da API.
 * @returns Uma promessa que resolve quando a requisição é completada.
 */
export const apiDelete = async (endpoint: string): Promise<void> => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    });
    await handleResponse<void>(response);
  } catch (error) {
    console.error(`❌ [API] Erro ao fazer requisição DELETE para ${endpoint}:`, error);
    throw error;
  }
};
