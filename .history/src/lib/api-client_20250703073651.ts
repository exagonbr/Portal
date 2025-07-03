import { getAuthToken } from '@/services/auth';
import { getApiUrl } from '@/config/env';
import { toast } from 'react-hot-toast';

// --- Tipos ---

type ApiClientOptions = {
  useAuth?: boolean;
  showToast?: boolean;
};

// --- Headers Helper ---

const createHeaders = (useAuth: boolean): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (useAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// --- Tratamento de Erros Helper ---

const handleApiError = async (response: Response, showToast: boolean) => {
  let errorMessage = `Erro na requisição: ${response.status} ${response.statusText}`;
  try {
    const errorData = await response.json();
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
  
  // Para upload, não definir Content-Type (deixar o browser definir com boundary)
  const headers: Record<string, string> = {};
  
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return fetchWithAuth(url, {
    ...fetchOptions,
    method: 'POST',
    headers,
    body: formData,
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
};