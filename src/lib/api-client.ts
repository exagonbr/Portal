/**
 * Cliente API Unificado para Portal Sabercon
 * Substitui: api.ts, apiClient.ts, httpClient.ts
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

// Inicializar compatibilidade com Firefox
if (typeof window !== 'undefined') {
  initializeFirefoxCompatibility();
}

// Cliente API principal
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  /**
   * Obtém o token de autenticação
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') {
      console.log('🔍 [API-CLIENT] getAuthToken: Executando no servidor, retornando null');
      return null;
    }
    
    console.log('🔍 [API-CLIENT] getAuthToken: Procurando token...');
    
    // Tentar obter token de localStorage com prioridade
    const possibleKeys = ['auth_token', 'token', 'authToken'];
    let token = null;
    let tokenSource = '';
    
    for (const key of possibleKeys) {
      const storedToken = localStorage.getItem(key);
      if (storedToken && storedToken.trim() !== '') {
        token = storedToken.trim();
        tokenSource = `localStorage.${key}`;
        console.log(`✅ [API-CLIENT] Token encontrado em ${tokenSource}:`, token.substring(0, 20) + '...');
        break;
      }
    }
    
    // Se não encontrar no localStorage, tentar sessionStorage
    if (!token) {
      for (const key of possibleKeys) {
        const storedToken = sessionStorage.getItem(key);
        if (storedToken && storedToken.trim() !== '') {
          token = storedToken.trim();
          tokenSource = `sessionStorage.${key}`;
          console.log(`✅ [API-CLIENT] Token encontrado em ${tokenSource}:`, token.substring(0, 20) + '...');
          break;
        }
      }
    }
    
    // Se não encontrar nos storages, tentar obter dos cookies
    if (!token) {
      console.log('🔍 [API-CLIENT] Procurando token nos cookies...');
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (['auth_token', 'token', 'authToken'].includes(name) && value && value.trim() !== '') {
          token = value.trim();
          tokenSource = `cookie.${name}`;
          console.log(`✅ [API-CLIENT] Token encontrado em ${tokenSource}:`, token.substring(0, 20) + '...');
          break;
        }
      }
    }
    
    if (!token) {
      console.warn('❌ [API-CLIENT] Nenhum token válido encontrado!');
      console.log('🔍 [API-CLIENT] Debug info:', {
        localStorageKeys: Object.keys(localStorage),
        sessionStorageKeys: Object.keys(sessionStorage),
        cookies: document.cookie,
        cookieCount: document.cookie.split(';').length
      });
      return null;
    }
    
    // Validar formato básico do token
    if (token.length < 10) {
      console.warn('❌ [API-CLIENT] Token muito curto, provavelmente inválido:', token.length);
      return null;
    }
    
    // Verificar se é um JWT válido (3 partes separadas por ponto)
    const jwtParts = token.split('.');
    if (jwtParts.length === 3) {
      console.log('✅ [API-CLIENT] Token parece ser um JWT válido');
      
      try {
        // Tentar decodificar o payload para verificar expiração
        const payload = JSON.parse(atob(jwtParts[1]));
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          console.warn('⏰ [API-CLIENT] Token JWT expirado:', new Date(payload.exp * 1000));
          // Não retornar token expirado, mas não limpar ainda (deixar para o refresh)
          return token; // Ainda retornar para tentar refresh
        }
        console.log('✅ [API-CLIENT] Token JWT válido e não expirado');
      } catch (error) {
        console.warn('⚠️ [API-CLIENT] Erro ao decodificar payload JWT:', error);
        // Ainda retornar o token, pode ser válido mesmo com erro de decode
      }
    } else {
      console.log('🔍 [API-CLIENT] Token não é JWT, pode ser token customizado');
    }
    
    console.log(`✅ [API-CLIENT] Retornando token de ${tokenSource}:`, token.substring(0, 20) + '...');
    return token;
  }

  /**
   * Define o token de autenticação
   */
  setAuthToken(token: string): void {
    if (typeof window !== 'undefined' && token && token.trim() !== '') {
      const cleanToken = token.trim();
      
      console.log('🔐 [API-CLIENT] Configurando token de autenticação:', cleanToken.substring(0, 20) + '...');
      
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
        
        console.log('✅ [API-CLIENT] Token configurado com sucesso em localStorage e cookies');
        
        // Verificar se foi configurado corretamente
        const verifyToken = localStorage.getItem('auth_token');
        if (verifyToken === cleanToken) {
          console.log('✅ [API-CLIENT] Verificação: Token armazenado corretamente');
        } else {
          console.error('❌ [API-CLIENT] Verificação: Falha ao armazenar token');
        }
        
      } catch (error) {
        console.error('❌ [API-CLIENT] Erro ao configurar cookie auth_token:', error);
        // Mesmo com erro no cookie, o localStorage ainda funciona
      }
    } else {
      console.error('❌ [API-CLIENT] Token inválido fornecido para setAuthToken:', token);
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
      console.log('🧹 [API-CLIENT] Limpando dados de autenticação...');
      
      // Limpar localStorage
      const localStorageKeys = ['auth_token', 'token', 'authToken', 'user', 'user_session', 'userSession'];
      localStorageKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Limpar sessionStorage
      const sessionStorageKeys = ['auth_token', 'token', 'authToken', 'user', 'user_session', 'userSession'];
      sessionStorageKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      // Limpar cookies
      const cookiesToClear = ['auth_token', 'token', 'authToken', 'user_data', 'session_token', 'refresh_token', 'session_id'];
      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `${cookieName}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });
      
      console.log('✅ [API-CLIENT] Dados de autenticação limpos');
    }
  }

  /**
   * Constrói URL com parâmetros
   */
  private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
    // Se o endpoint já começa com /api, usar ele diretamente
    let fullURL: string;
    if (endpoint.startsWith('/api/')) {
      fullURL = endpoint;
    } else {
      // Remover barra inicial do endpoint para evitar duplicação
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
      
      // Garantir que baseURL termine com /
      const baseURL = this.baseURL.endsWith('/') ? this.baseURL : this.baseURL + '/';
      
      // Construir URL completa
      fullURL = baseURL + cleanEndpoint;
    }
    
    const url = new URL(fullURL, window.location.origin);
    
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
    console.log('🔍 [API-CLIENT] prepareHeaders: skipAuth =', skipAuth);
    
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
        console.log('✅ [API-CLIENT] Token adicionado aos headers:', token.substring(0, 20) + '...');
      } else {
        console.warn('❌ [API-CLIENT] Nenhum token disponível para adicionar aos headers');
      }
    } else {
      console.log('🔍 [API-CLIENT] Autenticação ignorada (skipAuth = true)');
    }

    console.log('🔍 [API-CLIENT] Headers finais:', Object.keys(headers));
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
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint);
    let timeoutId: NodeJS.Timeout | undefined;
    
    console.log('🔍 [API-CLIENT] makeRequest - URL construída:', url);
    console.log('🔍 [API-CLIENT] makeRequest - Endpoint:', endpoint);
    console.log('🔍 [API-CLIENT] makeRequest - BaseURL:', this.baseURL);
    
    try {
      // Prepara headers incluindo autenticação
      const headers = this.prepareHeaders(options.headers as Record<string, string>);
      
      // Configuração específica para CORS e compatibilidade
      const requestOptions: RequestInit = {
        ...options,
        mode: 'cors',
        credentials: 'omit', // Usar 'omit' com CORS '*'
        cache: 'no-cache',
        headers: {
          ...headers,
          'Accept': 'application/json, text/plain, */*',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      };

      // Serializar body se necessário
      if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        requestOptions.body = JSON.stringify(options.body);
      }

      // Para Firefox, usar fetch seguro sem AbortController
      let response: Response;
      if (isFirefox()) {
        console.log('🦊 Firefox: Usando fetch seguro');
        // Remover signal se existir
        delete requestOptions.signal;
        response = await FirefoxUtils.safeFetch(url, requestOptions);
      } else {
        // Para outros navegadores, usar AbortController com timeout
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), this.timeout);
        requestOptions.signal = controller.signal;
        
        response = await fetch(url, requestOptions);
      }

      // Limpar timeout se a requisição foi bem-sucedida
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Processar resposta
      const responseText = await response.text();
      let data: any;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.warn('Resposta não é JSON válido:', responseText);
        data = { message: responseText };
      }

      if (!response.ok) {
        throw {
          name: 'ApiError',
          message: data.message || data.error || `HTTP ${response.status}`,
          status: response.status,
          details: data
        } as ApiError;
      }

      return {
        success: true,
        data,
        message: data.message
      };

    } catch (error: any) {
      // Limpar timeout em caso de erro
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Tratar erros específicos
      const processedError = this.processError(error);
      
      // Log específico para Firefox
      if (isFirefox() && FirefoxUtils.isNSBindingAbortError(error)) {
        console.warn('🦊 Firefox: Erro NS_BINDING_ABORTED tratado');
        return {
          success: false,
          message: 'Request cancelled by browser'
        };
      }

      return {
        success: false,
        message: processedError.message
      };
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

    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  }

  private processError(error: any): ApiError {
    console.log('🔍 [API-CLIENT] processError chamado com:', error);
    
    if (error instanceof ApiClientError) {
      console.log('🔍 [API-CLIENT] Erro já é ApiClientError:', error.message);
      return {
        name: 'ApiClientError',
        message: error.message,
        status: error.status,
        details: error
      };
    }

    // Tratar erros de autenticação específicos
    if (error.status === 401) {
      const currentToken = this.getAuthToken();
      const hasToken = !!currentToken;
      const tokenPreview = currentToken ? currentToken.substring(0, 20) + '...' : 'nenhum';
      
      // Log detalhado para debug
      console.error('❌ [API-CLIENT] Erro 401 - Detalhes de autenticação:', {
        hasToken,
        tokenPreview,
        errorDetails: error.details || {},
        errorMessage: error.message || 'sem mensagem',
        errorName: error.name || 'sem nome',
        errorStack: error.stack || 'sem stack',
        fullError: error,
        localStorage: typeof window !== 'undefined' ? {
          auth_token: !!localStorage.getItem('auth_token'),
          token: !!localStorage.getItem('token'),
          authToken: !!localStorage.getItem('authToken')
        } : 'server-side',
        cookies: typeof window !== 'undefined' ? document.cookie : 'server-side'
      });
      
      let message = 'Token de autenticação inválido! "Erro desconhecido"';
      
      if (!hasToken) {
        message = 'Token de autenticação não encontrado. Faça login novamente.';
      } else if (error.details?.message?.includes('expirado') || error.details?.message?.includes('expired')) {
        message = 'Token de autenticação expirado. Faça login novamente.';
      } else if (error.details?.message?.includes('inválido') || error.details?.message?.includes('invalid')) {
        message = 'Token de autenticação inválido. Faça login novamente.';
      } else if (error.message) {
        message = `Token de autenticação inválido! "${error.message}"`;
      } else if (error.details?.message) {
        message = `Token de autenticação inválido! "${error.details.message}"`;
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
    console.log('🔍 [API-CLIENT] Erro processado pelo Firefox handler:', processedError);

    if (processedError instanceof Error) {
      if (processedError.name === 'AbortError' || processedError.message.includes('timeout')) {
        console.log('🔍 [API-CLIENT] Erro de timeout detectado');
        return {
          name: 'ApiError',
          message: 'Timeout da requisição',
          status: 408,
          details: processedError
        };
      }
      if (processedError.name === 'TypeError' && processedError.message.includes('fetch')) {
        console.log('🔍 [API-CLIENT] Erro de rede detectado');
        return {
          name: 'ApiError',
          message: 'Erro de rede ao tentar acessar o recurso',
          status: 0,
          details: processedError
        };
      }
      if (processedError.message.includes('NS_BINDING_ABORTED')) {
        console.log('🔍 [API-CLIENT] Erro NS_BINDING_ABORTED detectado');
        return {
          name: 'ApiError',
          message: 'Conexão interrompida. Tente novamente.',
          status: 0,
          details: processedError
        };
      }
      
      console.log('🔍 [API-CLIENT] Retornando erro genérico com mensagem:', processedError.message);
      return {
        name: 'ApiError',
        message: processedError.message,
        status: 0,
        details: processedError
      };
    }

    // Se chegou até aqui, é um erro desconhecido mesmo
    console.log('🔍 [API-CLIENT] Erro desconhecido, tipo:', typeof error, error);
    console.log('🔍 [API-CLIENT] Error keys:', error ? Object.keys(error) : 'no keys');
    console.log('🔍 [API-CLIENT] Error stack:', error?.stack);
    
    const errorMessage = error?.message || error?.toString() || 'Sem detalhes disponíveis';
    const errorType = error?.name || typeof error;
    
    return {
      name: 'ApiError',
      message: `Erro ${errorType}: ${errorMessage}`,
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