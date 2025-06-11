import {User, UserEssentials, Permission, UserRole} from '../types/auth';
import {getSession, signOut} from 'next-auth/react';

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

// Configuration constants
const AUTH_CONFIG = {
  COOKIES: {
    AUTH_TOKEN: 'auth_token',
    SESSION_ID: 'session_id',
    USER_DATA: 'user_data'
  },
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER: 'user'
  },
  DEFAULT_COOKIE_DAYS: 7
} as const;

// Cookie management utilities
class CookieManager {
  static set(name: string, value: string, days: number = AUTH_CONFIG.DEFAULT_COOKIE_DAYS): void {
    if (typeof window === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  static remove(name: string): void {
    if (typeof window === 'undefined') return;
    
    const domains = [
      '', // Current domain
      window.location.hostname,
      `.${window.location.hostname}`
    ];

    const paths = ['/', ''];

    // Try removing cookie with different domain and path combinations
    domains.forEach(domain => {
      paths.forEach(path => {
        const domainPart = domain ? `;domain=${domain}` : '';
        const pathPart = path ? `;path=${path}` : '';
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT${pathPart}${domainPart}`;
      });
    });
  }

  static clearAll(): void {
    if (typeof window === 'undefined') return;

    // Get all cookies
    const cookies = document.cookie.split(';');
    
    // Remove each cookie
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      if (name) {
        this.remove(name);
      }
    });
  }

  static clearAuthCookies(): void {
    Object.values(AUTH_CONFIG.COOKIES).forEach(cookieName => {
      this.remove(cookieName);
    });
  }
}

// Local storage utilities
class StorageManager {
  static get(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting localStorage item ${key}:`, error);
      return null;
    }
  }

  static set(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting localStorage item ${key}:`, error);
    }
  }

  static remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage item ${key}:`, error);
    }
  }

  static clearAuthData(): void {
    Object.values(AUTH_CONFIG.STORAGE_KEYS).forEach(key => {
      this.remove(key);
    });
  }
}

// User management functions - Backend API integration
export const listUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch('/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  }
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to update user');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Extrai apenas os campos essenciais do usuário para autenticação
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

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return false;
      }
      throw new Error('Failed to delete user');
    }

    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Authentication functions
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao fazer login');
    }

    // Extrair apenas os campos essenciais do usuário
    const userEssentials = data.user ? extractUserEssentials(data.user) : undefined;
    
    // Armazenar dados do usuário no localStorage para acesso rápido
    if (userEssentials) {
      StorageManager.set(AUTH_CONFIG.STORAGE_KEYS.USER, JSON.stringify(userEssentials));
      if (data.token) {
        StorageManager.set(AUTH_CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.token);
      }
    }

    return {
      success: true,
      user: userEssentials,
      token: data.token,
      expiresAt: data.expiresAt
    };
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

export const register = async (
    name: string,
    email: string,
    password: string,
    type: 'student' | 'teacher'
): Promise<RegisterResponse> => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role: type
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao registrar usuário');
    }

    // Extrair apenas os campos essenciais do usuário
    const userEssentials = data.user ? extractUserEssentials(data.user) : undefined;
    
    // Armazenar dados do usuário no localStorage para acesso rápido
    if (userEssentials) {
      StorageManager.set(AUTH_CONFIG.STORAGE_KEYS.USER, JSON.stringify(userEssentials));
      if (data.token) {
        StorageManager.set(AUTH_CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.token);
      }
    }

    return {
      success: true,
      user: userEssentials,
      token: data.token,
      expiresAt: data.expiresAt,
      message: data.message,
    };
  } catch (error) {
    console.error('Erro no registro:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<UserEssentials | null> => {
  // First try local storage to avoid triggering NextAuth session calls
  const userStr = StorageManager.get(AUTH_CONFIG.STORAGE_KEYS.USER);
  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      // Garantir que estamos retornando apenas os campos essenciais
      if (userData.id && userData.email) {
        return {
          id: userData.id,
          email: userData.email,
          name: userData.name || '',
          role: (userData.role as UserRole) || 'student',
          permissions: (userData.permissions as Permission[]) || []
        };
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      // Clear invalid data
      StorageManager.remove(AUTH_CONFIG.STORAGE_KEYS.USER);
    }
  }

  // Only try NextAuth session as fallback and avoid infinite loops
  try {
    const session = await getSession();
    if (session?.user) {
      const userEssentials: UserEssentials = {
        id: Math.random().toString(36).substring(2, 11), // Generate random ID for Google users
        name: session.user.name || '',
        email: session.user.email || '',
        role: 'teacher' as UserRole,
        permissions: []
      };
      
      // Store in localStorage for future calls
      StorageManager.set(AUTH_CONFIG.STORAGE_KEYS.USER, JSON.stringify(userEssentials));
      
      return userEssentials;
    }
  } catch (error) {
    console.error('Error getting NextAuth session:', error);
  }

  return null;
};

export const logout = async (): Promise<void> => {
  console.log('Iniciando processo de logout...');
  
  try {
    // 1. Chamar API de logout
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Erro na resposta do logout:', response.status);
    }
    
    // 2. Sign out from NextAuth (se ainda estiver usando)
    try {
      console.log('Fazendo logout do NextAuth...');
      await signOut({ redirect: false });
    } catch (error) {
      console.error('Erro ao fazer logout do NextAuth:', error);
    }
    
    // 3. Clear local storage
    console.log('Limpando localStorage...');
    StorageManager.clearAuthData();
    
    // 4. Clear authentication cookies (fallback)
    console.log('Limpando cookies de autenticação (fallback)...');
    CookieManager.clearAuthCookies();
    
    // 5. Small delay to ensure all operations complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('Logout concluído com sucesso');
  } catch (error) {
    console.error('Erro durante logout:', error);
    
    // Fallback: force clear everything even if some operations failed
    try {
      StorageManager.clearAuthData();
      CookieManager.clearAuthCookies();
    } catch (fallbackError) {
      console.error('Erro no fallback de logout:', fallbackError);
    }
    
    throw error;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    // Primeiro verificar NextAuth
    const session = await getSession();
    if (session) return true;

    // Depois verificar token local
    const token = StorageManager.get(AUTH_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (!token && typeof window !== 'undefined') {
      // Verificar cookies como fallback
      const hasCookie = document.cookie.includes(`${AUTH_CONFIG.COOKIES.AUTH_TOKEN}=`);
      if (!hasCookie) return false;
    }

    // Validar token com o backend
    const response = await fetch('/api/auth/validate', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.valid;
    }

    return false;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
};
