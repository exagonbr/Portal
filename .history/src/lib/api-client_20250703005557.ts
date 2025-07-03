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
import { getCurrentToken } from '@/utils/token-validator';

// Configuração otimizada para comunicação direta
const API_CONFIG = {
  // URL base única - comunicação direta via Nginx
  baseUrl: 'http://localhost:3001/api',
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
    this.baseURL = "API_CONFIG.baseUrl;"
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
      Authorization: 'Bearer ' + getCurrentToken(),
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
            Authorization: 'Bearer ' + getCurrentToken(),
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

      if (timeoutId) clearTimeout(timeoutId);

      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        data = { message: responseText };
      }

      if (!response.ok) {
        throw {
          message: data.message || data.error || `HTTP ${response.status}`,
          status: response.status,
          details: data
        } as ApiError;
      }
      
      return { success: true, data, message: data.message };

    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      
      const processedError = this.processError(error);
      return { success: false, message: processedError.message, errors: [JSON.stringify(processedError)] };
    }
  }

  /**
   * Métodos HTTP
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    const queryParams = params ? `?${new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString()}` : '';
    return this.makeRequest<T>(`${endpoint}${queryParams}`, { method: 'GET' });
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

    const headers: Record<string, string> = {
      Authorization: 'Bearer ' + getCurrentToken(),
      ...CORS_HEADERS
    };

    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers
    });
  }

  private processError(error: any): ApiError {
    if (error instanceof ApiClientError) {
      return {
        name: 'ApiClientError',
        message: error.message,
        status: error.status,
        details: error
      };
    }

    // Tratar erros de autenticação específicos
    if (error.status === 401) {
      // Evitar loop de redirecionamento em rotas de autenticação
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
        this.clearAuth();
        
        // CORREÇÃO: Verificar se já estamos em um processo de redirecionamento
        const redirectKey = 'api_auth_redirect_in_progress';
        const isRedirectInProgress = sessionStorage.getItem(redirectKey);
        
        if (isRedirectInProgress) {
          console.warn('🔄 Redirecionamento de autenticação já em andamento, evitando loop');
          return {
            name: 'AuthError',
            message: 'Redirecionamento em andamento',
            status: 401,
            details: error
          };
        }
        
        // Marcar que estamos redirecionando
        sessionStorage.setItem(redirectKey, 'true');
        
        // Limpar flag após 5 segundos
        setTimeout(() => {
          sessionStorage.removeItem(redirectKey);
        }, 5000);
        
        // CORREÇÃO: Melhorar lógica do returnTo
        const currentPath = window.location.pathname + window.location.search;
        
        // Não preservar returnTo se já estamos em uma rota de erro ou redirecionamento
        const shouldPreserveReturnTo = !currentPath.includes('?returnTo=') && 
                                      !currentPath.includes('auth/login') &&
                                      !currentPath.includes('error=') &&
                                      currentPath !== '/';
        
        if (shouldPreserveReturnTo) {
          const returnTo = encodeURIComponent(currentPath);
          console.log('🔗 Preservando returnTo:', currentPath);
          window.location.href = `/auth/login?returnTo=${returnTo}`;
        } else {
          console.log('🔗 Redirecionamento simples para login');
          window.location.href = '/auth/login';
        }
      }

      const currentToken = this.getAuthToken();
      const hasToken = !!currentToken;
      
      console.log('🔍 [API-CLIENT] Diagnóstico de erro 401:', {
        hasToken,
        tokenLength: currentToken ? currentToken.length : 0,
        errorMessage: error.message,
        errorDetails: error.details?.message
      });
      
      let message = 'Sessão inválida ou expirada. Por favor, faça login novamente.';
      
      if (!hasToken) {
        message = 'Token de autenticação não encontrado. Faça login novamente.';
      } else if (error.details?.message?.includes('expirado') || error.details?.message?.includes('expired')) {
        message = 'Sua sessão expirou. Faça login novamente.';
      } else if (error.details?.message?.includes('inválido') || error.details?.message?.includes('invalid')) {
        message = 'Seu token de acesso é inválido. Faça login novamente.';
      }
      
      return {
        name: 'AuthError',
        message,
        status: 401,
        details: error
      };
    }

    // Usar handler específico do Firefox
    const processedError = firefoxErrorHandler(error);

    if (processedError instanceof Error) {
      if (processedError.name === 'AbortError' || processedError.message.includes('timeout')) {
        return {
          name: 'TimeoutError',
          message: 'Timeout da requisição',
          status: 408,
          details: processedError
        };
      }
      if (processedError.name === 'TypeError' && processedError.message.includes('fetch')) {
        return {
          name: 'NetworkError',
          message: 'Erro de rede ao tentar acessar o recurso',
          status: 0,
          details: processedError
        };
      }
      if (processedError.message.includes('NS_BINDING_ABORTED')) {
        return {
          name: 'ConnectionError',
          message: 'Conexão interrompida. Tente novamente.',
          status: 0,
          details: processedError
        };
      }
      
      return {
        name: 'ApiError',
        message: processedError.message,
        status: 0,
        details: processedError
      };
    }

    // Se chegou até aqui, é um erro desconhecido
    let errorMessage = 'Sem detalhes disponíveis';
    let errorType = typeof error;
    
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.toString && typeof error.toString === 'function') {
      try {
        const stringified = error.toString();
        if (stringified !== '[object Object]') {
          errorMessage = stringified;
        }
      } catch (e) {
        // Ignorar erro de toString
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      // Tentar extrair informações úteis do objeto
      const possibleMessageKeys = ['message', 'error', 'description', 'detail', 'reason'];
      for (const key of possibleMessageKeys) {
        if (error[key] && typeof error[key] === 'string') {
          errorMessage = error[key];
          break;
        }
      }
      
      if (errorMessage === 'Sem detalhes disponíveis') {
        errorMessage = `Objeto de erro: ${JSON.stringify(error, null, 2).substring(0, 200)}`;
      }
    }
    
    if (error?.name) {
      errorType = error.name;
    } else if (error?.constructor?.name) {
      errorType = error.constructor.name;
    }
    
    const finalMessage = errorMessage === 'Sem detalhes disponíveis' 
      ? `Erro ${errorType} sem detalhes específicos` 
      : `Erro ${errorType}: ${errorMessage}`;
    
    return {
      name: 'ApiError',
      message: finalMessage,
      status: error?.status || 0,
      details: error
    };
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