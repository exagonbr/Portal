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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserEssentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Função para buscar o usuário atual
  const fetchCurrentUser = async () => {
    try {
      console.log('🔍 Buscando usuário atual...');
      
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        console.log('✅ Usuário encontrado:', currentUser.name, currentUser.role);
      } else {
        setUser(null);
        console.log('❌ Nenhum usuário autenticado');
      }
    } catch (err: any) {
      console.error('❌ Erro ao buscar usuário:', err.message);
      setUser(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para redirecionamento seguro
  const handleRedirect = (userRole: string, context: string) => {
    console.log(`🚀 Redirecionando usuário (${context}) com role: ${userRole}`);
    
    // Converte role do backend para formato do frontend
    const normalizedRole = convertBackendRole(userRole);
    
    if (!normalizedRole || !isValidRole(normalizedRole)) {
      console.error(`❌ Role inválida: ${userRole} -> ${normalizedRole}`);
      setError('Perfil de usuário inválido. Por favor, entre em contato com o administrador.');
      return;
    }
    
    // Obtém o caminho do dashboard
    const dashboardPath = getDashboardPath(normalizedRole);
    
    if (dashboardPath) {
      console.log(`✅ Redirecionando para: ${dashboardPath}`);
      router.push(dashboardPath);
    } else {
      console.log(`⚠️ Dashboard não encontrado para ${normalizedRole}, usando fallback`);
      router.push('/dashboard');
    }
  };

  // Carregar usuário no mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Iniciando login para:', email);
      
      const response = await authService.login(email, password);
      
      if (response.success && response.user) {
        setUser(response.user);
        console.log('✅ Login bem-sucedido:', response.user.name, response.user.role);
        
        // Redirecionar para o dashboard apropriado
        handleRedirect(response.user.role, 'login');
      } else {
        console.error('❌ Falha no login:', response.message);
        console.error('📊 Detalhes da resposta:', response);
        setError(response.message || 'Falha na autenticação');
      }
    } catch (err: any) {
      console.error('❌ Erro no login:', err.message);
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
      console.log('👋 Fazendo logout...');
      
      await authService.logout();
      setUser(null);
      setError(null);
      
      console.log('✅ Logout realizado');
      router.push('/login');
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
