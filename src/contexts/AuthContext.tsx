'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserEssentials, Permission } from '@/types/auth';
import * as authService from '@/services/auth';
import { getDashboardPath } from '@/utils/roleRedirect';

interface AuthContextType {
  user: UserEssentials | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, type: 'student' | 'teacher') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Estado derivado para autenticação
  const isAuthenticated = !!user;

  // Verificar se o componente foi montado no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Limpar erro
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Buscar usuário atual da sessão (cookies/localStorage)
   */
  const fetchCurrentUser = useCallback(async () => {
    // Só executar no cliente após montagem
    if (!mounted || typeof window === 'undefined') {
      return;
    }

    try {
      setLoading(true);
      
      // CORREÇÃO: Adicionar timeout para evitar travamento
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na verificação de autenticação')), 5000);
      });
      
      const userPromise = authService.getCurrentUser();
      
      // Usar Promise.race para garantir que não trave
      const currentUser = await Promise.race([userPromise, timeoutPromise]) as UserEssentials | null;
      
      if (currentUser) {
        setUser(currentUser);
        setError(null);
      } else {
        setUser(null);
      }
      
    } catch (err) {
      console.error('❌ Erro ao buscar usuário da sessão:', err);
      setUser(null);
      
      // CORREÇÃO: Não definir erro se for timeout, apenas log
      if (err instanceof Error && err.message.includes('Timeout')) {
        console.warn('⚠️ Timeout na verificação de autenticação - continuando sem usuário');
      } else {
        setError('Erro ao carregar dados do usuário');
      }
    } finally {
      setLoading(false);
    }
  }, [mounted]);

  /**
   * Inicialização do contexto - verificar sessão existente
   */
  useEffect(() => {
    if (mounted) {
      // CORREÇÃO: Adicionar delay para evitar execução imediata
      const timeoutId = setTimeout(() => {
        fetchCurrentUser();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [mounted, fetchCurrentUser]);

  /**
   * Função de redirecionamento segura
   */
  const safeRedirect = useCallback((path: string) => {
    try {
      if (typeof window !== 'undefined') {
        console.log(`🎯 AuthContext: Redirecionando para ${path}`);
        
        // Evitar redirecionamentos circulares
        const currentPath = window.location.pathname;
        if (currentPath === path) {
          console.log('🔄 Redirecionamento circular evitado:', path);
          return;
        }
        
        // Usar router.push para melhor integração com Next.js
        router.push(path);
      }
    } catch (error) {
      console.error('❌ Erro no redirecionamento:', error);
      // Fallback para window.location
      if (typeof window !== 'undefined') {
        window.location.href = path;
      }
    }
  }, [router]);

  /**
   * Login do usuário
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Iniciando login para:', email);
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
        
        // Aguardar um pouco para garantir que a sessão foi salva
        await new Promise(resolve => setTimeout(resolve, 100));
        
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
      console.log('🔐 AuthContext: Iniciando registro para:', email);
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
        
        // Aguardar um pouco para garantir que a sessão foi salva
        await new Promise(resolve => setTimeout(resolve, 100));
        
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
   * Logout do usuário - Simplificado
   */
  const logout = useCallback(async () => {
    try {
      console.log('🔐 AuthContext: Iniciando logout...');
      setLoading(true);
      
      // Limpar estado local primeiro
      setUser(null);
      setError(null);
      
      // Chamar serviço de logout (limpa sessão e cookies)
      await authService.logout();
      
      // Aguardar um pouco para garantir limpeza
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirecionar para login com parâmetro de logout
      console.log('🎯 Redirecionando para login após logout');
      safeRedirect('/login?logout=true');
      
    } catch (err: any) {
      console.error('❌ Erro no logout:', err);
      
      // Garantir limpeza mesmo com erro
      setUser(null);
      setError(null);
      
      // Redirecionar mesmo com erro
      safeRedirect('/login?logout=true');
    } finally {
      setLoading(false);
    }
  }, [safeRedirect]);

  /**
   * Refresh dos dados do usuário
   */
  const refreshUser = useCallback(async () => {
    console.log('🔄 AuthContext: Atualizando dados do usuário...');
    await fetchCurrentUser();
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
 * Hook para exigir autenticação - Simplificado
 */
export function useRequireAuth(redirectTo = '/login') {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log('🔐 useRequireAuth: Usuário não autenticado, redirecionando...');
      
      // Redirecionar diretamente sem limpeza adicional
      const redirectUrl = redirectTo.includes('?') 
        ? `${redirectTo}&error=unauthorized` 
        : `${redirectTo}?error=unauthorized`;
      
      router.replace(redirectUrl);
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
      
      router.replace(dashboardPath || redirectTo);
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
      
      router.replace(dashboardPath || redirectTo);
    }
  }, [user, loading, hasRequiredPermissions, requiredPermissions, router, redirectTo]);

  return {
    user,
    loading,
    hasPermissions: hasRequiredPermissions,
    isAuthenticated: !!user
  };
}
