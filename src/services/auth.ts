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
    SESSION_TOKEN: 'session_token',
    USER_DATA: 'user_data',
    SESSION_EXPIRES: 'session_expires'
  },
  STORAGE_KEYS: {
    USER: 'user_session',
    LAST_ACTIVITY: 'last_activity'
  },
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 horas em ms
  ACTIVITY_CHECK_INTERVAL: 5 * 60 * 1000 // 5 minutos em ms
} as const;

// Cookie management utilities - Simplificado para sessões
class SessionManager {
  static setCookie(name: string, value: string, maxAge: number = AUTH_CONFIG.SESSION_DURATION / 1000): void {
    if (typeof window === 'undefined') return;
    
    document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax;Secure=${window.location.protocol === 'https:'}`;
  }

  static getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    return null;
  }

  static removeCookie(name: string): void {
    if (typeof window === 'undefined') return;
    
    document.cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;SameSite=Lax`;
  }

  static clearSession(): void {
    Object.values(AUTH_CONFIG.COOKIES).forEach(cookieName => {
      this.removeCookie(cookieName);
    });
    
    // Limpar localStorage também
    Object.values(AUTH_CONFIG.STORAGE_KEYS).forEach(key => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    });
  }

  static setUserSession(user: UserEssentials): void {
    const sessionData = {
      user,
      timestamp: Date.now(),
      expiresAt: Date.now() + AUTH_CONFIG.SESSION_DURATION
    };

    // Salvar nos cookies
    this.setCookie(AUTH_CONFIG.COOKIES.USER_DATA, JSON.stringify(user));
    this.setCookie(AUTH_CONFIG.COOKIES.SESSION_EXPIRES, sessionData.expiresAt.toString());
    
    // Backup no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER, JSON.stringify(sessionData));
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    }
  }

  static getUserSession(): UserEssentials | null {
    try {
      // Primeiro tentar localStorage (mais confiável)
      if (typeof window !== 'undefined') {
        const sessionStr = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
        
        if (sessionStr) {
          const sessionData = JSON.parse(sessionStr);
          
          // Verificar se não expirou
          if (sessionData.expiresAt && Date.now() < sessionData.expiresAt) {
            this.updateActivity();
            return sessionData.user;
          } else {
            // Sessão expirada, limpar
            this.clearSession();
            return null;
          }
        }
      }

      // Fallback para cookies
      const userDataCookie = this.getCookie(AUTH_CONFIG.COOKIES.USER_DATA);
      const expiresAtCookie = this.getCookie(AUTH_CONFIG.COOKIES.SESSION_EXPIRES);
      
      if (userDataCookie && expiresAtCookie) {
        const expiresAt = parseInt(expiresAtCookie);
        
        // Verificar se não expirou
        if (Date.now() < expiresAt) {
          const userData = JSON.parse(userDataCookie);
          this.updateActivity(); // Atualizar atividade
          return userData;
        } else {
          // Sessão expirada, limpar
          this.clearSession();
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('❌ SessionManager: Erro ao recuperar sessão do usuário:', error);
      this.clearSession();
      return null;
    }
  }

  static updateActivity(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    }
  }

  static isSessionActive(): boolean {
    const user = this.getUserSession();
    return user !== null;
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

    const result = await response.json();
    
    // O backend retorna { success: true, data: {...} }
    if (result.success && result.data) {
      return result.data.users || result.data || [];
    }
    
    // Fallback para estrutura antiga
    return result.users || [];
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

    const result = await response.json();
    
    // O backend retorna { success: true, data: {...} }
    if (result.success && result.data) {
      return result.data.user || result.data;
    }
    
    // Fallback para estrutura antiga
    return result.user;
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

    const result = await response.json();
    
    // O backend retorna { success: true, data: {...} }
    if (result.success && result.data) {
      return result.data.user || result.data;
    }
    
    // Fallback para estrutura antiga
    return result.user;
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

    // Detectar se é dispositivo móvel
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
    console.log(`🔐 Iniciando processo de login (${isMobile ? 'MOBILE' : 'DESKTOP'})...`);
    
    const loginUrl = `${AUTH_CONFIG.API_URL}/auth/login`;
    console.log(`🔐 Fazendo login em: ${loginUrl}`);

    // Configuração de timeout e opções específicas para mobile
    const controller = new AbortController();
    const timeoutMs = isMobile ? 30000 : 20000; // 30s para mobile, 20s para desktop
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        // Configurações específicas para mobile
        credentials: 'same-origin', // Mudança de 'include' para 'same-origin' para melhor compatibilidade mobile
        cache: 'no-cache',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`🔐 Resposta recebida (${isMobile ? 'MOBILE' : 'DESKTOP'}), status:`, response.status);
      
      let result;
      try {
        result = await response.json();
        console.log('🔐 Dados da resposta:', result);
      } catch (jsonError) {
        console.error('❌ Erro ao parsear JSON da resposta:', jsonError);
        throw new Error('Resposta inválida do servidor');
      }
      
      if (!response.ok) {
        throw new Error(result.message || 'Erro ao fazer login');
      }

      // O backend retorna { success: true, data: {...} }
      let userData;
      if (result.success && result.data) {
        userData = result.data.user || result.data;
      } else {
        // Fallback para estrutura antiga
        userData = result.user;
      }

      // Extrair apenas os campos essenciais do usuário
      const userEssentials = userData ? extractUserEssentials(userData) : undefined;
      
      // Armazenar sessão usando cookies
      if (userEssentials) {
        SessionManager.setUserSession(userEssentials);
        console.log('✅ Sessão do usuário criada com sucesso');
      }

      return {
        success: true,
        user: userEssentials,
        token: result.data?.token || result.token,
        expiresAt: result.data?.expiresAt || result.expiresAt
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Tratamento específico de erros para mobile
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          console.error(`❌ Timeout no login (${timeoutMs}ms)`);
          throw new Error(`Tempo limite excedido. Verifique sua conexão e tente novamente.`);
        }
        
        if (fetchError.message.includes('fetch') || fetchError.message.includes('network')) {
          console.error('❌ Erro de rede no login:', fetchError);
          throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
        }
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('❌ Erro no login:', error);
    
    if (error instanceof Error) {
      throw new Error(error.message);
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
    // Detectar dispositivo móvel
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
    
    // Configuração de timeout específica para mobile
    const controller = new AbortController();
    const timeoutMs = isMobile ? 30000 : 20000; // 30s para mobile, 20s para desktop
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${AUTH_CONFIG.API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: type
        }),
        credentials: 'same-origin', // Melhor compatibilidade mobile
        cache: 'no-cache',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('❌ Erro ao parsear JSON da resposta de registro:', jsonError);
        throw new Error('Resposta inválida do servidor');
      }

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao registrar usuário');
      }

      // O backend retorna { success: true, data: {...} }
      let userData;
      if (result.success && result.data) {
        userData = result.data.user || result.data;
      } else {
        // Fallback para estrutura antiga
        userData = result.user;
      }

      // Extrair apenas os campos essenciais do usuário
      const userEssentials = userData ? extractUserEssentials(userData) : undefined;
      
      // Armazenar sessão usando cookies
      if (userEssentials) {
        SessionManager.setUserSession(userEssentials);
        console.log('✅ Sessão do usuário criada após registro');
      }

      return {
        success: true,
        user: userEssentials,
        token: result.data?.token || result.token,
        expiresAt: result.data?.expiresAt || result.expiresAt,
        message: result.message,
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Tempo limite excedido durante o registro. Tente novamente.');
        }
        
        if (fetchError.message.includes('fetch') || fetchError.message.includes('network')) {
          throw new Error('Erro de conexão durante o registro. Verifique sua internet.');
        }
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('❌ Erro no registro:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<UserEssentials | null> => {
  // Usar apenas SessionManager - sem requisições automáticas
  return SessionManager.getUserSession();
};

export const logout = async (): Promise<void> => {
  console.log('🔐 Iniciando processo de logout...');
  
  try {
    // 1. Limpar sessão local primeiro
    SessionManager.clearSession();
    
    // 2. Chamar API de logout (sem bloquear se falhar)
    try {
      // Configuração específica para mobile
      const controller = new AbortController();
      const timeoutMs = 10000; // 10s timeout para logout
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(`${AUTH_CONFIG.API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'same-origin',
        cache: 'no-cache',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('⚠️ Erro na resposta do logout:', response.status);
      }
    } catch (apiError) {
      console.warn('⚠️ Erro ao chamar API de logout (não crítico):', apiError);
    }
    
    console.log('✅ Logout concluído com sucesso');
  } catch (error) {
    console.error('❌ Erro durante logout:', error);
    
    // Garantir limpeza mesmo com erro
    SessionManager.clearSession();
    console.warn('⚠️ Logout completado com alguns erros, mas sessão foi limpa');
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    // Verificar apenas sessão local - sem requisições
    return SessionManager.isSessionActive();
  } catch (error) {
    console.error('❌ Erro ao verificar autenticação:', error);
    return false;
  }
};

export const isTokenExpired = (): boolean => {
  // Verificar se a sessão ainda é válida
  return !SessionManager.isSessionActive();
};

/**
 * Renovação de sessão simplificada - apenas estende a sessão atual
 */
export const refreshToken = async (): Promise<boolean> => {
  try {
    const currentUser = SessionManager.getUserSession();
    
    if (!currentUser) {
      console.log('🔄 Nenhuma sessão ativa para renovar');
      return false;
    }

    // Simplesmente estender a sessão atual
    SessionManager.setUserSession(currentUser);
    console.log('✅ Sessão renovada com sucesso');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao renovar sessão:', error);
    return false;
  }
};

// Monitoramento de atividade DESABILITADO para apresentação
// if (typeof window !== 'undefined') {
//   // Atualizar atividade em eventos do usuário
//   const updateActivity = () => SessionManager.updateActivity();
//   
//   ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
//     document.addEventListener(event, updateActivity, { passive: true });
//   });

//   // Verificar sessão periodicamente
//   setInterval(() => {
//     const lastActivity = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY);
//     if (lastActivity) {
//       const timeSinceActivity = Date.now() - parseInt(lastActivity);
//       
//       // Se não há atividade há mais de 30 minutos, limpar sessão
//       if (timeSinceActivity > 30 * 60 * 1000) {
//         console.log('🔐 Sessão expirada por inatividade');
//         SessionManager.clearSession();
//         
//         // Redirecionar para login se estivermos em uma página protegida
//         if (window.location.pathname.includes('/dashboard')) {
//           window.location.href = '/login?expired=true';
//         }
//       }
//     }
//   }, AUTH_CONFIG.ACTIVITY_CHECK_INTERVAL);
// }

