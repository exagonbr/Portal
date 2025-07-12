import { apiService } from './api';
import axios, { AxiosError } from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions?: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  token: string;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

export interface NetworkError extends Error {
  isNetworkError: boolean;
  isTimeoutError: boolean;
}

class AuthServiceClass {
  private static instance: AuthServiceClass;
  private readonly tokenKey = 'token';
  private readonly refreshTokenKey = 'refreshToken';
  private readonly userKey = 'user';
  private readonly maxRetries = 2;
  private readonly timeout = 30000; // 30 seconds

  static getInstance(): AuthServiceClass {
    if (!AuthServiceClass.instance) {
      AuthServiceClass.instance = new AuthServiceClass();
    }
    return AuthServiceClass.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    let lastError: any;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await apiService.post<AuthResponse>('/auth/login', credentials, {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response) {
          throw new Error('Resposta vazia do servidor');
        }
        
        if (response.token) {
          this.setToken(response.token);
          if (response.refreshToken) {
            this.setRefreshToken(response.refreshToken);
          }
          this.setUser(response.user);
          return response;
        } else {
          throw new Error('Token não encontrado na resposta');
        }
      } catch (error) {
        lastError = error;
        if (this.isRetryableError(error)) {
          if (attempt < this.maxRetries) {
            await this.delay(Math.pow(2, attempt) * 1000); // exponential backoff
            continue;
          }
        }
        break;
      }
    }
    
    throw this.handleError(lastError);
  }

  async logout(): Promise<void> {
    try {
      // Tenta fazer logout no servidor
      await apiService.post<void>('/auth/logout');
    } catch (error) {
      console.warn('Erro ao fazer logout no servidor:', error);
    } finally {
      // Limpa dados locais mesmo se houver erro no servidor
      this.clearAuth();
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
      }

      const response = await apiService.post<RefreshTokenResponse>('/auth/refresh-token', {
        refreshToken
      });

      if (response.token) {
        this.setToken(response.token);
        return response.token;
      }
      return null;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      this.clearAuth();
      throw this.handleError(error);
    }
  }

  getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem(this.tokenKey) : null;
  }

  getRefreshToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem(this.refreshTokenKey) : null;
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.userKey);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.refreshTokenKey, token);
    }
  }

  private setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  private isRetryableError(error: any): boolean {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return (
        !axiosError.response || // network error
        axiosError.code === 'ECONNABORTED' || // timeout
        (axiosError.response && (
          axiosError.response.status === 408 || // request timeout
          axiosError.response.status === 429 || // too many requests
          axiosError.response.status >= 500 // server errors
        ))
      );
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      
      if (!axiosError.response) {
        const networkError = new Error('Erro de conexão com o servidor') as NetworkError;
        networkError.isNetworkError = true;
        networkError.isTimeoutError = axiosError.code === 'ECONNABORTED';
        return networkError;
      }

      if (axiosError.response?.data?.message) {
        return new Error(axiosError.response.data.message);
      }

      if (axiosError.response?.status === 401) {
        return new Error('Credenciais inválidas');
      }

      if (axiosError.response?.status === 429) {
        return new Error('Muitas tentativas. Por favor, aguarde um momento.');
      }

      if (axiosError.response?.status >= 500) {
        return new Error('Erro no servidor. Por favor, tente novamente mais tarde.');
      }
    }

    return new Error('Erro ao processar a requisição');
  }
}

export const AuthService = AuthServiceClass.getInstance();
export default AuthService;