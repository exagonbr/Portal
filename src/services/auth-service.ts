/**
 * Serviço de Autenticação Simplificado
 * Usa o cliente API unificado
 */

import { User, UserEssentials, Permission, UserRole } from '@/types/auth';
import { apiClient, handleApiError, ApiClientError } from '@/lib/api-client';

export interface LoginResponse {
  success: boolean;
  user?: UserEssentials;
  token?: string;
  expiresAt?: number;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: UserEssentials;
  token?: string;
  expiresAt?: number;
  message?: string;
}

// Configuração local
const AUTH_STORAGE = {
  TOKEN: 'auth_token',
  USER: 'user',
  EXPIRES_AT: 'auth_expires_at',
} as const;

// Utilitários de armazenamento
class AuthStorage {
  static get(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  static set(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
    }
  }

  static remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erro ao remover ${key}:`, error);
    }
  }

  static clear(): void {
    Object.values(AUTH_STORAGE).forEach(key => {
      this.remove(key);
    });
  }
}

/**
 * Extrai campos essenciais do usuário
 */
export const extractUserEssentials = (user: User): UserEssentials => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions || []
  };
};

/**
 * Login do usuário
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<{
      user: User;
      token: string;
      expiresAt?: number;
      redirectTo?: string;
    }>('/auth/login', { email, password });

    if (response.success && response.data) {
      const userEssentials = extractUserEssentials(response.data.user);
      
      // Salvar dados localmente
      AuthStorage.set(AUTH_STORAGE.USER, JSON.stringify(userEssentials));
      
      if (response.data.token) {
        AuthStorage.set(AUTH_STORAGE.TOKEN, response.data.token);
        apiClient.setAuthToken(response.data.token);
      }
      
      // Configurar dados do usuário no cookie para o middleware
      apiClient.setUserData(userEssentials);
      
      if (response.data.expiresAt) {
        AuthStorage.set(AUTH_STORAGE.EXPIRES_AT, String(response.data.expiresAt));
      }

      const loginResponse = {
        success: true,
        user: userEssentials,
        token: response.data.token,
        expiresAt: response.data.expiresAt,
      };
      
      return loginResponse;
    }

    return {
      success: false,
      message: response.message || 'Erro ao fazer login',
    };
  } catch (error) {
    console.error('❌ Erro no login:', error);
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Registro de usuário
 */
export const register = async (
  name: string,
  email: string,
  password: string,
  type: 'student' | 'teacher'
): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<{
      user: User;
      token: string;
      expiresAt?: number;
    }>('/auth/register', {
      name,
      email,
      password,
      role: type,
    });

    if (response.success && response.data) {
      const userEssentials = extractUserEssentials(response.data.user);
      
      // Salvar dados localmente
      AuthStorage.set(AUTH_STORAGE.USER, JSON.stringify(userEssentials));
      if (response.data.token) {
        AuthStorage.set(AUTH_STORAGE.TOKEN, response.data.token);
        apiClient.setAuthToken(response.data.token);
      }
      if (response.data.expiresAt) {
        AuthStorage.set(AUTH_STORAGE.EXPIRES_AT, String(response.data.expiresAt));
      }

      return {
        success: true,
        user: userEssentials,
        token: response.data.token,
        expiresAt: response.data.expiresAt,
        message: response.message,
      };
    }

    return {
      success: false,
      message: response.message || 'Erro ao registrar usuário',
    };
  } catch (error) {
    console.error('Erro no registro:', error);
    return {
      success: false,
      message: handleApiError(error),
    };
  }
};

/**
 * Obtém o usuário atual
 */
export const getCurrentUser = (): UserEssentials | null => {
  const userStr = AuthStorage.get(AUTH_STORAGE.USER);
  
  if (!userStr) {
    return null;
  }

  try {
    const userData = JSON.parse(userStr);
    
    if (userData.id && userData.email) {
      const userEssentials = {
        id: userData.id,
        email: userData.email,
        name: userData.name || '',
        role: (userData.role as UserRole) || 'student',
        permissions: (userData.permissions as Permission[]) || []
      };
      
      return userEssentials;
    }
  } catch (error) {
    console.error('❌ Erro ao parsear dados do usuário:', error);
    AuthStorage.remove(AUTH_STORAGE.USER);
  }

  return null;
};

/**
 * Logout do usuário
 */
export const logout = async (): Promise<void> => {
  try {
    // Tentar fazer logout no backend
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.warn('Erro ao fazer logout no backend:', error);
    // Continuar mesmo se falhar
  }

  // Limpar dados locais
  AuthStorage.clear();
  apiClient.clearAuth();

  // Redirecionar para login se estiver no browser
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

/**
 * Verifica se o usuário está autenticado
 */
export const isAuthenticated = (): boolean => {
  const user = getCurrentUser();
  const token = AuthStorage.get(AUTH_STORAGE.TOKEN);
  
  if (!user || !token) return false;

  // Verificar se o token expirou
  const expiresAt = AuthStorage.get(AUTH_STORAGE.EXPIRES_AT);
  if (expiresAt) {
    const expirationTime = parseInt(expiresAt, 10);
    if (Date.now() > expirationTime) {
      AuthStorage.clear();
      return false;
    }
  }

  return true;
};

/**
 * Verifica se o token está expirado
 */
export const isTokenExpired = (): boolean => {
  const expiresAt = AuthStorage.get(AUTH_STORAGE.EXPIRES_AT);
  if (!expiresAt) return true;

  const expirationTime = parseInt(expiresAt, 10);
  return Date.now() > expirationTime;
};

/**
 * Renova o token de autenticação
 */
export const refreshToken = async (): Promise<boolean> => {
  try {
    const response = await apiClient.post<{
      token: string;
      expiresAt?: number;
    }>('/auth/refresh');

    if (response.success && response.data) {
      AuthStorage.set(AUTH_STORAGE.TOKEN, response.data.token);
      apiClient.setAuthToken(response.data.token);
      
      if (response.data.expiresAt) {
        AuthStorage.set(AUTH_STORAGE.EXPIRES_AT, String(response.data.expiresAt));
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return false;
  }
};

// Gerenciamento de usuários (para admins)
export const listUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get<User[]>('/users');
    return response.data || [];
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    throw new Error(handleApiError(error));
  }
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  try {
    const response = await apiClient.post<User>('/users', userData);
    if (!response.data) {
      throw new Error('Resposta inválida do servidor');
    }
    return response.data;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw new Error(handleApiError(error));
  }
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
  try {
    const response = await apiClient.put<User>(`/users/${id}`, userData);
    return response.data || null;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return null;
    }
    console.error('Erro ao atualizar usuário:', error);
    throw new Error(handleApiError(error));
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/users/${id}`);
    return true;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return false;
    }
    console.error('Erro ao deletar usuário:', error);
    throw new Error(handleApiError(error));
  }
}; 