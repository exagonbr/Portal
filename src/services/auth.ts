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
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
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
  };
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
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (password === 'teste123') {
        const user = MOCK_USERS[email.toLowerCase()];
        if (user) {
          // Set auth token and user data in both cookie and localStorage
          setCookie('auth_token', 'dummy_token_value');
          setCookie('user_data', encodeURIComponent(JSON.stringify(user)));
          safeLocalStorage.setItem('auth_token', 'dummy_token_value');
          safeLocalStorage.setItem('user', JSON.stringify(user));
          resolve({ success: true, user });
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
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        role: type,
        courses: []
      };

      // Set auth token and user data in both cookie and localStorage
      setCookie('auth_token', 'dummy_token_value');
      setCookie('user_data', encodeURIComponent(JSON.stringify(newUser)));
      safeLocalStorage.setItem('auth_token', 'dummy_token_value');
      safeLocalStorage.setItem('user', JSON.stringify(newUser));
      resolve({ success: true, user: newUser });
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
      type: 'teacher', // Default role for Google user s
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
  return new Promise((resolve) => {
    // Clear NextAuth session
    signOut({ redirect: false }).then(() => {
      // Clear local storage
      safeLocalStorage.removeItem('auth_token');
      safeLocalStorage.removeItem('user');

      // Clear all cookies
      clearAllCookies();

      setTimeout(() => resolve(), 500);
    });
  });
};

export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession();
  if (session) return true;

  return !!safeLocalStorage.getItem('auth_token') ||
      (typeof window !== 'undefined' && document.cookie.includes('auth_token='));
};
