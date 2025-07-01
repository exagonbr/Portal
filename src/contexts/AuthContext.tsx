'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserEssentials, Permission } from '@/types/auth';
import * as authService from '@/services/authService';
import { getDashboardPath, convertBackendRole, isValidRole } from '@/utils/roleRedirect';

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

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserEssentials;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserEssentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  const handleRedirect = useCallback((role: string, source: string) => {
    console.log(`🔄 Redirecionando usuário (${source}) com role: ${role}`);
    
    if (!role) {
      console.error('❌ Role não definida para redirecionamento');
      setError('Perfil de usuário não encontrado. Por favor, entre em contato com o administrador.');
      return;
    }
    
    const normalizedRole = convertBackendRole(role);
    
    console.log(`🔍 Role original: "${role}" → Role normalizada: "${normalizedRole}"`);
    
    if (!normalizedRole || !isValidRole(normalizedRole)) {
      console.error(`❌ Role inválida: ${role} → ${normalizedRole}`);
      setError('Perfil de usuário inválido. Por favor, entre em contato com o administrador.');
      return;
    }
    
    const dashboardPath = getDashboardPath(normalizedRole);
    
    if (dashboardPath) {
      console.log(`✅ Redirecionando para: ${dashboardPath}`);
      
      try {
        router.push(dashboardPath);
        console.log(`✅ Redirecionamento executado para: ${dashboardPath}`);
      } catch (err) {
        console.error(`❌ Erro ao redirecionar para ${dashboardPath}:`, err);
        // Fallback para redirecionamento alternativo
        window.location.href = dashboardPath;
      }
    } else {
      console.error(`❌ Dashboard não encontrado para: ${normalizedRole}`);
      setError('Erro interno. Por favor, entre em contato com o administrador.');
    }
  }, [router]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated first
      if (!authService.isAuthenticated()) {
        console.log('🔍 Usuário não autenticado, limpando estado');
        setUser(null);
        setLoading(false);
        setInitialized(true);
        return;
      }
      
      const userResponse = await authService.getCurrentUser();
      
      // Convertemos explicitamente para o formato esperado
      const response: AuthResponse = userResponse ? {
        success: true,
        user: userResponse as UserEssentials
      } : {
        success: false,
        message: 'Usuário não encontrado'
      };
      
      if (response.success && response.user) {
        setUser(response.user);
        console.log('✅ Usuário atual carregado:', response.user.name);
      } else {
        console.error('❌ Falha ao carregar usuário:', response.message);
        setUser(null);
        // Don't set error for unauthenticated users
        if (authService.isAuthenticated()) {
          setError(response.message || 'Erro ao carregar usuário');
        }
      }
    } catch (err: any) {
      console.error('❌ Erro ao carregar usuário:', err.message);
      setUser(null);
      // Don't set error for authentication errors
      if (!err.message?.includes('401') && !err.message?.includes('não autenticado')) {
        setError(err.message || 'Erro ao carregar usuário');
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  // Initialize user on mount
  useEffect(() => {
    if (!initialized) {
      fetchCurrentUser();
    }
  }, [initialized, fetchCurrentUser]);

  // Login
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Iniciando login para:', email);
      
      const response = await authService.login(email, password) as AuthResponse;
      
      if (response?.success && response?.user) {
        setUser(response.user);
        console.log('✅ Login bem-sucedido:', response.user.name, response.user.role);
        
        // Redirecionar para o dashboard apropriado
        handleRedirect(response.user.role, 'login');
      } else {
        console.error('❌ Falha no login:', response?.message);
        setError(response?.message || 'Falha na autenticação');
        throw new Error(response?.message || 'Falha na autenticação');
      }
    } catch (err: any) {
      console.error('❌ Erro no login:', err);
      
      // Verificar se é erro específico de refresh token
      if (err.message && err.message.includes('Falha ao atualizar token')) {
        const errorMsg = 'Sessão expirada. Por favor, faça login novamente.';
        setError(errorMsg);
        throw new Error(errorMsg);
      } else {
        setError(err.message || 'Erro ao fazer login');
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (name: string, email: string, password: string, type: 'student' | 'teacher') => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 Iniciando registro:', name, email, type);
      
      const response = await authService.register(name, email, password, type);
      
      if (response.success && response.user) {
        setUser(response.user);
        console.log('✅ Registro bem-sucedido:', response.user.name, response.user.role);
        
        // Redirecionar para o dashboard apropriado
        handleRedirect(response.user.role, 'register');
      } else {
        console.error('❌ Falha no registro:', response.message);
        setError(response.message || 'Falha no registro');
      }
    } catch (err: any) {
      console.error('❌ Erro no registro:', err.message);
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
      setError(null);
      
      console.log('🔒 Iniciando logout');
      
      // Como o método logout retorna void, criamos manualmente uma resposta
      await authService.logout();
      const response: AuthResponse = {
        success: true
      };
      
      if (response.success) {
        setUser(null);
        console.log('✅ Logout bem-sucedido');
        router.push('/login');
      } else {
        console.error('❌ Falha no logout:', response.message);
        setError(response.message || 'Falha ao fazer logout');
      }
    } catch (err: any) {
      console.error('❌ Erro no logout:', err.message);
      setError(err.message || 'Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    console.log('🔄 Atualizando dados do usuário...');
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
