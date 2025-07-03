/**
 * Cliente API Otimizado para Portal Sabercon
 * Comunicação direta frontend-backend (sem proxy Next.js)
 */

import { ApiResponse, ApiError } from '@/types/api';
import { 
  isFirefox, 
  FirefoxUtils, 
  firefoxErrorHandler, 
  FIREFOX_CONFIG,
  initializeFirefoxCompatibility
} from '../utils/firefox-compatibility';
import { CORS_HEADERS } from '@/config/cors';

// Configuração otimizada para comunicação direta
const API_CONFIG = {
  // URL base única - comunicação direta via Nginx
  baseUrl: process.env.NODE_ENV === 'production'
    ? 'https://portal.sabercon.com.br/api'
    : 'https://portal.sabercon.com.br/api',
  timeout: 40000, // Reduzido para melhor UX
  retryAttempts: 2, // Reduzido para evitar sobrecarga
  retryDelay: 800,
} as const;

// Tipos
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  skipAuth?: boolean;
  isInternal?: boolean;
  timeout?: number;
}

// Tipo para resposta da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
  items?: any[];
  pagination?: any;
}

// Classe de erro customizada
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

// Inicializar compatibilidade com Firefox
if (typeof window !== 'undefined') {
  initializeFirefoxCompatibility();
}

// Cliente API otimizado
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    this.baseURL = API_CONFIG.baseUrl;
    this.timeout = API_CONFIG.timeout;
    
    // Log de inicialização apenas em desenvolvimento
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('🚀 [API-CLIENT] Inicializado com comunicação direta:', {
        baseURL: this.baseURL,
        timeout: this.timeout,
        proxyNextJS: 'DESABILITADO'
      });
    }
  }

  /**
   * Obtém o token de autenticação de forma otimizada
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    // Busca otimizada - priorizar localStorage
    const token = localStorage.getItem('auth_token') || 
                  localStorage.getItem('token') || 
                  sessionStorage.getItem('auth_token') ||
                  sessionStorage.getItem('token');
    
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      return token.trim();
    }
    
    return null;
  }

  /**
   * Define o token de autenticação
   */
  setAuthToken(token: string): void {
    if (typeof window !== 'undefined' && token && token.trim() !== '') {
      const cleanToken = token.trim();
      
      // Armazenar em localStorage com chave principal
      localStorage.setItem('auth_token', cleanToken);
      
      // Também armazenar com chaves alternativas para compatibilidade
      localStorage.setItem('token', cleanToken);
      
      // Limpar possíveis tokens antigos em sessionStorage
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('authToken');
      
      // Configurar cookie para o middleware com configuração mais robusta
      try {
        // Limpar cookies existentes primeiro
        const cookiesToClear = ['auth_token', 'token', 'authToken'];
        cookiesToClear.forEach(cookieName => {
          document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        });
        
        // Definir novo cookie principal
        const maxAge = 7 * 24 * 60 * 60; // 7 dias
        const cookieValue = `auth_token=${cleanToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = cookieValue;
        
        // Verificar se foi configurado corretamente
        const verifyToken = localStorage.getItem('auth_token');
        if (verifyToken !== cleanToken) {
          console.log('Falha ao armazenar token');
        }
        
      } catch (error) {
        console.log('Erro ao configurar cookie auth_token:', error);
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
        
      } catch (error) {
        console.log('Erro ao configurar cookie user_data:', error);
      }
    }
  }

  /**
   * Remove dados de autenticação
   */
  clearAuth(): void {
    if (typeof window !== 'undefined') {
      // Limpar localStorage
      const keysToRemove = ['auth_token', 'token', 'authToken', 'user', 'userData'];
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Limpar cookies
      const cookiesToClear = ['auth_token', 'token', 'authToken', 'user_data'];
      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `${cookieName}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });

      // Reset do estado interno
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Constrói URL completa
   */
  private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
    let url: string;
    
    if (endpoint.startsWith('http')) {
      url = endpoint;
    } else {
      // Garantir que não há barras duplas
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const baseURL = this.baseURL;
      const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
      url = `${cleanBaseURL}${cleanEndpoint}`;
    }
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }
    
    return url;
  }

  /**
   * Prepara headers da requisição
   */
  private prepareHeaders(customHeaders?: Record<string, string>, skipAuth = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...customHeaders
    };

    // Always add Authorization header when token is available (unless explicitly skipped)
    if (!skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 [API-CLIENT] Authorization header adicionado:', {
          length: token.length,
          preview: token.substring(0, 20) + '...'
        });
      } else {
        console.warn('⚠️ [API-CLIENT] Nenhum token disponível para Authorization header');
        
        // Diagnóstico adicional quando não há token
        if (typeof window !== 'undefined') {
          console.log('🔍 [API-CLIENT] Diagnóstico de storage:');
          const keys = ['auth_token', 'token', 'authToken'];
          keys.forEach(key => {
            const value = localStorage.getItem(key);
            console.log(`  localStorage.${key}:`, value ? `${value.length} chars` : 'null');
          });
        }
      }
    }

    return headers;
  }

  /**
   * Refresh do token de autenticação
   */
  private async refreshAuthToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return this.refreshPromise || Promise.resolve(false);
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            this.setAuthToken(data.token);
            return true;
          }
        }
        return false;
      } catch (error) {
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Faz requisição HTTP
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint);
    const headers = this.prepareHeaders(options.headers as Record<string, string>, false);
    const requestOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include'
    };

    if (options.body && !(options.body instanceof FormData)) {
      requestOptions.body = JSON.stringify(options.body);
    } else if (options.body instanceof FormData) {
      delete (requestOptions.headers as any)['Content-Type'];
      requestOptions.body = options.body;
    }

    let timeoutId: NodeJS.Timeout | null = null;

    try {
      let response: Response;
      console.log(`[API-CLIENT] Requisição direta para: ${url}`);

      if (isFirefox()) {
        response = FirefoxUtils.safeFetch
          ? await FirefoxUtils.safeFetch(url, requestOptions)
          : await fetch(url, requestOptions);
      } else {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), this.timeout);
        response = await fetch(url, { ...requestOptions, signal: controller.signal });
      }

      const response = await apiGet(finalUrl);
      const data = await parseJsonResponse<any>(response);
      
      if (typeof data === 'object' && data !== null && 'success' in data) {
        return data as ApiResponse<T>;
      }
      
      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiClientError(error.message, 500);
      }
      throw error;
    }
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

  private processError(error: any): ApiError {
    if (error instanceof ApiClientError) {
      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiClientError(error.message, 500);
      }
      throw error;
    }
  }

  async put<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiPut(url, body);
      const data = await parseJsonResponse<any>(response);
      
      if (typeof data === 'object' && data !== null && 'success' in data) {
        return data as ApiResponse<T>;
      }
      
      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiClientError(error.message, 500);
      }
      throw error;
    }
  }

  async patch<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiPatch(url, body);
      const data = await parseJsonResponse<any>(response);
      
      if (typeof data === 'object' && data !== null && 'success' in data) {
        return data as ApiResponse<T>;
      }
      
      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiClientError(error.message, 500);
      }
      throw error;
    }
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await apiDelete(url);
      
      let data: any = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await parseJsonResponse<any>(response);
      }
      
      if (data && typeof data === 'object' && 'success' in data) {
        return data as ApiResponse<T>;
      }
      
      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiClientError(error.message, 500);
      }
      throw error;
    }
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
