import { getAuthToken } from '@/services/auth';
import { getApiUrl, getInternalApiUrl, ENV_CONFIG } from '@/config/env';

// --- Tipos ---

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
  isInternal?: boolean;
  timeout?: number;
}

// --- Helpers ---

const createAuthHeaders = (skipAuth: boolean = false, isUpload: boolean = false): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (!isUpload) {
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
  }
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

// --- Funções de Requisição ---

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

  const fullUrl = url.startsWith('http') 
    ? url 
    : isInternal 
      ? getInternalApiUrl(url)
      : getApiUrl(url);

  const authHeaders = createAuthHeaders(skipAuth, fetchOptions.body instanceof FormData);
  
  const mergedOptions: RequestInit = {
    ...fetchOptions,
    headers: {
      ...authHeaders,
      ...(fetchOptions.headers || {}),
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(fullUrl, {
      ...mergedOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Requisição para ${url} expirou após ${timeout}ms`);
    }
    throw error;
  }
};

export const parseJsonResponse = async <T = any>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = `Erro ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch { /* Ignora erro de parse */ }
    throw new Error(errorMessage);
  }
  if (response.status === 204) {
    return null as T;
  }
  return response.json();
};

// --- API Wrappers ---

export const apiGet = (url: string, options?: ApiRequestOptions) => 
  fetchWithAuth(url, { ...options, method: 'GET' });

export const apiPost = (url: string, body?: any, options?: ApiRequestOptions) => 
  fetchWithAuth(url, { 
    ...options, 
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiPut = (url: string, body?: any, options?: ApiRequestOptions) => 
  fetchWithAuth(url, { 
    ...options, 
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiPatch = (url: string, body?: any, options?: ApiRequestOptions) => 
  fetchWithAuth(url, { 
    ...options, 
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiDelete = (url: string, options?: ApiRequestOptions) => 

// Funções auxiliares para métodos HTTP comuns
export const apiGet = (url: string, options?: ApiRequestOptions) => 
  fetchWithAuth(url, { ...options, method: 'GET' });

export const apiPost = (url: string, body?: any, options?: ApiRequestOptions) => 
  fetchWithAuth(url, { 
    ...options, 
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiPut = (url: string, body?: any, options?: ApiRequestOptions) => 
  fetchWithAuth(url, { 
    ...options, 
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiPatch = (url: string, body?: any, options?: ApiRequestOptions) => 
  fetchWithAuth(url, { 
    ...options, 
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiDelete = (url: string, options?: ApiRequestOptions) => 
  fetchWithAuth(url, { ...options, method: 'DELETE' });

// Função para upload de arquivos
export const apiUpload = async (
  url: string, 
  formData: FormData, 
  options?: ApiRequestOptions
): Promise<Response> => {
  const { skipAuth = false, isInternal = false, ...fetchOptions } = options || {};
  
  // Para upload, usar headers especiais
  const headers = createAuthHeaders(skipAuth, true);

  return fetchWithAuth(url, {
    ...fetchOptions,
    method: 'POST',
    headers,
    body: formData,
    skipAuth,
    isInternal,
  });
};

// Função helper para processar respostas JSON
export const parseJsonResponse = async <T = any>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Se não conseguir fazer parse do erro, usar mensagem padrão
    }
    
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch {
    throw new Error('Resposta inválida do servidor');
  }
};

// Função para tratar erros de API
export const handleApiError = (error: any): string => {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Erro desconhecido ao processar requisição';
};

// Classe ApiClient para compatibilidade com courseService
class ApiClient {
  async get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      // Construir query string se houver parâmetros
      let finalUrl = url;
      if (params) {
        const queryString = new URLSearchParams(
          Object.entries(params).map(([key, value]) => [key, String(value)])
        ).toString();
        finalUrl = `${url}?${queryString}`;
      }

      const response = await apiGet(finalUrl);
      const data = await parseJsonResponse<T>(response);
      
      // Adaptar resposta para formato esperado
      if (typeof data === 'object' && data !== null && 'success' in data) {
        return data as ApiResponse<T>;
      }
      
      // Se não for o formato esperado, encapsular
      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiClientError(error.message, 500);
      }
      throw error;
    }
  }

  async post<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiPost(url, body);
      const data = await parseJsonResponse<T>(response);
      
      if (typeof data === 'object' && data !== null && 'success' in data) {
        return data as ApiResponse<T>;
      }
      
      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiClientError(error.message, 500);
      }
      throw error;
    }
  }

  async put<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiPut(url, body);
      const data = await parseJsonResponse<T>(response);
      
      if (typeof data === 'object' && data !== null && 'success' in data) {
        return data as ApiResponse<T>;
      }
      
      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiClientError(error.message, 500);
      }
      throw error;
    }
  }

  async patch<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiPatch(url, body);
      const data = await parseJsonResponse<T>(response);
      
      if (typeof data === 'object' && data !== null && 'success' in data) {
        return data as ApiResponse<T>;
      }
      
      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiClientError(error.message, 500);
      }
      throw error;
    }
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await apiDelete(url);
      
      // Para DELETE, pode não haver corpo na resposta
      let data: any = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await parseJsonResponse<T>(response);
      }
      
      if (data && typeof data === 'object' && 'success' in data) {
        return data as ApiResponse<T>;
      }
      
      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiClientError(error.message, 500);
      }
      throw error;
    }
  }
}

// Instância singleton do ApiClient
export const apiClient = new ApiClient();

// Exportar tudo como default também
export default {
  fetchWithAuth,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  upload: apiUpload,
  parseJson: parseJsonResponse,
  client: apiClient,
  handleError: handleApiError,
};
