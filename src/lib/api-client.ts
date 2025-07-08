import { getApiUrl, getInternalApiUrl, ENV_CONFIG } from '@/config/env';

// --- Tipos ---

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
  isInternal?: boolean;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
  items?: any[];
  pagination?: any;
}

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

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem('accessToken');
  } catch (error) {
    console.error('Erro ao acessar localStorage:', error);
    return null;
  }
};

const createAuthHeaders = (skipAuth: boolean = false): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
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
  const { skipAuth = false, isInternal = false, timeout = 30000, ...restOptions } = options;
  
  const baseUrl = isInternal ? getInternalApiUrl() : getApiUrl();
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  const headers = createAuthHeaders(skipAuth);
  
  // Adiciona os headers personalizados
  const mergedHeaders = {
    ...headers,
    ...restOptions.headers,
  };

  // Configura o timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(fullUrl, {
      ...restOptions,
      headers: mergedHeaders,
      signal: controller.signal,
      credentials: 'include',
    });
    
    return response;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error(`Requisição para ${url} excedeu o tempo limite de ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const parseJsonResponse = async <T = any>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = `Erro ${response.status}: ${response.statusText}`;
    let errors: string[] | undefined;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      errors = errorData.errors;
    } catch { /* Ignora erro de parse */ }
    
    throw new ApiClientError(errorMessage, response.status, errors);
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
    headers: {
      ...options?.headers,
      // Não definimos Content-Type aqui para que o navegador defina automaticamente com o boundary correto
    },
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
  private async handleRequest<T>(method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, body?: any): Promise<ApiResponse<T>> {
    try {
      let response;
      
      switch (method) {
        case 'get':
          response = await apiGet(url);
          break;
        case 'post':
          response = await apiPost(url, body);
          break;
        case 'put':
          response = await apiPut(url, body);
          break;
        case 'patch':
          response = await apiPatch(url, body);
          break;
        case 'delete':
          response = await apiDelete(url);
          break;
      }
      
      const data = await parseJsonResponse<ApiResponse<T>>(response);
      return data;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ApiClientError(error.message, 500);
      }
      throw error;
    }
  }

  async get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let finalUrl = url;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      finalUrl = `${url}?${queryString}`;
    }
    return this.handleRequest('get', finalUrl);
  }

  async post<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    return this.handleRequest('post', url, body);
  }

  async put<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    return this.handleRequest('put', url, body);
  }

  async patch<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    return this.handleRequest('patch', url, body);
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.handleRequest('delete', url);
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
