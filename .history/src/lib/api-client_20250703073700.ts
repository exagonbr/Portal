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
    errorMessage = errorData.message || errorData.error || errorMessage;
  } catch (e) {
    // O corpo da resposta não é um JSON válido ou está vazio.
  }

  if (showToast) {
    toast.error(errorMessage);
  }

  // Lança um erro para que a chamada possa ser tratada com try/catch
  throw new Error(errorMessage);
};

// --- Cliente API ---

class ApiClient {
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    clientOptions: ApiClientOptions = { useAuth: true, showToast: true }
  ): Promise<T> {
    const { useAuth = true, showToast = true } = clientOptions;
    const fullUrl = getApiUrl(endpoint);
    const headers = createHeaders(useAuth);

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(fullUrl, config);

      if (!response.ok) {
        await handleApiError(response, showToast);
      }

      // Se a resposta for 204 No Content, não há corpo para decodificar
      if (response.status === 204) {
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
