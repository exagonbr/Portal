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
  fetchWithAuth(url, { ...options, method: 'DELETE' });

export const apiUpload = (url: string, formData: FormData, options?: Omit<ApiRequestOptions, 'body'>) => 
  fetchWithAuth(url, {
    ...options,
    method: 'POST',
    body: formData,
  });
