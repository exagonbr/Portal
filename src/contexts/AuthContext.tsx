'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
<<<<<<< HEAD
import apiClient from '../lib/authFetch';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-hot-toast';

// Tipagem para o usuário e o contexto
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}
=======
import { UserEssentials, Permission } from '@/types/auth';
import * as authService from '@/services/authService';
import { getDashboardPath, convertBackendRole, isValidRole } from '@/utils/roleRedirect';
>>>>>>> master

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

<<<<<<< HEAD
// Helper para decodificar o token e extrair dados do usuário
const decodeToken = (token: string): any | null => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Função de logout centralizada
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setUser(null);
    apiClient.post('/auth/logout').catch(err => console.error("Logout API call failed:", err));
    router.push('/login');
    toast.success('Você foi desconectado.');
  }, [router]);

  // Efeito para verificar o token no carregamento inicial
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decodedPayload = decodeToken(token);
      if (decodedPayload && decodedPayload.exp * 1000 > Date.now()) {
        setUser({
          id: decodedPayload.id,
          name: decodedPayload.name,
          email: decodedPayload.email,
          role: decodedPayload.role,
          permissions: decodedPayload.permissions || [],
        });
      } else {
        localStorage.removeItem('accessToken');
      }
=======
interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserEssentials;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserEssentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        setError(response.message || 'Erro ao carregar usuário');
      }
    } catch (err: any) {
      console.error('❌ Erro ao carregar usuário:', err.message);
      setError(err.message || 'Erro ao carregar usuário');
    } finally {
      setLoading(false);
>>>>>>> master
    }
    setIsLoading(false);
  }, []);

<<<<<<< HEAD

  // Função de login
=======
  // Login
>>>>>>> master
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      const { accessToken } = data.data;
      
<<<<<<< HEAD
      localStorage.setItem('accessToken', accessToken);
      const decodedPayload = decodeToken(accessToken);
      if (decodedPayload) {
        setUser({
          id: decodedPayload.id,
          name: decodedPayload.name,
          email: decodedPayload.email,
          role: decodedPayload.role,
          permissions: decodedPayload.permissions || [],
        });
      }
=======
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
>>>>>>> master

      
<<<<<<< HEAD
      toast.success('Login realizado com sucesso!');
      router.push('/dashboard'); // Redireciona para uma página padrão

    } catch (error: any) {
      console.error("Login failed:", error);
      const message = error.response?.data?.message || 'Falha no login. Verifique suas credenciais.';
      toast.error(message, {
        duration: 4000,
        position: 'top-center',
      });
=======
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
>>>>>>> master
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
=======
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

>>>>>>> master
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
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

<<<<<<< HEAD
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
=======
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
>>>>>>> master
