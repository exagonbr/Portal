/**
 * Cliente de API Unificado
 * 
 * Esta implementação centraliza toda a lógica de autenticação e requisições HTTP,
 * resolvendo os conflitos entre múltiplas implementações de auth.
 */

import { ApiResponse } from '../types/api';

// Interfaces para tipagem
interface LoginResponse {
  token?: string;
  refreshToken?: string;
  refresh_token?: string;
  expires_at?: string;
  user?: any;
  sessionId?: string;
}

// Configuração centralizada
const CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    SESSION_ID: 'session_id',
    EXPIRES_AT: 'auth_expires_at'
  }
} as const;

// Classe de erro customizada
export class UnifiedApiError extends Error {
  public status: number;
  public errors?: string[];

  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.name = 'UnifiedApiError';
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
  skipAuth?: boolean;
  timeout?: number;
}

class UnifiedApiClient {
  private refreshPromise: Promise<void> | null = null;

  /**
   * Verifica se está executando no browser
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Obtém token de autenticação (prioriza localStorage, fallback para cookies)
   */
  getAuthToken(): string | null {
    if (!this.isBrowser()) return null;

    // Prioridade 1: localStorage
    try {
      const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        console.log('🔑 Token encontrado no localStorage');
        return token;
      }
    } catch (error) {
      console.warn('⚠️ Erro ao acessar localStorage:', error);
    }

    // Prioridade 2: Cookies (fallback)
    try {
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${CONFIG.STORAGE_KEYS.AUTH_TOKEN}=`))
        ?.split('=')[1];
      
      if (cookieToken) {
        console.log('🔑 Token encontrado nos cookies');
        return cookieToken;
      }
    } catch (error) {
      console.warn('⚠️ Erro ao acessar cookies:', error);
    }

    console.log('❌ Token não encontrado');
    return null;
  }

  /**
   * Salva token de autenticação
   */
  setAuthToken(token: string, refreshToken?: string, expiresAt?: string): void {
    if (!this.isBrowser()) return;

    try {
      // Salvar no localStorage
      localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
      
      if (refreshToken) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
      
      if (expiresAt) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.EXPIRES_AT, expiresAt);
      }

      console.log('✅ Token salvo no localStorage');
    } catch (error) {
      console.error('❌ Erro ao salvar token:', error);
    }
  }

  /**
   * Remove todos os dados de autenticação
   */
  clearAuth(): void {
    if (!this.isBrowser()) return;

    try {
      // Limpar localStorage
      Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });

      // Limpar cookies
      const cookiesToClear = Object.values(CONFIG.STORAGE_KEYS);
      cookiesToClear.forEach(key => {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      console.log('✅ Dados de autenticação limpos');
    } catch (error) {
      console.error('❌ Erro ao limpar auth:', error);
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    if (!token) return false;

    // Verificar expiração se disponível
    try {
      const expiresAt = localStorage.getItem(CONFIG.STORAGE_KEYS.EXPIRES_AT);
      if (expiresAt) {
        const expiration = new Date(expiresAt);
        const now = new Date();
        if (expiration <= now) {
          console.log('⏰ Token expirado');
          this.clearAuth();
          return false;
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao verificar expiração:', error);
    }

    return true;
  }

  /**
   * Constrói URL completa
   */
  private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
    // Garantir que endpoint não comece com /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = new URL(`${CONFIG.API_BASE_URL}/${cleanEndpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  }

  /**
   * Prepara headers da requisição
   */
  private prepareHeaders(customHeaders?: Record<string, string>, includeAuth: boolean = true): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    // Incluir Authorization header se necessário
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Header Authorization incluído');
      } else {
        console.log('⚠️ Token não disponível para Authorization header');
      }
    }

    return headers;
  }

  /**
   * Faz requisição HTTP
   */
  async makeRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers: customHeaders,
      body,
      params,
      skipAuth = false,
      timeout = 30000
    } = options;

    try {
      const url = this.buildURL(endpoint, params);
      const headers = this.prepareHeaders(customHeaders, !skipAuth);

      // Remover Content-Type para FormData
      if (body instanceof FormData) {
        delete headers['Content-Type'];
      }

      const requestOptions: RequestInit = {
        method,
        headers,
        body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
      };

      console.log(`🌐 ${method} ${url}`);
      console.log(`📨 Headers:`, headers);

      // Implementar timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`📊 Status: ${response.status}`);

      // Parse da resposta
      let responseData: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Verificar se a resposta foi bem-sucedida
      if (!response.ok) {
        throw new UnifiedApiError(
          responseData.message || responseData || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          responseData.errors
        );
      }

      // Retornar resposta no formato padronizado
      const apiResponse: ApiResponse<T> = {
        success: true,
        data: responseData.data || responseData,
        message: responseData.message
      };

      return apiResponse;

    } catch (error) {
      if (error instanceof UnifiedApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new UnifiedApiError('Request timeout', 408);
        }
        throw new UnifiedApiError(error.message, 0);
      }

      throw new UnifiedApiError('Unknown error occurred', 0);
    }
  }

  /**
   * Métodos HTTP convenientes
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, body?: any, skipAuth?: boolean): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'POST', body, skipAuth });
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
   * Métodos de autenticação
   */
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      console.log(`🔐 Fazendo login para: ${email}`);
      
      const response = await this.post<LoginResponse>('/api/auth/login', { email, password }, true); // skipAuth = true

      if (response.success && response.data) {
        const loginData = response.data;
        const { token, refreshToken, refresh_token, expires_at, user } = loginData;
        
        // Salvar dados de autenticação (refreshToken pode vir como refresh_token)
        if (token) {
          this.setAuthToken(token, refreshToken || refresh_token, expires_at);
        }
        
        if (user) {
          localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        }

        console.log('✅ Login bem-sucedido e dados salvos');
      }

      return response;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Tentar fazer logout no servidor (se possível)
      await this.post('/api/auth/logout');
    } catch (error) {
      console.warn('⚠️ Erro ao fazer logout no servidor:', error);
    } finally {
      // Sempre limpar dados locais
      this.clearAuth();
      console.log('✅ Logout realizado');
    }
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

    return this.makeRequest<T>(endpoint, { method: 'POST', body: formData });
  }
}

// Instância singleton
export const unifiedApi = new UnifiedApiClient();

// Função helper para tratamento de erros
export const handleApiError = (error: unknown): string => {
  if (error instanceof UnifiedApiError) {
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
  return error instanceof UnifiedApiError && (error.status === 401 || error.status === 403);
};

export default unifiedApi; 