import {User, UserEssentials, Permission, UserRole} from '../types/auth';
import { apiClient, handleApiError } from '@/lib/api-client';
import { API_CONFIG, TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_EXPIRY_KEY } from '@/config/constants';
// REMOVIDO: NextAuth imports para evitar erros 404 e loops
// import {getSession, signOut} from 'next-auth/react';

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

// Configuration constants - usando configuração centralizada
const AUTH_CONFIG = {
  API_URL: API_CONFIG.BASE_URL,
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api',
  COOKIES: {
    AUTH_TOKEN: 'auth_token',
    SESSION_ID: 'session_id',
    USER_DATA: 'user_data',
    REFRESH_TOKEN: 'refresh_token'
  },
  STORAGE_KEYS: {
    AUTH_TOKEN: TOKEN_KEY,
    USER: 'user',
    AUTH_EXPIRES_AT: TOKEN_EXPIRY_KEY
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
    const response = await fetch(`${AUTH_CONFIG.API_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
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
    const response = await fetch(`${AUTH_CONFIG.API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include',
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
    const response = await fetch(`${AUTH_CONFIG.API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include',
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
    const response = await fetch(`${AUTH_CONFIG.API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
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
    // Verificar se estamos no ambiente do navegador
    if (typeof window === 'undefined') {
      throw new Error('Login deve ser executado no navegador');
    }

    console.log('Iniciando processo de login...');
    
    // Verificar se há muitas tentativas recentes
    const lastAttemptKey = 'last_login_attempt';
    const attemptCountKey = 'login_attempt_count';
    const now = Date.now();
    const lastAttempt = localStorage.getItem(lastAttemptKey);
    const attemptCount = parseInt(localStorage.getItem(attemptCountKey) || '0');
    
    // Reset contador se passou mais de 1 minuto
    if (!lastAttempt || (now - parseInt(lastAttempt)) > 60000) {
      localStorage.setItem(attemptCountKey, '1');
    } else {
      const newCount = attemptCount + 1;
      localStorage.setItem(attemptCountKey, newCount.toString());
      
      // Se muitas tentativas em pouco tempo, aguardar
      if (newCount > 5) {
        const waitTime = Math.min(30, newCount * 2); // Máximo 30 segundos
        throw new Error(`Muitas tentativas de login. Aguarde ${waitTime} segundos antes de tentar novamente.`);
      }
    }
    
    localStorage.setItem(lastAttemptKey, now.toString());
    
    // Usar apenas uma URL para simplificar
    const loginUrl = `${AUTH_CONFIG.API_URL}/auth/login`;
    console.log(`Fazendo login em: ${loginUrl}`);
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    console.log('Resposta recebida, status:', response.status);
    
    // Tratamento especial para erro 429 (Too Many Requests)
    if (response.status === 429) {
      try {
        const errorData = await response.json();
        console.warn('🚨 Erro 429 recebido:', errorData);
        
        // Se foi detectado um loop pelo servidor
        if (errorData.isLoop) {
          console.error('🚨 Loop de requisições detectado pelo servidor!');
          
          // Limpar dados de tentativas para evitar mais loops
          localStorage.removeItem(lastAttemptKey);
          localStorage.removeItem(attemptCountKey);
          
          // Tentar aplicar correção PWA se disponível
          try {
            const { emergencyPWAFix } = await import('../utils/pwa-fix');
            await emergencyPWAFix();
          } catch (pwaError) {
            console.warn('⚠️ Não foi possível aplicar correção PWA:', pwaError);
          }
          
          throw new Error('Loop de requisições detectado. A página será recarregada automaticamente para corrigir o problema.');
        }
        
        // Erro 429 normal
        const retryAfter = errorData.retryAfter || 60;
        throw new Error(`${errorData.message || 'Muitas tentativas de login'}. Aguarde ${retryAfter} segundos.`);
        
      } catch (jsonError) {
        // Se não conseguir ler JSON, usar mensagem padrão
        throw new Error('Muitas tentativas de login. Aguarde alguns segundos antes de tentar novamente.');
      }
    }
    
    const data = await response.json();
    console.log('Dados da resposta:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao fazer login');
    }

    // Limpar contadores de tentativa em caso de sucesso
    localStorage.removeItem(lastAttemptKey);
    localStorage.removeItem(attemptCountKey);

    // Extrair apenas os campos essenciais do usuário
    const userEssentials = data.user ? extractUserEssentials(data.user) : undefined;
    
    // Armazenar dados do usuário no localStorage para acesso rápido
    if (userEssentials) {
      StorageManager.set(AUTH_CONFIG.STORAGE_KEYS.USER, JSON.stringify(userEssentials));
      if (data.token) {
        StorageManager.set(AUTH_CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.token);
      }
      if (data.expiresAt) {
        StorageManager.set(AUTH_CONFIG.STORAGE_KEYS.AUTH_EXPIRES_AT, String(data.expiresAt));
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
    
    // Se o erro menciona loop, não incrementar contador
    if (error instanceof Error && error.message.includes('Loop de requisições')) {
      throw error;
    }
    
    // Para outros erros, fornecer mensagem mais detalhada
    if (error instanceof Error) {
      throw new Error(`Erro ao fazer login: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao fazer login');
    }
  }
};

export const register = async (
    name: string,
    email: string,
    password: string,
    type: 'student' | 'teacher'
): Promise<RegisterResponse> => {
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}/auth/register`, {
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
      credentials: 'include',
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
      if (data.expiresAt) {
        StorageManager.set(AUTH_CONFIG.STORAGE_KEYS.AUTH_EXPIRES_AT, String(data.expiresAt));
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

  // REMOVIDO: NextAuth session check para evitar loops e erros 404
  // O sistema agora usa apenas autenticação customizada
  
  return null;
};

export const logout = async (): Promise<void> => {
  console.log('Iniciando processo de logout...');
  
  try {
    // 1. Chamar API de logout (com tratamento de erro mais robusto)
    try {
      const response = await fetch(`${AUTH_CONFIG.API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.warn('Erro na resposta do logout:', response.status);
        // Continuar mesmo se o logout da API falhar
      }
    } catch (apiError) {
      console.warn('Erro ao chamar API de logout:', apiError);
      // Continuar mesmo se a API não responder
    }
    
    // 2. REMOVIDO: NextAuth signOut para evitar erros 404
    // O sistema agora usa apenas autenticação customizada
    
    // 3. Clear local storage
    console.log('Limpando localStorage...');
    StorageManager.clearAuthData();
    
    // 4. Clear authentication cookies (fallback)
    console.log('Limpando cookies de autenticação...');
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
    
    // Não fazer throw do erro para não quebrar o fluxo de logout
    console.warn('Logout completado com alguns erros, mas dados locais foram limpos');
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    // REMOVIDO: NextAuth check para evitar loops
    // Verificar apenas token local e cookies
    
    const token = StorageManager.get(AUTH_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (!token && typeof window !== 'undefined') {
      // Verificar cookies como fallback
      const hasCookie = document.cookie.includes(`${AUTH_CONFIG.COOKIES.AUTH_TOKEN}=`);
      if (!hasCookie) return false;
    }
    
    // Se não temos token, não estamos autenticados
    if (!token) return false;

    // Validar token com o backend (opcional, pode ser removido para evitar chamadas desnecessárias)
    try {
      const response = await fetch(`${AUTH_CONFIG.API_URL}/auth/validate-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return data.valid;
      }
    } catch (validationError) {
      console.warn('Erro na validação do token, assumindo válido baseado na presença local:', validationError);
      // Se a validação falhar, assumir que o token é válido se existir localmente
      return true;
    }

    return false;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
};
export const isTokenExpired = (): boolean => {
  if (typeof window === 'undefined') {
    return true; // Assume expired on server-side
  }

  const expiresAtStr = StorageManager.get(AUTH_CONFIG.STORAGE_KEYS.AUTH_EXPIRES_AT);
  if (!expiresAtStr) {
    // If there's no expiration date, but there is a token, we can't be sure.
    // For safety, let's check if a token exists. If not, it's "expired".
    return !StorageManager.get(AUTH_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  }

  try {
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt)) {
      return true; // Invalid data
    }

    // Check if expiresAt is in seconds or milliseconds.
    // A common way is to check its magnitude. Timestamps in seconds are usually 10 digits, ms are 13.
    const expirationTimeInMs = expiresAt > 1000000000000 ? expiresAt : expiresAt * 1000;

    return Date.now() >= expirationTimeInMs;
  } catch (error) {
    console.error('Error parsing token expiration date:', error);
    return true; // Assume expired if parsing fails
  }
};

/**
 * Flag para controlar tentativas de refresh e evitar loops
 */
let isRefreshingToken = false;
let refreshPromise: Promise<boolean> | null = null;
let lastRefreshAttempt = 0;
const REFRESH_THROTTLE_MS = 5000; // 5 segundos entre tentativas

/**
 * Renova o token de autenticação
 */
export const refreshToken = async (): Promise<boolean> => {
  // Evitar chamadas simultâneas ou muito frequentes
  const now = Date.now();
  if (isRefreshingToken) {
    console.log('Refresh já em andamento, aguardando...');
    if (refreshPromise) {
      return refreshPromise;
    }
    return false;
  }
  
  // Limitar frequência de tentativas
  if (now - lastRefreshAttempt < REFRESH_THROTTLE_MS) {
    console.log(`Muitas tentativas de refresh em curto período (${now - lastRefreshAttempt}ms), aguardando...`);
    return false;
  }

  // Verificar se estamos em uma rota que pode causar loops
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isNotificationRoute = currentPath.includes('/notifications');
  
  // Se estivermos na rota de notificações e já tentamos refresh recentemente, evitar
  if (isNotificationRoute && now - lastRefreshAttempt < 30000) { // 30 segundos para notificações
    console.log('Evitando refresh token em rota de notificações para prevenir loops');
    return true; // Retornar true para não forçar logout
  }
  
  try {
    console.log('Iniciando refresh do token...');
    isRefreshingToken = true;
    lastRefreshAttempt = now;
    
    // Obter o refresh token do cookie
    let refreshToken = null;
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';');
      const refreshTokenCookie = cookies.find(cookie => cookie.trim().startsWith(`${AUTH_CONFIG.COOKIES.REFRESH_TOKEN}=`));
      if (refreshTokenCookie) {
        refreshToken = refreshTokenCookie.split('=')[1];
      }
    }
    
    // Se não temos refresh token, não podemos renovar o token
    if (!refreshToken) {
      console.warn('Refresh token não encontrado, não é possível renovar token');
      
      // Se estivermos na rota de notificações, não falhar imediatamente
      if (isNotificationRoute) {
        console.log('Mantendo sessão atual para rota de notificações');
        return true;
      }
      
      return false;
    }
    
    refreshPromise = new Promise(async (resolve) => {
      try {
        // Determinar dinamicamente a porta correta
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        
        // Fazer requisição para o endpoint de refresh
        const response = await fetch(`${baseUrl}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            refreshToken
          }),
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (!response.ok) {
          console.error('Erro na resposta do refresh token:', response.status);
          
          // Se estivermos na rota de notificações, ser mais tolerante a erros
          if (isNotificationRoute && response.status !== 401) {
            console.log('Mantendo sessão atual para rota de notificações devido a erro temporário');
            resolve(true);
            return;
          }
          
          resolve(false);
          return;
        }
        
        const data = await response.json();
        
        if (!data.success) {
          console.error('Falha no refresh token:', data.message);
          
          // Se estivermos na rota de notificações, ser mais tolerante
          if (isNotificationRoute) {
            console.log('Mantendo sessão atual para rota de notificações');
            resolve(true);
            return;
          }
          
          resolve(false);
          return;
        }
        
        // Atualizar dados no localStorage
        if (data.data?.token) {
          StorageManager.set(AUTH_CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.data.token);
          
          if (data.data.expires_at) {
            const expiresAtMs = typeof data.data.expires_at === 'string' 
              ? Date.parse(data.data.expires_at) 
              : data.data.expires_at;
            
            StorageManager.set(AUTH_CONFIG.STORAGE_KEYS.AUTH_EXPIRES_AT, String(expiresAtMs));
          }
        }
        
        console.log('Token renovado com sucesso');
        resolve(true);
      } catch (error) {
        console.error('Erro durante refresh do token:', error);
        
        // Se estivermos na rota de notificações e for erro de rede, ser tolerante
        if (isNotificationRoute && error instanceof Error && 
            (error.message.includes('fetch') || error.message.includes('network'))) {
          console.log('Mantendo sessão atual para rota de notificações devido a erro de rede');
          resolve(true);
          return;
        }
        
        resolve(false);
      }
    });
    
    return await refreshPromise;
  } catch (error) {
    console.error('Erro não tratado durante refresh:', error);
    
    // Se estivermos na rota de notificações, ser mais tolerante
    if (isNotificationRoute) {
      console.log('Mantendo sessão atual para rota de notificações devido a erro não tratado');
      return true;
    }
    
    return false;
  } finally {
    isRefreshingToken = false;
    refreshPromise = null;
  }
};

