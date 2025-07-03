'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../lib/authFetch';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-hot-toast';
import { buildLoginUrl, buildDashboardUrl, buildUrl } from '../utils/urlBuilder';
import { useCacheCleaner } from '../hooks/useCacheCleaner';

// Tipagem para o usuário e o contexto
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  contact?: {
    phone?: string;
    address?: string;
    educationUnit?: string;
  };
  telefone?: string;
  endereco?: string;
  unidadeEnsino?: string;
  institution_name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  handleGoogleLogin: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper para decodificar o token e extrair dados do usuário
const decodeToken = (token: string): any | null => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

// Helper para acessar localStorage de forma segura
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('accessToken');
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('accessToken', token);
  } catch (error) {
    console.error('Error setting localStorage:', error);
  }
};

const removeStoredToken = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('accessToken');
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const initializationRef = useRef(false);
  
  // Hook para limpeza de cache
  const { clearAuthCache, performCacheCleanup } = useCacheCleaner();

  const isAuthenticated = !!user;

  // Detectar se estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Função de logout centralizada
  const logout = useCallback(async () => {
    console.log('Logging out: removing token and user');
    
    // Limpar cache antes do logout
    await performCacheCleanup('logout');
    
    removeStoredToken();
    setUser(null);
    apiClient.defaults.headers.common['Authorization'] = '';
    apiClient.post('/auth/logout').catch(err => console.error("Logout API call failed:", err));
    
    // Limpar cache de autenticação após logout
    clearAuthCache();
    
    router.push(buildLoginUrl());
    toast.success('Você foi desconectado.');
  }, [router, performCacheCleanup, clearAuthCache]);

  // Função para validar e configurar usuário a partir do token
  const setupUserFromToken = useCallback((token: string): boolean => {
    const decodedPayload = decodeToken(token);
    if (decodedPayload && decodedPayload.exp * 1000 > Date.now()) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser({
        id: decodedPayload.id,
        name: decodedPayload.name,
        email: decodedPayload.email,
        role: decodedPayload.role,
        permissions: decodedPayload.permissions || [],
      });
      console.log('AuthProvider: User set from token:', decodedPayload);
      return true;
    } else {
      console.log('AuthProvider: Token expired or invalid, removing token');
      removeStoredToken();
      return false;
    }
  }, []);

  // Efeito de inicialização único - executa apenas uma vez quando o cliente está pronto
  useEffect(() => {
    if (!isClient || initializationRef.current) {
      return;
    }

    initializationRef.current = true;
    console.log('AuthProvider: Initializing authentication check');

    const token = getStoredToken();
    
    if (token) {
      console.log('AuthProvider: Token found, validating...');
      setupUserFromToken(token);
    } else {
      console.log('AuthProvider: No token found');
    }
    
    setIsLoading(false);
  }, [isClient, setupUserFromToken]);

  // Função de login
  const login = async (email: string, password: string) => {
    if (!isClient) return;
    
    setIsLoading(true);
    try {
      // Limpar cache antes do login
      await performCacheCleanup('login attempt');
      
      const { data } = await apiClient.post('/auth/login', { email, password });
      const { accessToken } = data.data;
      
      console.log('Login successful, storing token');
      setStoredToken(accessToken);
      
      if (setupUserFromToken(accessToken)) {
        // Limpar cache após login bem-sucedido
        await performCacheCleanup('login success');
        
        toast.success('Login realizado com sucesso!');
        router.push(buildUrl('/dashboard'));
      } else {
        throw new Error('Token inválido recebido do servidor');
      }

    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Limpar cache em caso de erro
      clearAuthCache();
      
      const message = error.response?.data?.message || 'Falha no login. Verifique suas credenciais.';
      toast.error(message, {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (token: string) => {
    if (!isClient) return;

    setIsLoading(true);
    try {
      await performCacheCleanup('google-login');
      
      const { data } = await apiClient.post('/auth/google-login', { token });
      const { accessToken } = data.data;
      
      setStoredToken(accessToken);
      
      if (setupUserFromToken(accessToken)) {
        await performCacheCleanup('login success');
        toast.success('Login com Google realizado com sucesso!');
        router.push(buildUrl('/dashboard'));
      } else {
        throw new Error('Token inválido recebido do servidor');
      }
    } catch (error: any) {
      console.error("Google login failed:", error);
      clearAuthCache();
      const message = error.response?.data?.message || 'Falha no login com Google.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    loading: isLoading,
    error: null, // Placeholder, será implementado no futuro
    login,
    logout,
    handleGoogleLogin,
    refreshUser: async () => {
      const token = getStoredToken();
      if (token) {
        setupUserFromToken(token);
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar o contexto de autenticação
 * 
 * Renomeado para useAuthSafe para corresponder ao uso no código que causou o erro.
 */
export const useAuthSafe = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthSafe must be used within an AuthProvider');
  }
  return context;
};

/**
 * Hook para usar o contexto de autenticação
 * 
 * Alias para useAuthSafe para manter compatibilidade com componentes que importam useAuth
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

