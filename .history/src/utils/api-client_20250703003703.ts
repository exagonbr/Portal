import { getCookie, setCookie } from './cookies';
import { getCurrentToken } from './token-validator';

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  /**
   * Obtém o token de autenticação atual
   */
  private getAuthToken(): string | null {
    // Tentar primeiro do localStorage
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (localToken && localToken !== 'null' && localToken !== 'undefined') {
      return localToken;
    }

    // Fallback para cookies
    const cookieToken = getCookie('auth_token');
    if (cookieToken && cookieToken !== 'null' && cookieToken !== 'undefined') {
      return cookieToken;
    }

    return null;
  }

  /**
   * Obtém o refresh token
   */
  private getRefreshToken(): string | null {
    // Tentar primeiro do localStorage
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
    if (localToken && localToken !== 'null' && localToken !== 'undefined') {
      return localToken;
    }

    // Fallback para cookies
    const cookieToken = getCookie('refresh_token');
    if (cookieToken && cookieToken !== 'null' && cookieToken !== 'undefined') {
      return cookieToken;
    }

    return null;
  }

  /**
   * Salva os tokens de autenticação
   */
  private saveTokens(accessToken: string, refreshToken?: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
    }

    // Também salvar em cookies
    setCookie('auth_token', accessToken, { 
      expires: 7, // 7 dias
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    if (refreshToken) {
      setCookie('refresh_token', refreshToken, { 
        expires: 30, // 30 dias
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }
  }

  /**
   * Renova o token de autenticação
   */
  private async refreshAuthToken(): Promise<string | null> {
    // Se já está renovando, aguardar a promise existente
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.log('❌ [API-CLIENT] Sem refresh token disponível');
      return null;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        console.log('🔄 [API-CLIENT] Renovando token de autenticação...');
        
        const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const newAccessToken = data.accessToken || data.token;
          
          if (newAccessToken) {
            console.log('✅ [API-CLIENT] Token renovado com sucesso');
            this.saveTokens(newAccessToken, data.refreshToken);
            return newAccessToken;
          }
        }

        console.log('❌ [API-CLIENT] Falha ao renovar token:', response.status);
        return null;
      } catch (error) {
        console.error('❌ [API-CLIENT] Erro ao renovar token:', error);
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Limpa os tokens de autenticação
   */
  clearAuth() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
    
    // Limpar cookies também
    setCookie('auth_token', '', { expires: -1 });
    setCookie('refresh_token', '', { expires: -1 });
  }

  /**
   * Faz uma requisição para a API
   */
  async request<T = any>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { skipAuth = false, ...fetchOptions } = options;
    
    // Preparar headers
    const headers: Record<string, string> = {
      Authorization: 'Bearer ' + getCurrentToken(),
      'Content-Type': 'application/json',
    };

    // Copiar headers existentes se houver
    if (fetchOptions.headers) {
      const existingHeaders = fetchOptions.headers as Record<string, string>;
      Object.assign(headers, existingHeaders);
    }

    // Adicionar token de autenticação se não for para pular
    if (!skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // URL completa
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${this.baseUrl}${endpoint}`;

    try {
      console.log(`🚀 [API-CLIENT] ${fetchOptions.method || 'GET'} ${endpoint}`);
      
      let response = await fetch(url, {
        ...fetchOptions,
        headers: headers as HeadersInit,
        credentials: 'include',
      });

      // Se receber 401, tentar renovar token
      if (response.status === 401 && !skipAuth) {
        console.log('⚠️ [API-CLIENT] Recebido 401, tentando renovar token...');
        
        const newToken = await this.refreshAuthToken();
        if (newToken) {
          // Tentar novamente com novo token
          headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, {
            ...fetchOptions,
            headers: headers as HeadersInit,
            credentials: 'include',
          });
        } else {
          // Não conseguiu renovar, redirecionar para login
          console.log('❌ [API-CLIENT] Não foi possível renovar token, redirecionando para login...');
          this.clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          return {
            success: false,
            message: 'Sessão expirada',
            error: 'Authentication failed',
          };
        }
      }

      // Verificar se há novo token no header da resposta
      const newToken = response.headers.get('X-New-Token');
      if (newToken) {
        console.log('🔄 [API-CLIENT] Novo token recebido do servidor');
        this.saveTokens(newToken);
      }

      // Parse da resposta
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        console.log(`❌ [API-CLIENT] Erro ${response.status}:`, data);
        return {
          success: false,
          message: data?.message || `Erro ${response.status}`,
          error: data?.error || response.statusText,
          data: data?.data,
        };
      }

      console.log(`✅ [API-CLIENT] Sucesso:`, data);
      return {
        success: true,
        data: data?.data || data,
        message: data?.message,
      };

    } catch (error) {
      console.error('❌ [API-CLIENT] Erro na requisição:', error);
      return {
        success: false,
        message: 'Erro ao conectar com o servidor',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Métodos de conveniência
  async get<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Exportar instância única
export const apiClient = new ApiClient();

// Exportar também a classe para casos especiais
export { ApiClient };

// Funções de conveniência para uso direto
export const api = {
  get: <T = any>(endpoint: string, options?: ApiRequestOptions) => 
    apiClient.get<T>(endpoint, options),
  
  post: <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions) => 
    apiClient.post<T>(endpoint, data, options),
  
  put: <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions) => 
    apiClient.put<T>(endpoint, data, options),
  
  patch: <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions) => 
    apiClient.patch<T>(endpoint, data, options),
  
  delete: <T = any>(endpoint: string, options?: ApiRequestOptions) => 
    apiClient.delete<T>(endpoint, options),
  
  clearAuth: () => apiClient.clearAuth(),
};