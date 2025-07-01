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
  skipAuthRefresh?: boolean;
}

// Classe principal do cliente API
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private refreshPromise: Promise<void> | null = null;

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
   * Obtém o refresh token
   */
  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Tenta obter do localStorage primeiro
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) return refreshToken;
    
    // Fallback para cookies
    const cookieRefreshToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('refresh_token='))
      ?.split('=')[1];
    
    return cookieRefreshToken || null;
  }

  /**
   * Atualiza o token de autenticação
   */
  private async refreshAuthToken(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Refresh token não disponível. Por favor, faça login novamente.');
      }

      console.log('🔄 Tentando atualizar token de autenticação...');
      
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Falha ao atualizar token (${response.status}):`, errorText);
        
        // If refresh fails, clear auth and don't retry
        this.clearAuth();
        throw new Error(`Falha ao atualizar token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle both nested and flat response formats
      const tokenData = data.data || data;
      
      if (tokenData.token) {
        localStorage.setItem('auth_token', tokenData.token);
        if (tokenData.refresh_token) {
          localStorage.setItem('refresh_token', tokenData.refresh_token);
          
          // Atualizar também o cookie
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30); // Expira em 30 dias
          document.cookie = `refresh_token=${tokenData.refresh_token}; expires=${expiryDate.toUTCString()}; path=/; secure; samesite=strict`;
        }
        if (tokenData.expires_at) {
          localStorage.setItem('auth_expires_at', tokenData.expires_at);
        }
        console.log('✅ Token atualizado com sucesso');
      } else {
        console.error('❌ Resposta inválida ao atualizar token:', data);
        this.clearAuth();
        throw new Error('Resposta inválida ao atualizar token');
      }
    } catch (error) {
      // Limpa dados de autenticação em caso de erro
      this.clearAuth();
      console.error('❌ Erro ao atualizar token:', error);
      throw error;
    }
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
  private async makeRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', body, params, timeout = 30000, skipAuthRefresh = false } = options;
    
    try {
      const url = this.buildURL(endpoint, params);
      const headers = this.prepareHeaders(options.headers);

      const config: RequestInit = {
        method,
        headers,
        signal: AbortSignal.timeout(timeout),
      };

      if (body && method !== 'GET') {
        if (body instanceof FormData) {
          // Remove Content-Type header for FormData (browser will set it automatically)
          delete headers['Content-Type'];
          config.body = body;
        } else {
          config.body = JSON.stringify(body);
        }
      }

      console.log(`🌐 ${method} ${url}`);
      const response = await fetch(url, config);

      // Handle 401 errors with token refresh (but only for non-auth endpoints)
      if (response.status === 401 && !skipAuthRefresh && !endpoint.includes('/auth/')) {
        console.log('🔄 Token expirado, tentando renovar...');
        
        // Check if we have a refresh token before attempting refresh
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          console.log('❌ Sem refresh token disponível, limpando autenticação');
          this.clearAuth();
          throw new ApiClientError('Sessão expirada. Por favor, faça login novamente.', 401);
        }
        
        // Prevent multiple simultaneous refresh attempts
        if (!this.refreshPromise) {
          this.refreshPromise = this.refreshAuthToken().catch((error) => {
            this.refreshPromise = null;
            throw error;
          });
        }
        
        try {
          await this.refreshPromise;
          this.refreshPromise = null;
          
          // Retry the original request with new token (only once)
          console.log('🔄 Tentando novamente com novo token...');
          return this.makeRequest<T>(endpoint, { ...options, skipAuthRefresh: true });
        } catch (refreshError) {
          this.refreshPromise = null;
          console.error('❌ Falha ao renovar token:', refreshError);
          
          // Clear auth data but don't redirect here - let the component handle it
          this.clearAuth();
          throw new ApiClientError('Sessão expirada. Por favor, faça login novamente.', 401);
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        throw new ApiClientError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.errors
        );
      }

      const data = await response.json();
      
      // Normalize response format
      if (data && typeof data === 'object') {
        // If response has success field, return as is
        if ('success' in data) {
          return data as ApiResponse<T>;
        }
        
        // Otherwise, wrap in success response
        return {
          success: true,
          data: data as T
        };
      }

      return {
        success: true,
        data: data as T
      };
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
   * Limpa dados de autenticação
   */
  clearAuth(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_expires_at');
    localStorage.removeItem('user_data');

    // Limpa cookies também
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  /**
   * Define o token de autenticação
   */
  setAuthToken(token: string, refreshToken?: string, expiresAt?: string): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem('auth_token', token);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
      
      // Salvar também como cookie para redundância
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // Expira em 30 dias
      document.cookie = `refresh_token=${refreshToken}; expires=${expiryDate.toUTCString()}; path=/; secure; samesite=strict`;
    }
    if (expiresAt) {
      localStorage.setItem('auth_expires_at', expiresAt);
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
