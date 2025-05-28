import { ApiResponse, ApiError } from '../types/api';

// Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
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
      'Content-Type': 'application/json',
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
    const url = new URL(endpoint, this.baseURL);
    
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

      // Remove Content-Type para FormData
      if (body instanceof FormData) {
        delete headers['Content-Type'];
      }

      const requestOptions: RequestInit = {
        method,
        headers,
        body: body instanceof FormData ? body : JSON.stringify(body),
      };

      // Implementa timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse da resposta
      let responseData: ApiResponse<T>;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        // Para respostas não-JSON, cria uma resposta padrão
        responseData = {
          success: response.ok,
          data: (await response.text()) as any,
          message: response.ok ? 'Success' : 'Request failed'
        };
      }

      // Verifica se a resposta foi bem-sucedida
      if (!response.ok) {
        throw new ApiClientError(
          responseData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          responseData.errors
        );
      }

      return responseData;
    } catch (error) {
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

      const response = await fetch(url, { headers });

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