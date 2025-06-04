'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserEssentials, Permission } from '@/types/auth';
import * as authService from '@/services/authService';
import { getDashboardPath, convertBackendRole, isValidRole, getDashboardByPermissions } from '@/utils/roleRedirect';

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

interface AuthResponse {
  success: boolean;
  user?: UserEssentials;
  message?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserEssentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Carrega o usuário dos cookies ou localStorage no carregamento inicial
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        const userData = getUserFromStorage();
        if (userData) {
          setUser(userData);
        }
      } catch (err) {
        console.error('❌ Erro ao inicializar autenticação:', err);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // Helper para obter o usuário do localStorage
  const getUserFromStorage = (): UserEssentials | null => {
    try {
      const userDataStr = localStorage.getItem('user_data');
      if (!userDataStr) return null;
      
      const userData = JSON.parse(userDataStr);
      if (!userData || !userData.id || !userData.email) return null;
      
      console.log('✅ Usuário restaurado do localStorage:', userData.name);
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        permissions: userData.permissions || []
      };
    } catch (err) {
      console.error('❌ Erro ao recuperar usuário do localStorage:', err);
      return null;
    }
  };

  // Função para redirecionar com base na role e permissões
  const handleRedirect = (role: string, source: string = 'unknown') => {
    if (!role) {
      console.warn('⚠️ handleRedirect: Role não definida, não redirecionando');
      return;
    }
    
    try {
      // Recupera permissões do usuário
      const permissions = user?.permissions || [];
      
      // Obtém o dashboard baseado nas permissões e role
      let dashboardPath;
      if (permissions.length > 0) {
        dashboardPath = getDashboardByPermissions(role, permissions);
        console.log(`✅ Redirecionamento baseado em permissões: ${dashboardPath}`);
      } else {
        // Fallback para redirecionamento baseado apenas em role
        dashboardPath = getDashboardPath(role);
        console.log(`✅ Redirecionamento baseado apenas em role: ${dashboardPath}`);
      }
      
      if (dashboardPath) {
        console.log(`🔄 Redirecionando para ${dashboardPath} (origem: ${source})`);
        router.push(dashboardPath);
      } else {
        console.warn(`⚠️ Não foi possível determinar dashboard para ${role}, usando padrão`);
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('❌ Erro ao redirecionar:', err);
      router.push('/dashboard');
    }
  };

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
        console.log('🔑 Permissões:', response.user.permissions || []);
        
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

  // Registro
  const register = async (name: string, email: string, password: string, type: 'student' | 'teacher') => {
    try {
      setLoading(true);
      setError(null);
      
      // Implementação real: chamar API de registro
      throw new Error('Registro não implementado');
      
    } catch (err: any) {
      console.error('❌ Erro no registro:', err);
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
      
      // Chama serviço de logout
      const auth = new authService.AuthService();
      auth.logout();
      
      // Limpa estado
      setUser(null);
      
      // Redireciona para página de login
      router.push('/login');
      
    } catch (err) {
      console.error('❌ Erro ao fazer logout:', err);
    } finally {
      setLoading(false);
    }
  };

  // Atualiza dados do usuário
  const refreshUser = async () => {
    try {
      setLoading(true);
      
      const userData = getUserFromStorage();
      if (userData) {
        setUser(userData);
      }
      
    } catch (err) {
      console.error('❌ Erro ao atualizar usuário:', err);
    } finally {
      setLoading(false);
    }
  };

  // Verifica se o usuário tem uma permissão específica
  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) {
      return false;
    }
    return user.permissions.includes(permission);
  };

  // Verifica se o usuário tem pelo menos uma das permissões
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user || !user.permissions) {
      return false;
    }
    return permissions.some(p => user.permissions?.includes(p));
  };

  // Verifica se o usuário tem todas as permissões
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user || !user.permissions) {
      return false;
    }
    return permissions.every(p => user.permissions?.includes(p));
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider };

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
