'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserEssentials, Permission } from '@/types/auth';
import * as authService from '@/services/auth';
import { getDashboardPath } from '@/utils/roleRedirect';
import { clearAllDataForUnauthorized } from '@/utils/clearAllData';

interface AuthContextType {
  user: UserEssentials | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, type: 'student' | 'teacher') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserEssentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Função para buscar o usuário atual
  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Login
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(email, password);
      
      if (response.success && response.user) {
        setUser(response.user);
        
        // Normaliza a role para lowercase
        const normalizedRole = response.user.role?.toLowerCase();
        
        // Redirecionar para o dashboard apropriado
        const dashboardPath = getDashboardPath(normalizedRole || response.user.role);
        if (dashboardPath) {
          router.push(dashboardPath);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err.message || 'Erro ao fazer login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (name: string, email: string, password: string, type: 'student' | 'teacher') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(name, email, password, type);
      
      if (response.success && response.user) {
        setUser(response.user);
        
        // Normaliza a role para lowercase
        const normalizedRole = response.user.role?.toLowerCase();
        
        // Redirecionar para o dashboard apropriado
        const dashboardPath = getDashboardPath(normalizedRole || response.user.role);
        if (dashboardPath) {
          router.push(dashboardPath);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Erro no registro:', err);
      setError(err.message || 'Erro ao registrar usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      
      // Limpar todos os dados antes do logout
      await clearAllDataForUnauthorized();
      
      await authService.logout();
      setUser(null);
      setError(null);
      router.push('/login');
    } catch (err: any) {
      console.error('Erro no logout:', err);
      setError(err.message || 'Erro ao fazer logout');
      
      // Mesmo com erro, tentar limpar dados e redirecionar
      try {
        await clearAllDataForUnauthorized();
      } catch (clearError) {
        console.error('Erro ao limpar dados durante logout:', clearError);
      }
      
      setUser(null);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  // Permission check helpers
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user?.permissions) return false;
    return user.permissions.includes(permission as Permission);
  }, [user]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    if (!user?.permissions) return false;
    return permissions.some(permission => user.permissions?.includes(permission as Permission));
  }, [user]);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    if (!user?.permissions) return false;
    return permissions.every(permission => user.permissions?.includes(permission as Permission));
  }, [user]);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
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
      // Se redirecionando para login, limpar dados primeiro
      if (redirectTo.includes('/login')) {
        clearAllDataForUnauthorized().then(() => {
          router.push(redirectTo + '?error=unauthorized');
        }).catch((error) => {
          console.error('❌ Erro durante limpeza de dados:', error);
          router.push(redirectTo + '?error=unauthorized');
        });
      } else {
        router.push(redirectTo);
      }
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
      // Normaliza a role para lowercase para comparação
      const normalizedRole = user.role?.toLowerCase();
      const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
      
      if (!normalizedAllowedRoles.includes(normalizedRole)) {
        const dashboardPath = getDashboardPath(normalizedRole);
        router.push(dashboardPath || redirectTo);
      }
    }
  }, [user, loading, allowedRoles, router, redirectTo]);

  return {
    user,
    loading,
    hasRole: user ? allowedRoles.map(r => r.toLowerCase()).includes(user.role.toLowerCase()) : false
  };
}
