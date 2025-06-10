import { ApiResponse, ApiError } from '../types/api';

// Configuração base da API
// Função para garantir que a URL base da API esteja correta
const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  // Se a variável de ambiente não estiver definida, usa o padrão.
  if (!envUrl) {
    return 'http://localhost:3001/api';
  }

  // Remove barras no final, se houver.
  const cleanedUrl = envUrl.replace(/\/+$/, '');

  // Garante que a URL termina com /api.
  if (cleanedUrl.endsWith('/api')) {
    return cleanedUrl;
  }

  return `${cleanedUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Nota: Para que o CORS funcione corretamente, o servidor deve enviar os seguintes headers:
// Access-Control-Allow-Origin: *
// Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
// Access-Control-Allow-Headers: Content-Type, Authorization

// Função para validar e normalizar URLs
const normalizeEndpoint = (endpoint: string): string => {
  // Remove barras duplicadas
  let normalized = endpoint.replace(/\/+/g, '/');

  // Remove /api/ do início para evitar duplicação, pois a baseURL já contém /api
  if (normalized.startsWith('/api/')) {
    normalized = normalized.substring(5);
  } else if (normalized.startsWith('api/')) {
    normalized = normalized.substring(4);
  }

  // Remove a barra inicial restante, se houver, para garantir que a junção com a baseURL seja correta.
  if (normalized.startsWith('/')) {
    normalized = normalized.substring(1);
  }

  return normalized;
};

// Classe para erros da API
export class ApiClientError extends Error {
  public status: number;
  public errors?: string[];

  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.errors = errors;
  }
}

// Interface para opções de requisição
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

// Classe principal do cliente API
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Obtém o token de autenticação do localStorage ou cookies
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Tenta obter do localStorage primeiro
    const token = localStorage.getItem('auth_token');
    if (token) return token;

    // Fallback para cookies
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    return cookieToken || null;
  }

  /**
   * Constrói a URL completa com parâmetros de query
   */
  private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const normalizedEndpoint = normalizeEndpoint(endpoint);
    // Garante que a baseURL termina com uma barra para a junção correta
    const base = this.baseURL.endsWith('/') ? this.baseURL : `${this.baseURL}/`;
    const url = new URL(normalizedEndpoint, base);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Prepara os headers da requisição
   */
  private prepareHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };

    // Adiciona token de autenticação se disponível
    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Faz uma requisição HTTP
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers: customHeaders,
      body,
      params,
      timeout = 30000
    } = options;

    try {
      const url = this.buildURL(endpoint, params);
      const headers = this.prepareHeaders(customHeaders);

      // Log para debug
      console.log(`[API Request] ${method} ${url}`);
      console.log('[API Headers]', headers);

      // Remove Content-Type para FormData
      if (body instanceof FormData) {
        delete headers['Content-Type'];
      }

      const requestOptions: RequestInit = {
        method,
        headers,
        credentials: 'same-origin', // Alterado para permitir Access-Control-Allow-Origin: *
        mode: 'cors' // Explicitamente indica que é uma requisição CORS
      };

      // Requisições GET/HEAD não podem ter corpo
      if (method !== 'GET' && method !== 'HEAD' && body !== undefined) {
        requestOptions.body = body instanceof FormData ? body : JSON.stringify(body);
      }

      // Implementa timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Log da resposta para debug
      console.log(`[API Response] ${response.status} ${response.statusText}`);

      // Parse da resposta
      let responseData: ApiResponse<T>;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
        console.log('[API Response Data]', responseData);
      } else {
        const responseText = await response.text();
        // Para respostas não-JSON, cria uma resposta padrão
        responseData = {
          success: response.ok,
          data: responseText as any,
          message: response.ok ? 'Success' : (responseText || 'Request failed')
        };
      }

      // Verifica se a resposta foi bem-sucedida
      if (!response.ok) {
        // Se for erro de autenticação, limpa o token
        if (response.status === 401) {
          this.clearAuth();
        }
        
        // Caso especial para "Cache key not found" - tratamos como um indicador de que o recurso não existe
        // em vez de um erro de servidor, facilitando a verificação de existência de recursos
        if ((responseData.message === "Cache key not found" || 
            (responseData.message && responseData.message.includes("not found"))) && 
            responseData.success === false) {
          console.log("[API Client] Tratando resposta 'not found' como recurso inexistente");
          return {
            ...responseData,
            exists: false
          } as ApiResponse<T>;
        }
        
        throw new ApiClientError(
          responseData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          responseData.errors
        );
      }

      return responseData;
    } catch (error) {
      console.error('[API Error]', error);
      
      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiClientError('Request timeout', 408);
        }
        throw new ApiClientError(error.message, 0);
      }

      throw new ApiClientError('Unknown error occurred', 0);
    }
  }

  /**
   * Métodos HTTP convenientes
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'PATCH', body });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload de arquivo
   */
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Download de arquivo
   */
  async downloadFile(endpoint: string, filename?: string): Promise<void> {
    try {
      const url = this.buildURL(endpoint);
      const headers = this.prepareHeaders();

      const response = await fetch(url, {
        headers,
        credentials: 'same-origin',
        mode: 'cors'
      });

      if (!response.ok) {
        throw new ApiClientError(`Download failed: ${response.statusText}`, response.status);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError('Download failed', 0);
    }
  }

  /**
   * Interceptador para tratamento global de erros
   */
  setErrorInterceptor(interceptor: (error: ApiClientError) => void): void {
    // Implementar se necessário
  }

  /**
   * Interceptador para requisições
   */
  setRequestInterceptor(interceptor: (config: RequestOptions) => RequestOptions): void {
    // Implementar se necessário
  }

  /**
   * Limpa o cache de autenticação
   */
  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // Remove cookies
      document.cookie = 'auth_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      document.cookie = 'user_data=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    }
  }

  /**
   * Define o token de autenticação
   */
  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      
      // Também salva em cookie para SSR
      const expires = new Date();
      expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias
      document.cookie = `auth_token=${token};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
    }
  }
}

// Instância singleton do cliente API
export const apiClient = new ApiClient();

// Função helper para tratamento de erros
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiClientError) {
    if (error.errors && error.errors.length > 0) {
      return error.errors.join(', ');
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Erro desconhecido';
};

// Função helper para verificar se é erro de autenticação
export const isAuthError = (error: unknown): boolean => {
  return error instanceof ApiClientError && (error.status === 401 || error.status === 403);
};

// Função helper para verificar se um recurso existe com base na resposta da API
export const resourceExists = <T>(response: ApiResponse<T>): boolean => {
  // Se a resposta tiver a propriedade exists explicitamente definida como false, o recurso não existe
  if (response.exists === false) {
    return false;
  }
  
  // Se a resposta for bem-sucedida, o recurso existe
  if (response.success === true) {
    return true;
  }
  
  // Se a mensagem indicar "not found", o recurso não existe
  if (response.message && (
    response.message === "Cache key not found" || 
    response.message.includes("not found")
  )) {
    return false;
  }
  
  // Por padrão, consideramos que o recurso existe se a resposta não for explicitamente negativa
  return true;
};

// Função helper para retry automático
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Não faz retry para erros de autenticação ou validação
      if (error instanceof ApiClientError && (error.status === 401 || error.status === 400)) {
        throw error;
      }

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError;
};