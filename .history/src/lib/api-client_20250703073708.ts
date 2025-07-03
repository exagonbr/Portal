import { getAuthToken } from '@/services/auth';
import { getApiUrl, getInternalApiUrl, ENV_CONFIG } from '@/config/env';

// Tipo para opções de requisição
interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
  isInternal?: boolean;
  timeout?: number;
}

// Criar headers com autenticação
const createAuthHeaders = (skipAuth: boolean = false): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (ENV_CONFIG.DEBUG_MODE) {
      console.warn('⚠️ Token de autenticação não encontrado');
    }
  }

  return headers;
};

// Função principal para fazer requisições com autenticação
export const fetchWithAuth = async (
  url: string, 
  options: ApiRequestOptions = {}
): Promise<Response> => {
  const { 
    skipAuth = false, 
    isInternal = false,
    timeout = ENV_CONFIG.API_TIMEOUT,
    ...fetchOptions 
  } = options;

  // Construir URL completa
  const fullUrl = url.startsWith('http') 
    ? url 
    : isInternal 
      ? getInternalApiUrl(url)
      : getApiUrl(url);

  // Criar headers com autenticação
  const authHeaders = createAuthHeaders(skipAuth);
  
  // Mesclar opções
  const mergedOptions: RequestInit = {
    ...fetchOptions,
    headers: {
      ...authHeaders,
      ...(fetchOptions.headers || {}),
    },
  };

  // Adicionar timeout se suportado
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    if (ENV_CONFIG.DEBUG_MODE) {
      console.log(`🔗 API Request: ${mergedOptions.method || 'GET'} ${fullUrl}`);
    }

    const response = await fetch(fullUrl, {
      ...mergedOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Log de resposta em debug
        return null as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (showToast) {
        toast.error(error instanceof Error ? error.message : 'Ocorreu um erro de rede.');
      }
      throw error; // Re-lança o erro para tratamento posterior
    }
  }

  get<T>(endpoint: string, options?: ApiClientOptions) {
    return this.request<T>(endpoint, { method: 'GET' }, options);
  }

  post<T>(endpoint: string, body: any, options?: ApiClientOptions) {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }, options);
  }

  put<T>(endpoint: string, body: any, options?: ApiClientOptions) {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }, options);
  }

  patch<T>(endpoint: string, body: any, options?: ApiClientOptions) {
    return this.request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }, options);
  }

  delete<T>(endpoint: string, options?: ApiClientOptions) {
    return this.request<T>(endpoint, { method: 'DELETE' }, options);
  }
}

// --- Instância Singleton ---

export const apiClient = new ApiClient();

// --- Função fetchWithAuth (Legado, para manter compatibilidade) ---

/**
 * @deprecated Use o `apiClient` em vez desta função.
 */
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  console.warn("A função `fetchWithAuth` está obsoleta. Use o `apiClient`.");
  
  const headers = createHeaders(true);
  const fullUrl = url.startsWith('http') ? url : getApiUrl(url);

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  return fetch(fullUrl, mergedOptions);
};
