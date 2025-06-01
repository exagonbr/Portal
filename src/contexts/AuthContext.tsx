'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { UserEssentials, Permission } from '@/types/auth';
import * as authService from '@/services/authService';
import { getDashboardPath, convertBackendRole, isValidRole } from '@/utils/roleRedirect';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  institution?: {
    id: number;
    name: string;
  };
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
  sessionId?: string;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  sessionId: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, type: 'student' | 'teacher') => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<{ success: boolean; message: string }>;
  checkAuth: () => Promise<{ success: boolean; message?: string }>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const handleRedirect = useCallback((role: string, source: string) => {
    console.log(`🔄 Redirecionando usuário (${source}) com role: ${role}`);
    
    const normalizedRole = convertBackendRole(role);
    
    if (!normalizedRole || !isValidRole(normalizedRole)) {
<<<<<<< HEAD
      console.error(`❌ Role inválida: ${role} -> ${normalizedRole}`);
      setError('Perfil de usuário inválido. Por favor, entre em contato com o administrador.');
      return;
    }
    
=======
      console.error(`❌ Role inválida no redirecionamento: ${userRole} -> ${normalizedRole}`);
      router.push('/login?error=unauthorized');
      return;
    }
    
    // Obtém o caminho do dashboard baseado na role
>>>>>>> 2d85e2b6d52603d50528b369453e0382e6816aae
    const dashboardPath = getDashboardPath(normalizedRole);
    
    if (dashboardPath) {
      console.log(`✅ Redirecionando para: ${dashboardPath}`);
      router.push(dashboardPath);
    } else {
<<<<<<< HEAD
      console.error(`❌ Dashboard não encontrado para: ${normalizedRole}`);
      setError('Erro interno. Por favor, entre em contato com o administrador.');
=======
      console.error(`❌ Dashboard não encontrado para role: ${normalizedRole}`);
      router.push('/login?error=unauthorized');
>>>>>>> 2d85e2b6d52603d50528b369453e0382e6816aae
    }
  }, [router]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.getCurrentUser() as AuthResponse;
      
      if (response?.success && response?.user) {
        setUser(response.user);
        console.log('✅ Usuário atual carregado:', response.user.name);
      } else {
        console.error('❌ Falha ao carregar usuário:', response?.message);
        setError(response?.message || 'Erro ao carregar usuário');
      }
    } catch (err: any) {
      console.error('❌ Erro ao carregar usuário:', err.message);
      setError(err.message || 'Erro ao carregar usuário');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(email, password) as AuthResponse;
      
      if (response.success && response.user && response.token && response.sessionId) {
        setUser(response.user);
        setToken(response.token);
        setSessionId(response.sessionId);
        localStorage.setItem('token', response.token);
        localStorage.setItem('sessionId', response.sessionId);
        return { success: true, message: 'Login realizado com sucesso!' };
      } else {
        return { 
          success: false, 
          message: response.message || 'Não foi possível realizar o login. Por favor, tente novamente.' 
        };
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Não foi possível realizar o login. Por favor, tente novamente mais tarde.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, type: 'student' | 'teacher') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(name, email, password, type) as RegisterResponse;
      
      if (response.success) {
        return { success: true, message: 'Conta criada com sucesso!' };
      } else {
        return { 
          success: false, 
          message: response.message || 'Não foi possível criar sua conta. Por favor, tente novamente.' 
        };
      }
    } catch (error: any) {
      console.error('Erro no registro:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Não foi possível criar sua conta. Por favor, tente novamente mais tarde.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.logout() as AuthResponse;
      
      if (response.success) {
        setUser(null);
        setToken(null);
        setSessionId(null);
        localStorage.removeItem('token');
        localStorage.removeItem('sessionId');
        return { success: true, message: 'Logout realizado com sucesso! Até logo!' };
      } else {
        return { 
          success: false, 
          message: response.message || 'Não foi possível realizar o logout. Por favor, tente novamente.' 
        };
      }
    } catch (error: any) {
      console.error('Erro no logout:', error);
      setUser(null);
      setToken(null);
      setSessionId(null);
      localStorage.removeItem('token');
      localStorage.removeItem('sessionId');
      return { 
        success: false, 
        message: error.response?.data?.message || 'Não foi possível realizar o logout. Por favor, tente novamente mais tarde.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('sessionId');
      
      if (!token || !sessionId) {
        // Não lança erro, apenas indica que não há sessão
        setUser(null);
        setToken(null);
        setSessionId(null);
        return { success: false, message: 'Sessão não encontrada' };
      }

      try {
        const response = await authService.getCurrentUser() as AuthResponse;
        
        if (response.success && response.user) {
          setUser(response.user);
          setToken(token);
          setSessionId(sessionId);
          return { success: true };
        } else {
          // Limpa os dados da sessão inválida
          setUser(null);
          setToken(null);
          setSessionId(null);
          localStorage.removeItem('token');
          localStorage.removeItem('sessionId');
          return { 
            success: false, 
            message: response.message || 'Não foi possível carregar seu perfil. Por favor, faça login novamente.' 
          };
        }
      } catch (error: any) {
        console.error('Erro ao verificar autenticação:', error);
        // Limpa os dados da sessão com erro
        setUser(null);
        setToken(null);
        setSessionId(null);
        localStorage.removeItem('token');
        localStorage.removeItem('sessionId');
        return { 
          success: false, 
          message: error.message || 'Não foi possível verificar sua autenticação. Por favor, faça login novamente.' 
        };
      }
    } finally {
      setLoading(false);
    }
  };

  // Permission check helpers
  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const value = {
    user,
    token,
    sessionId,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}

// Hook para verificar se o usuário está autenticado
export function useRequireAuth(redirectTo = '/login') {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log('🔒 Usuário não autenticado, redirecionando para:', redirectTo);
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading };
}

// Hook para verificar roles específicas
export function useRequireRole(allowedRoles: string[], redirectTo = '/dashboard') {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Normaliza a role do usuário e as roles permitidas
      const normalizedUserRole = convertBackendRole(user.role);
      const normalizedAllowedRoles = allowedRoles.map(r => convertBackendRole(r)).filter(Boolean);
      
      if (!normalizedUserRole || !normalizedAllowedRoles.includes(normalizedUserRole)) {
        const dashboardPath = getDashboardPath(normalizedUserRole || user.role.toLowerCase());
        const finalRedirect = dashboardPath || redirectTo;
        
        console.log(`🚫 Role ${user.role} não permitida, redirecionando para: ${finalRedirect}`);
        
        router.push(finalRedirect);
      }
    }
  }, [user, loading, allowedRoles, router, redirectTo]);

  return {
    user,
    loading,
    hasRole: user ? allowedRoles.map(r => convertBackendRole(r)).includes(convertBackendRole(user.role)) : false
  };
}
