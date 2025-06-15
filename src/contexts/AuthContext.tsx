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
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, type: 'student' | 'teacher') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserEssentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Estado derivado para autenticação
  const isAuthenticated = !!user;

  /**
   * Limpar erro
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Buscar usuário atual do localStorage (sem requisições automáticas)
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      
      // Verificar apenas localStorage - evita loops de requisições
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        console.log('🔐 AuthContext: Usuário encontrado no localStorage:', currentUser.email);
        setUser(currentUser);
        setError(null);
      } else {
        console.log('🔐 AuthContext: Nenhum usuário no localStorage');
        setUser(null);
      }
      
    } catch (err) {
      console.error('❌ Erro ao buscar usuário do localStorage:', err);
      setUser(null);
      setError('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Inicialização do contexto
   */
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  /**
   * Função de redirecionamento segura
   */
  const safeRedirect = useCallback((path: string) => {
    try {
      if (typeof window !== 'undefined') {
        console.log(`🎯 AuthContext: Redirecionando para ${path}`);
        window.location.replace(path);
      }
    } catch (error) {
      console.error('❌ Erro no redirecionamento:', error);
      // Fallback para router.push
      router.push(path);
    }
  }, [router]);

  /**
   * Login do usuário
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔐 Iniciando login para:', email);
      setLoading(true);
      setError(null);
      
      // Validações básicas
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }

      if (!email.includes('@')) {
        throw new Error('Email inválido');
      }

      if (password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
      }
      
      const response = await authService.login(email, password);
      
      if (response.success && response.user) {
        console.log('🔐 Login bem-sucedido:', response.user.name, 'Role:', response.user.role);
        setUser(response.user);
        setError(null);
        
        // Determinar dashboard baseado na role
        const normalizedRole = response.user.role?.toLowerCase();
        const dashboardPath = getDashboardPath(normalizedRole);
        
        if (dashboardPath) {
          console.log(`🎯 Redirecionando para dashboard: ${dashboardPath}`);
          safeRedirect(dashboardPath);
        } else {
          console.warn(`⚠️ Dashboard não encontrado para role ${response.user.role}, usando fallback`);
          safeRedirect('/dashboard/student');
        }
      } else {
        const errorMessage = response.message || 'Falha no login';
        console.error('🔐 Login falhou:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao fazer login';
      console.error('❌ Erro no login:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [safeRedirect]);

  /**
   * Registro de novo usuário
   */
  const register = useCallback(async (name: string, email: string, password: string, type: 'student' | 'teacher') => {
    try {
      console.log('🔐 Iniciando registro para:', email);
      setLoading(true);
      setError(null);
      
      // Validações básicas
      if (!name || !email || !password) {
        throw new Error('Nome, email e senha são obrigatórios');
      }

      if (!email.includes('@')) {
        throw new Error('Email inválido');
      }

      if (password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
      }
      
      const response = await authService.register(name, email, password, type);
      
      if (response.success && response.user) {
        console.log('🔐 Registro bem-sucedido:', response.user.name, 'Role:', response.user.role);
        setUser(response.user);
        setError(null);
        
        // Determinar dashboard baseado na role
        const normalizedRole = response.user.role?.toLowerCase();
        const dashboardPath = getDashboardPath(normalizedRole);
        
        if (dashboardPath) {
          console.log(`🎯 Redirecionando para dashboard: ${dashboardPath}`);
          safeRedirect(dashboardPath);
        } else {
          console.warn(`⚠️ Dashboard não encontrado para role ${response.user.role}, usando fallback`);
          safeRedirect('/dashboard/student');
        }
      } else {
        const errorMessage = response.message || 'Falha no registro';
        console.error('🔐 Registro falhou:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao registrar usuário';
      console.error('❌ Erro no registro:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [safeRedirect]);

  /**
   * Logout do usuário
   */
  const logout = useCallback(async () => {
    try {
      console.log('🔐 Iniciando logout...');
      setLoading(true);
      
      // Limpar estado local primeiro
      setUser(null);
      setError(null);
      
      // Limpar dados do localStorage/sessionStorage
      try {
        await clearAllDataForUnauthorized();
      } catch (clearError) {
        console.warn('⚠️ Erro ao limpar dados durante logout:', clearError);
      }
      
      // Chamar serviço de logout (sem bloquear se falhar)
      try {
        await authService.logout();
      } catch (serviceError) {
        console.warn('⚠️ Erro no serviço de logout:', serviceError);
      }
      
      // Usar LogoutService para limpeza completa
      try {
        const { LogoutService } = await import('../services/logoutService');
        await LogoutService.logoutAndRedirect();
      } catch (logoutServiceError) {
        console.warn('⚠️ Erro no LogoutService:', logoutServiceError);
        
        // Fallback: redirecionamento direto
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/login';
        }
      }
      
    } catch (err: any) {
      console.error('❌ Erro no logout:', err);
      setError('Erro ao fazer logout');
      
      // Garantir limpeza mesmo com erro
      setUser(null);
      
      // Fallback final
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh dos dados do usuário
   */
  const refreshUser = useCallback(async () => {
    console.log('🔄 Atualizando dados do usuário...');
    await fetchCurrentUser();
  }, [fetchCurrentUser]);

  /**
   * Refresh do token de acesso
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔄 Renovando token de acesso...');
      
      const refreshed = await authService.refreshToken();
      
      if (refreshed) {
        console.log('✅ Token renovado com sucesso');
        await fetchCurrentUser(); // Atualizar dados do usuário
        return true;
      } else {
        console.warn('⚠️ Falha ao renovar token');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao renovar token:', error);
      return false;
    }
  }, [fetchCurrentUser]);

  /**
   * Verificar se usuário tem permissão específica
   */
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user?.permissions) return false;
    return user.permissions.includes(permission as Permission);
  }, [user]);

  /**
   * Verificar se usuário tem qualquer uma das permissões
   */
  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    if (!user?.permissions) return false;
    return permissions.some(permission => user.permissions?.includes(permission as Permission));
  }, [user]);

  /**
   * Verificar se usuário tem todas as permissões
   */
  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    if (!user?.permissions) return false;
    return permissions.every(permission => user.permissions?.includes(permission as Permission));
  }, [user]);

  /**
   * Verificar se usuário tem role específica
   */
  const hasRole = useCallback((role: string): boolean => {
    if (!user?.role) return false;
    return user.role.toLowerCase() === role.toLowerCase();
  }, [user]);

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    refreshToken,
    clearError,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para usar o contexto de autenticação
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

/**
 * Hook para exigir autenticação
 */
export function useRequireAuth(redirectTo = '/login') {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log('🔐 useRequireAuth: Usuário não autenticado, redirecionando...');
      
      // Limpar dados antes de redirecionar para login
      if (redirectTo.includes('/login')) {
        clearAllDataForUnauthorized()
          .then(() => {
            router.push(redirectTo + '?error=unauthorized');
          })
          .catch((error) => {
            console.error('❌ Erro durante limpeza de dados:', error);
            router.push(redirectTo + '?error=unauthorized');
          });
      } else {
        router.push(redirectTo);
      }
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading, isAuthenticated: !!user };
}

/**
 * Hook para exigir roles específicas
 */
export function useRequireRole(allowedRoles: string[], redirectTo = '/dashboard') {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();

  const hasAllowedRole = allowedRoles.some(role => hasRole(role));

  useEffect(() => {
    if (!loading && user && !hasAllowedRole) {
      console.log(`🔐 useRequireRole: Usuário não tem role permitida. Role atual: ${user.role}, Permitidas: ${allowedRoles.join(', ')}`);
      
      // Redirecionar para dashboard apropriado baseado na role atual
      const normalizedRole = user.role?.toLowerCase();
      const dashboardPath = getDashboardPath(normalizedRole);
      
      router.push(dashboardPath || redirectTo);
    }
  }, [user, loading, hasAllowedRole, allowedRoles, router, redirectTo]);

  return {
    user,
    loading,
    hasRole: hasAllowedRole,
    isAuthenticated: !!user
  };
}

/**
 * Hook para verificar permissões específicas
 */
export function useRequirePermission(requiredPermissions: string[], redirectTo = '/dashboard') {
  const { user, loading, hasAllPermissions } = useAuth();
  const router = useRouter();

  const hasRequiredPermissions = hasAllPermissions(requiredPermissions);

  useEffect(() => {
    if (!loading && user && !hasRequiredPermissions) {
      console.log(`🔐 useRequirePermission: Usuário não tem permissões necessárias. Permissões: ${requiredPermissions.join(', ')}`);
      
      // Redirecionar para dashboard apropriado
      const normalizedRole = user.role?.toLowerCase();
      const dashboardPath = getDashboardPath(normalizedRole);
      
      router.push(dashboardPath || redirectTo);
    }
  }, [user, loading, hasRequiredPermissions, requiredPermissions, router, redirectTo]);

  return {
    user,
    loading,
    hasPermissions: hasRequiredPermissions,
    isAuthenticated: !!user
  };
}
