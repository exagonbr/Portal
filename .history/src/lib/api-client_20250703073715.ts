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
    if (ENV_CONFIG.DEBUG_MODE) {
      console.log(`✅ API Response: ${response.status} ${response.statusText}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Requisição expirou após ${timeout}ms`);
    }
    
    throw error;
  }
};

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
  const { skipAuth = false, ...fetchOptions } = options || {};
  
