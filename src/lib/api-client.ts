// Este arquivo foi neutralizado para o desacoplamento do frontend.
// Todas as chamadas de API foram mockadas para não depender do backend.

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

const getMockedAuthToken = (): string | null => {
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
    const token = getMockedAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

// --- Funções de Requisição Mockadas ---

export const fetchWithAuth = async (
  url: string, 
  options: ApiRequestOptions = {}
): Promise<Response> => {
  console.warn(`API call to "${url}" was intercepted in decoupled mode.`, { options });

  // Simula uma resposta de erro para qualquer chamada de API.
  const errorResponse = {
    success: false,
    message: `API Desacoplada: A chamada para ${url} foi bloqueada.`,
    error: 'Modo desacoplado ativado.',
  };

  return new Response(JSON.stringify(errorResponse), {
    status: 418, // "I'm a teapot" para indicar que é uma resposta mockada
    headers: { 'Content-Type': 'application/json' },
  });
};

export const parseJsonResponse = async <T = any>(response: Response): Promise<T> => {
  if (response.status === 418) { // Resposta mockada
    return response.json();
  }
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
  private async handleRequest<T>(method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithAuth(url, { method: method.toUpperCase(), body: body ? JSON.stringify(body) : undefined });
      const data = await parseJsonResponse<any>(response);
      return data as ApiResponse<T>;
    } catch (error) {
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
