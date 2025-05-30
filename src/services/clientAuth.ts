import {User} from '../types/auth';
import {getSession, signOut} from 'next-auth/react';
import {MOCK_USERS} from '../constants/mockData';

export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: User;
  message?: string;
}

const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;samesite=strict`;
  }
};

const clearAllCookies = () => {
  if (typeof window !== 'undefined') {
    // Get all cookies and split them into individual cookies
    const cookies = document.cookie.split(';');
    
    // For each cookie, set its expiry to a past date to remove it
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      // Also try with different paths to ensure complete removal
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
    }
  }
};

const removeCookie = (name: string) => {
  if (typeof window !== 'undefined') {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
};

// User management functions
export const listUsers = async (): Promise<User[]> => {
  return Object.values(MOCK_USERS);
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const newUser = {
    ...userData,
    id: Math.random().toString(36).substr(2, 9)
  } as User;
  MOCK_USERS[userData.email] = newUser;
  return newUser;
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
  const user = Object.values(MOCK_USERS).find(u => u.id === id);
  if (!user) return null;
  
  const updatedUser = { ...user, ...userData };
  MOCK_USERS[user.email] = updatedUser;
  return updatedUser;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const user = Object.values(MOCK_USERS).find(u => u.id === id);
  if (!user) return false;
  
  delete MOCK_USERS[user.email];
  return true;
};

// Helper function to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      if (password === 'teste123') {
        const user = MOCK_USERS[email.toLowerCase()];
        if (user) {
          try {
            // Gera um session ID simples para o cliente
            const sessionId = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

            // Set session ID and user data in cookies and localStorage
            setCookie('session_id', sessionId);
            setCookie('auth_token', 'dummy_token_value');
            setCookie('user_data', encodeURIComponent(JSON.stringify(user)));
            safeLocalStorage.setItem('session_id', sessionId);
            safeLocalStorage.setItem('auth_token', 'dummy_token_value');
            safeLocalStorage.setItem('user', JSON.stringify(user));
            
            console.log(`✅ Login realizado com sucesso para ${user.email}, sessão: ${sessionId}`);
            resolve({ success: true, user });
          } catch (error) {
            console.error('Erro ao criar sessão:', error);
            // Fallback para autenticação tradicional
            setCookie('auth_token', 'dummy_token_value');
            setCookie('user_data', encodeURIComponent(JSON.stringify(user)));
            safeLocalStorage.setItem('auth_token', 'dummy_token_value');
            safeLocalStorage.setItem('user', JSON.stringify(user));
            resolve({ success: true, user });
          }
        } else {
          reject(new Error('Usuário não encontrado'));
        }
      } else {
        reject(new Error('Credenciais inválidas'));
      }
    }, 500);
  });
};

export const register = async (
  name: string,
  email: string,
  password: string,
  type: 'student' | 'teacher'
): Promise<RegisterResponse> => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        role: type,
        courses: []
      };

      try {
        // Gera um session ID simples para o cliente
        const sessionId = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

        // Set session ID and user data in cookies and localStorage
        setCookie('session_id', sessionId);
        setCookie('auth_token', 'dummy_token_value');
        setCookie('user_data', encodeURIComponent(JSON.stringify(newUser)));
        safeLocalStorage.setItem('session_id', sessionId);
        safeLocalStorage.setItem('auth_token', 'dummy_token_value');
        safeLocalStorage.setItem('user', JSON.stringify(newUser));
        
        console.log(`✅ Registro realizado com sucesso para ${newUser.email}, sessão: ${sessionId}`);
        resolve({ success: true, user: newUser });
      } catch (error) {
        console.error('Erro ao criar sessão no registro:', error);
        // Fallback para autenticação tradicional
        setCookie('auth_token', 'dummy_token_value');
        setCookie('user_data', encodeURIComponent(JSON.stringify(newUser)));
        safeLocalStorage.setItem('auth_token', 'dummy_token_value');
        safeLocalStorage.setItem('user', JSON.stringify(newUser));
        resolve({ success: true, user: newUser });
      }
    }, 500);
  });
};

export const getCurrentUser = async (): Promise<User | null> => {
  // First try to get user from NextAuth session
  const session = await getSession();
  if (session?.user) {
    return {
      id: Math.random().toString(36).substr(2, 9), // Generate random ID for Google users
      name: session.user.name || '',
      email: session.user.email || '',
      role: 'teacher',
      type: 'teacher', // Default role for Google users
      courses: []
    };
  }

  // If no NextAuth session, try local storage
  const userStr = safeLocalStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

export const logout = async (): Promise<void> => {
  return new Promise(async (resolve) => {
    try {
      // Recupera o session ID antes de limpar
      const sessionId = safeLocalStorage.getItem('session_id') ||
                       (typeof window !== 'undefined' && document.cookie
                         .split('; ')
                         .find(row => row.startsWith('session_id='))
                         ?.split('=')[1]);

      if (sessionId) {
        console.log(`✅ Sessão local removida: ${sessionId}`);
      }

      // Clear NextAuth session
      signOut({ redirect: false }).then(() => {
        // Clear local storage
        safeLocalStorage.removeItem('session_id');
        safeLocalStorage.removeItem('auth_token');
        safeLocalStorage.removeItem('user');
        
        // Clear all cookies
        clearAllCookies();
        
        setTimeout(() => resolve(), 500);
      });
    } catch (error) {
      console.error('Erro durante logout:', error);
      // Continua com limpeza local mesmo se houver erro
      signOut({ redirect: false }).then(() => {
        safeLocalStorage.removeItem('session_id');
        safeLocalStorage.removeItem('auth_token');
        safeLocalStorage.removeItem('user');
        clearAllCookies();
        setTimeout(() => resolve(), 500);
      });
    }
  });
};

export const isAuthenticated = async (): Promise<boolean> => {
  // Verifica NextAuth session
  const session = await getSession();
  if (session) return true;
  
  // Verifica sessão local
  const sessionId = safeLocalStorage.getItem('session_id') ||
                   (typeof window !== 'undefined' && document.cookie
                     .split('; ')
                     .find(row => row.startsWith('session_id='))
                     ?.split('=')[1]);
  
  if (sessionId) {
    return true;
  }
  
  // Fallback para autenticação tradicional
  return !!safeLocalStorage.getItem('auth_token') ||
         (typeof window !== 'undefined' && document.cookie.includes('auth_token='));
};