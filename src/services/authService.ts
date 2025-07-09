import { apiGet, apiPost } from './apiService';

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

class AuthServiceClass {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiPost<AuthResponse>('/auth/login', credentials);
      
      // Salvar token no localStorage
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await apiPost('/auth/logout', {});
      
      // Limpar tokens do localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessToken');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiGet<User>('/auth/me');
      return response;
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      return null;
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
      }
      
      const response = await apiPost<AuthResponse>('/auth/refresh', { refreshToken });
      
      // Atualizar tokens
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      throw error;
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await apiPost<{ valid: boolean }>('/auth/validate', { token });
      return response.valid;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return false;
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
    return !!token;
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Buscar token em todas as possíveis chaves
    return (
      localStorage.getItem('accessToken') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('accessToken') ||
      sessionStorage.getItem('auth_token') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('authToken') ||
      null
    );
  }
}

export const authService = new AuthServiceClass(); 