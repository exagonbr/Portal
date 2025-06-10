'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserEssentials, Permission } from '@/types/auth';
import { authService } from '@/services/authService';
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
      
      // Garante que a role está em uppercase
      if (currentUser && currentUser.role) {
        currentUser.role = currentUser.role.toUpperCase() as any;
      }
      
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
      
      console.log('🔍 AuthContext: Iniciando login para:', email);
      
      const response = await authService.login(email, password);
      
      if (response.success && response.user) {
        // Garante que a role está em uppercase
        if (response.user && response.user.role) {
          response.user.role = response.user.role.toUpperCase() as any;
        }
        
        console.log('✅ AuthContext: Login bem-sucedido, definindo usuário:', response.user.name);
        setUser(response.user);
        
        // Redirecionar para o dashboard apropriado
        const dashboardPath = getDashboardPath(response.user.role);
        console.log('🔄 AuthContext: Redirecionando para:', dashboardPath || '/dashboard');
        
        // Aguarda um breve momento para garantir que os cookies sejam definidos corretamente
        setTimeout(() => {
          if (dashboardPath) {
            router.push(dashboardPath);
          } else {
            router.push('/dashboard');
          }
          // Força uma navegação completa para garantir que o middleware seja acionado
          router.refresh();
        }, 300);
      } else {
        console.error('❌ AuthContext: Login falhou:', response.message);
        setError(response.message || 'Erro ao fazer login');
        throw new Error(response.message || 'Erro ao fazer login');
      }
    } catch (err: any) {
      console.error('❌ AuthContext: Erro no login:', err);
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
        // Garante que a role está em uppercase
        if (response.user && response.user.role) {
          response.user.role = response.user.role.toUpperCase() as any;
        }
        
        setUser(response.user);
        
        // Redirecionar para o dashboard apropriado
        const dashboardPath = getDashboardPath(response.user.role);
        
        // Aguarda um breve momento para garantir que os cookies sejam definidos corretamente
        setTimeout(() => {
          if (dashboardPath) {
            router.push(dashboardPath);
          } else {
            router.push('/dashboard');
          }
          // Força uma navegação completa para garantir que o middleware seja acionado
          router.refresh();
        }, 300);
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
      console.log('🔄 AuthContext: Iniciando logout...');
      
      // Primeiro limpar dados locais para garantir que a UI reflita o estado desconectado
      try {
        console.log('🧹 AuthContext: Limpando dados locais primeiro...');
        await clearAllDataForUnauthorized();
        console.log('✅ AuthContext: Dados locais limpos com sucesso');
      } catch (clearError) {
        console.error('⚠️ AuthContext: Erro ao limpar dados locais:', clearError);
        // Continuar mesmo com erro na limpeza
      }
      
      // Depois chamar a API de logout
      try {
        console.log('🔄 AuthContext: Fazendo logout no servidor...');
        await authService.logout();
        console.log('✅ AuthContext: Logout no servidor concluído');
      } catch (logoutError) {
        console.error('⚠️ AuthContext: Erro durante logout no servidor:', logoutError);
        // Continuar mesmo com erro no logout do servidor
      }
      
      // Atualizar o estado independentemente do resultado das operações anteriores
      setUser(null);
      setError(null);
      
      console.log('✅ AuthContext: Logout concluído, redirecionando para login');
      // Aguardar um momento para garantir que a UI seja atualizada
      setTimeout(() => {
        router.push('/login');
        router.refresh(); // Forçar atualização completa da página
      }, 100);
    } catch (err: any) {
      console.error('❌ AuthContext: Erro crítico no processo de logout:', err);
      setError('Ocorreu um erro durante o logout, mas você será redirecionado.');
      
      // Mesmo com erro crítico, fazer o máximo para limpar dados e redirecionar
      setUser(null);
      
      // Ainda tentar redirecionar para login
      setTimeout(() => {
        router.push('/login');
        router.refresh();
      }, 100);
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
      // Normaliza as roles para uppercase para comparação
      const userRoleUppercase = user.role.toUpperCase();
      const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase());
      
      if (!normalizedAllowedRoles.includes(userRoleUppercase)) {
        const dashboardPath = getDashboardPath(userRoleUppercase);
        router.push(dashboardPath || redirectTo);
      }
    }
  }, [user, loading, allowedRoles, router, redirectTo]);

  return {
    user,
    loading,
    hasRole: user ? allowedRoles.map(r => r.toUpperCase()).includes(user.role.toUpperCase()) : false
  };
}
