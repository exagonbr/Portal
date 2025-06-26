/**
 * Cliente API Unificado para Portal Sabercon
 * Substitui: api.ts, apiClient.ts, httpClient.ts
 */

import { ApiResponse, ApiError } from '@/types/api';

// Configuração centralizada
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// Tipos
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  skipAuth?: boolean;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Classe de erro personalizada
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

// Cliente API principal
class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  /**
   * Obtém o token de autenticação
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Tentar obter token de localStorage
    let token = localStorage.getItem('auth_token') || 
                localStorage.getItem('token') ||
                localStorage.getItem('authToken') ||
                sessionStorage.getItem('token') ||
                sessionStorage.getItem('auth_token');
    
    // Se não encontrar no storage, tentar obter dos cookies
    if (!token) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'auth_token' || name === 'token' || name === 'authToken') {
          token = value;
          break;
        }
      }
    }
    
    return token;
  }

  /**
   * Define o token de autenticação
   */
  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      
      // Configurar cookie para o middleware com configuração mais robusta
      try {
        // Limpar cookie existente primeiro
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        // Definir novo cookie
        const cookieValue = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        document.cookie = cookieValue;
        
        console.log('🍪 Token configurado nos cookies e localStorage');
      } catch (error) {
        console.error('❌ Erro ao configurar cookie auth_token:', error);
      }
    }
  }

  /**
   * Define dados do usuário (para middleware)
   */
  setUserData(userData: any): void {
    if (typeof window !== 'undefined') {
      try {
        const userDataString = encodeURIComponent(JSON.stringify(userData));
        
        // Limpar cookie existente primeiro
        document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        // Definir novo cookie
        const cookieValue = `user_data=${userDataString}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        document.cookie = cookieValue;
        
        console.log('🍪 Dados do usuário configurados nos cookies');
      } catch (error) {
        console.error('❌ Erro ao configurar cookie user_data:', error);
      }
    }
  }

  /**
   * Remove dados de autenticação
   */
  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Limpar cookies
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  /**
   * Constrói URL com parâmetros
   */
  private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = new URL(cleanEndpoint, this.baseURL);
    
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
   * Prepara headers da requisição
   */
  private prepareHeaders(customHeaders?: Record<string, string>, skipAuth = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders,
    };

    // Adiciona token de autenticação se disponível e não for para pular
    if (!skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        // Também adicionar como header customizado para o middleware
        headers['X-Auth-Token'] = token;
      }
    }

    return headers;
  }

  /**
   * Renova o token de autenticação
   */
  private async refreshAuthToken(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = new Promise<boolean>(async (resolve) => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) {
          resolve(false);
          return;
        }

        const data = await response.json();
        
        if (data.success && data.data.token) {
          this.setAuthToken(data.data.token);
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (error) {
        console.error('Erro no refresh token:', error);
        resolve(false);
      }
    });

    const result = await this.refreshPromise;
    this.isRefreshing = false;
    this.refreshPromise = null;
    return result;
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
      timeout = API_CONFIG.timeout,
      skipAuth = false
    } = options;

    try {
      const url = this.buildURL(endpoint, params);
      const headers = this.prepareHeaders(customHeaders, skipAuth);

      // Remove Content-Type para FormData
      if (body instanceof FormData) {
        delete headers['Content-Type'];
      }

      const requestOptions: RequestInit = {
        method,
        headers,
        body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
        credentials: 'include',
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
        responseData = {
          success: response.ok,
          data: (await response.text()) as any,
          message: response.ok ? 'Success' : 'Request failed'
        };
      }

      // Trata erro de autenticação (401) - REFRESH DESABILITADO PARA APRESENTAÇÃO
      if (response.status === 401 && !skipAuth && !endpoint.includes('/auth/')) {
        console.log('🔄 ApiClient: Erro 401 detectado, mas refresh automático está DESABILITADO para apresentação');
        
        // TODA A LÓGICA DE REFRESH DESABILITADA PARA APRESENTAÇÃO
        // Apenas continuar sem fazer refresh ou redirecionamento
        console.log('🔄 ApiClient: Continuando sem refresh para apresentação');
        
        // Não fazer nada - apenas continuar
        // const refreshed = await this.refreshAuthToken();
        // if (refreshed) {
        //   return this.makeRequest<T>(endpoint, options);
        // } else {
        //   this.clearAuth();
        //   if (typeof window !== 'undefined') {
        //     window.location.href = '/login';
        //   }
        //   throw new ApiClientError('Sessão expirada. Por favor, faça login novamente.', 401);
        // }
      }

      // Verifica outros erros
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
          throw new ApiClientError('Timeout da requisição', 408);
        }
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new ApiClientError('Erro de rede ao tentar acessar o recurso', 0);
        }
        throw new ApiClientError(error.message, 0);
      }

      throw new ApiClientError('Erro desconhecido', 0);
    }
  }

  /**
   * Métodos HTTP
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
}

// Classe base para serviços de API
export class BaseApiService<T> {
  protected endpoint: string;
  protected client: ApiClient;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.client = apiClient;
  }

  async getAll(params?: any): Promise<T[]> {
    const response = await this.client.get<T[]>(this.endpoint, params);
    return response.data || [];
  }

  async getPaginated(params?: any): Promise<PaginatedResponse<T>> {
    const response = await this.client.get<PaginatedResponse<T>>(this.endpoint, params);
    return response.data || { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }

  async getById(id: string | number): Promise<T> {
    const response = await this.client.get<T>(`${this.endpoint}/${id}`);
    if (!response.data) throw new Error('Resource not found');
    return response.data;
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await this.client.post<T>(this.endpoint, data);
    if (!response.data) throw new Error('Failed to create resource');
    return response.data;
  }

  async update(id: string | number, data: Partial<T>): Promise<T> {
    const response = await this.client.put<T>(`${this.endpoint}/${id}`, data);
    if (!response.data) throw new Error('Failed to update resource');
    return response.data;
  }

  async delete(id: string | number): Promise<void> {
    await this.client.delete(`${this.endpoint}/${id}`);
  }

  async search(query: string, params?: any): Promise<T[]> {
    const response = await this.client.get<T[]>(`${this.endpoint}/search`, {
      q: query, 
      ...params 
    });
    return response.data || [];
  }
}

// Instância singleton
export const apiClient = new ApiClient();

// Funções utilitárias
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

export const isAuthError = (error: unknown): boolean => {
  return error instanceof ApiClientError && (error.status === 401 || error.status === 403);
};

// Função para retry automático
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = API_CONFIG.retryAttempts,
  delay: number = API_CONFIG.retryDelay
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

export default apiClient; 