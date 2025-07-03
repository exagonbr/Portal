'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserEssentials, Permission } from '@/types/auth';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: UserEssentials | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  handleGoogleLogin: (token: string) => Promise<void>;
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

/**
 * 🔐 AUTENTICAÇÃO UNIFICADA - FRONTEND
 * 
 * ✅ Access token no localStorage
 * ✅ Refresh token em cookie httpOnly
 * ✅ authFetch() automático para todas requisições
 * ✅ Auto-refresh quando token expira
 * ✅ Sem loops de redirecionamento
 */

// URLs da API
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.sabercon.com.br' 
  : 'http://localhost:3001';

/**
 * 🌐 FETCH UNIFICADO COM AUTENTICAÇÃO
 * Adiciona automaticamente o Bearer token e trata refresh
 */
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = localStorage.getItem('accessToken');
  
  // Adicionar Authorization header se há token
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(accessToken && { Authorization: `Bearer ${accessToken}` })
  };

  // Primeira tentativa
  let response = await fetch(url, {
    ...options,
    headers
  });

  // Se token expirado (401), tentar refresh
  if (response.status === 401 && accessToken) {
    console.log('🔄 Token expirado, tentando refresh...');
    
    try {
      const refreshResponse = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include' // Incluir cookies
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        
        if (refreshData.success && refreshData.data.accessToken) {
          // Salvar novo token
          localStorage.setItem('accessToken', refreshData.data.accessToken);
          
          // Tentar novamente com novo token
          console.log('✅ Token renovado, tentando requisição novamente...');
          response = await fetch(url, {
            ...options,
            headers: {
              ...headers,
              Authorization: `Bearer ${refreshData.data.accessToken}`
            }
          });
        }
      } else {
        // Refresh falhou, limpar tokens e redirecionar
        console.log('❌ Refresh falhou, redirecionando para login...');
        localStorage.removeItem('accessToken');
        window.location.href = '/auth/login';
        throw new Error('Sessão expirada');
      }
    } catch (refreshError) {
      console.error('❌ Erro no refresh:', refreshError);
      localStorage.removeItem('accessToken');
      window.location.href = '/auth/login';
      throw refreshError;
    }
  }

  return response;
}

/**
 * Wrapper que garante que o AuthProvider está pronto antes de renderizar children
 */
export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Renderizar versão simplificada no servidor
  if (!mounted) {
    return <AuthProvider isInitializing={true}>{children}</AuthProvider>;
  }

  // Renderizar versão completa no cliente
  return <AuthProvider isInitializing={false}>{children}</AuthProvider>;
}

export function AuthProvider({ children, isInitializing = false }: { children: React.ReactNode; isInitializing?: boolean }) {
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
   * 🧹 Limpar erro
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 👤 Buscar dados do usuário atual
   */
  const fetchCurrentUser = useCallback(async () => {
    // Verificar se estamos no cliente
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await authFetch(`${API_BASE}/api/auth/me`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data.user) {
          setUser(data.data.user);
          setError(null);
          console.log('✅ Usuário autenticado:', data.data.user.email);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
        localStorage.removeItem('accessToken');
      }
    } catch (err) {
      console.error('❌ Erro ao buscar usuário:', err);
      setUser(null);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🔄 Inicialização - verificar sessão existente
   */
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  /**
   * 🎯 LOGIN
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Incluir cookies para refresh token
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Salvar access token no localStorage
        localStorage.setItem('accessToken', data.data.accessToken);
        
        // Definir usuário
        setUser(data.data.user);
        
        console.log('✅ Login realizado com sucesso:', data.data.user.email);
        
        // Redirecionar baseado no role
        const dashboardPath = getDashboardPath(data.data.user.role);
        router.push(dashboardPath);
      } else {
        setError(data.message || 'Erro no login');
      }
    } catch (err) {
      console.error('❌ Erro no login:', err);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * 🎯 LOGIN COM GOOGLE
   */
  const handleGoogleLogin = useCallback(async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Salvar access token no localStorage
        localStorage.setItem('accessToken', data.data.accessToken);
        
        // Definir usuário
        setUser(data.data.user);
        
        console.log('✅ Login Google realizado com sucesso:', data.data.user.email);
        
        // Redirecionar baseado no role
        const dashboardPath = getDashboardPath(data.data.user.role);
        router.push(dashboardPath);
      } else {
        setError(data.message || 'Erro no login com Google');
      }
    } catch (err) {
      console.error('❌ Erro no login Google:', err);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * 📝 REGISTRO
   */
  const register = useCallback(async (name: string, email: string, password: string, type: 'student' | 'teacher') => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, type })
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Salvar access token no localStorage
        localStorage.setItem('accessToken', data.data.accessToken);
        
        // Definir usuário
        setUser(data.data.user);
        
        console.log('✅ Registro realizado com sucesso:', data.data.user.email);
        
        // Redirecionar baseado no role
        const dashboardPath = getDashboardPath(data.data.user.role);
        router.push(dashboardPath);
      } else {
        setError(data.message || 'Erro no registro');
      }
    } catch (err) {
      console.error('❌ Erro no registro:', err);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * 🚪 LOGOUT
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);

      // Chamar API de logout
      await authFetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST'
      });

    } catch (err) {
      console.error('❌ Erro no logout:', err);
    } finally {
      // Sempre limpar dados locais
      localStorage.removeItem('accessToken');
      setUser(null);
      setError(null);
      setLoading(false);
      
      console.log('🚪 Logout realizado');
      router.push('/auth/login');
    }
  }, [router]);

  /**
   * 🔄 Atualizar dados do usuário
   */
  const refreshUser = useCallback(async () => {
    await fetchCurrentUser();
  }, [fetchCurrentUser]);

  /**
   * 🔐 Verificações de permissão
   */
  const hasPermission = useCallback((permission: string): boolean => {
    return user?.permissions?.includes(permission) || user?.role === 'SYSTEM_ADMIN' || false;
  }, [user]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    if (user?.role === 'SYSTEM_ADMIN') return true;
    return permissions.some(permission => user?.permissions?.includes(permission));
  }, [user]);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    if (user?.role === 'SYSTEM_ADMIN') return true;
    return permissions.every(permission => user?.permissions?.includes(permission));
  }, [user]);

  const hasRole = useCallback((role: string): boolean => {
    return user?.role === role || user?.role === 'SYSTEM_ADMIN';
  }, [user]);

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    clearError,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    handleGoogleLogin,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 🪝 Hook para usar o contexto de autenticação
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

/**
 * 🪝 Hook seguro para usar o contexto de autenticação
 * Retorna undefined se o contexto não estiver disponível (útil para componentes que podem renderizar antes do provider)
 */
export function useAuthSafe() {
  const context = useContext(AuthContext);
  return context; // Retorna undefined se não estiver dentro do provider
}

/**
 * 🛡️ Hook para rotas que requerem autenticação
 */
export function useRequireAuth(redirectTo = '/auth/login') {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, router, redirectTo]);

  return { isAuthenticated, loading };
}

/**
 * 👥 Hook para rotas que requerem roles específicas
 */
export function useRequireRole(allowedRoles: string[], redirectTo = '/dashboard') {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const hasRequiredRole = allowedRoles.some(role => hasRole(role));
      if (!hasRequiredRole) {
        router.push(redirectTo);
      }
    }
  }, [user, loading, allowedRoles, hasRole, router, redirectTo]);

  return { user, loading };
}

// Helper para determinar rota do dashboard baseado no role
function getDashboardPath(role: string): string {
  switch (role) {
    case 'SYSTEM_ADMIN':
      return '/dashboard/system-admin';
    case 'INSTITUTION_MANAGER':
      return '/dashboard/admin';
    case 'COORDINATOR':
      return '/coordinator/dashboard';
    case 'TEACHER':
      return '/dashboard/teacher';
    case 'STUDENT':
      return '/dashboard/student';
    case 'GUARDIAN':
      return '/guardian/dashboard';
    default:
      return '/dashboard';
  }
}

// Exportar authFetch para uso em outros componentes
export { authFetch };
