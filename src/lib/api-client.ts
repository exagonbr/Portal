import { getAuthToken } from '@/services/auth';
import { getApiUrl, getInternalApiUrl, ENV_CONFIG } from '@/config/env';

// --- Tipos ---

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
  isInternal?: boolean;
  timeout?: number;
}

// Tipo para resposta da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
  items?: any[];
  pagination?: any;
}

// Classe de erro customizada
export class ApiClientError extends Error {
  status: number;
  errors?: string[];

  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.errors = errors;
  }
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
  fetchWithAuth(url, { ...options, method: 'DELETE' });

export const apiUpload = (url: string, formData: FormData, options?: Omit<ApiRequestOptions, 'body'>) => 
  fetchWithAuth(url, {
    ...options,
    method: 'POST',
    body: formData,
  });

// --- Função para tratar erros ---

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

// --- Classe ApiClient para compatibilidade ---

class ApiClient {
  async get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      let finalUrl = url;
      if (params) {
        const queryString = new URLSearchParams(
          Object.entries(params).map(([key, value]) => [key, String(value)])
        ).toString();
        finalUrl = `${url}?${queryString}`;
      }

      const response = await apiGet(finalUrl);
      const data = await parseJsonResponse<any>(response);
      
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

  async post<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiPost(url, body);
      const data = await parseJsonResponse<any>(response);
      
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
      const data = await parseJsonResponse<any>(response);
      
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
      const data = await parseJsonResponse<any>(response);
      
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
      
      let data: any = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await parseJsonResponse<any>(response);
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
