'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserEssentials, Permission } from '@/types/auth';
import * as authService from '@/services/auth';
import { getDashboardPath } from '@/utils/roleRedirect';
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
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // CORREÇÃO: Usar getCurrentUser diretamente sem timeout - é síncrono
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        console.log('✅ Usuário encontrado na sessão:', currentUser.email, currentUser.role);
        setUser(currentUser);
        setError(null);
      } else {
        console.log('ℹ️ Nenhum usuário na sessão');
        setUser(null);
      }
      
    } catch (err) {
      console.error('❌ Erro ao buscar usuário da sessão:', err);
      setUser(null);
      setError(null); // Não definir erro para não afetar UX
    } finally {
      setLoading(false);
    }
  }, [mounted]);

  /**
   * Inicialização do contexto - verificar sessão existente
   */
  useEffect(() => {
    if (mounted && !isInitializing) {
      // CORREÇÃO: Adicionar delay para evitar execução imediata
      const timeoutId = setTimeout(() => {
        fetchCurrentUser();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else if (!mounted) {
      // No servidor, definir loading como false
      setLoading(false);
    }
  }, [mounted, fetchCurrentUser, isInitializing]);

  /**
   * Função de redirecionamento segura com controle de loop
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
        
        // Controle de loop mais robusto
        const redirectKey = 'auth_redirect_count';
        const redirectCountStr = sessionStorage.getItem(redirectKey) || '0';
        const redirectCount = parseInt(redirectCountStr);
        
        // Se já redirecionou muitas vezes, usar rota de emergência
        if (redirectCount >= 3) {
          console.warn('🚨 Muitos redirecionamentos detectados, usando rota de emergência');
          sessionStorage.removeItem(redirectKey);
          
          // Rota de emergência baseada no contexto
          const emergencyRoute = currentPath.includes('/login') ? '/portal/books' : '/auth/login?reset=true';
          window.location.href = emergencyRoute;
          return;
        }
        
        // Incrementar contador de redirecionamentos
        sessionStorage.setItem(redirectKey, (redirectCount + 1).toString());
        
        // Limpar contador após 30 segundos
        setTimeout(() => {
          sessionStorage.removeItem(redirectKey);
        }, 30000);
        
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
        console.log('🔐 Login bem-sucedido:', response.user.full_name, 'Role:', response.user.role);
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
        console.log('🔐 Registro bem-sucedido:', response.user.full_name, 'Role:', response.user.role);
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
   * Login com Google
   */
  const handleGoogleLogin = useCallback(async (token: string) => {
    try {
      console.log('🔐 AuthContext: Iniciando login com Google');
      setLoading(true);
      setError(null);

      // 1. Salvar o token
      authService.setAuthToken(token);

      // 2. Decodificar o token
      const decodedUser = jwtDecode<UserEssentials>(token);

      // 3. Atualizar o estado do usuário
      setUser(decodedUser);
      setError(null);

      // 4. Redirecionar
      const normalizedRole = decodedUser.role?.toLowerCase();
      const dashboardPath = getDashboardPath(normalizedRole);
      safeRedirect(dashboardPath || '/dashboard/student');

    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao fazer login com Google';
      console.error('❌ Erro no login com Google:', errorMessage);
      setError(errorMessage);
      await logout(); // Limpar tudo em caso de erro
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [safeRedirect]);

  /**
   * Logout do usuário - Limpeza completa melhorada
   */
  const logout = useCallback(async () => {
    try {
      console.log('🔐 AuthContext: Iniciando ULTRA LOGOUT...');
      setLoading(true);
      
      // Limpar estado local primeiro
      setUser(null);
      setError(null);
      
      // Usar o serviço de ultra logout
      const { performUltraLogout } = await import('../services/ultraLogoutService');
      await performUltraLogout();
      
      return; // O UltraLogoutService já faz tudo, incluindo redirecionamento
      
      // Função para limpeza completa de dados
      const performCompleteCleanup = async () => {
        if (typeof window === 'undefined') return;
        
        console.log('🧹 Iniciando limpeza completa de dados...');
        
        // 1. Limpar localStorage
        try {
          const localStorageKeys = [
            'auth_token',
            'refresh_token',
            'session_id',
            'user',
            'user_data',
            'auth_expires_at',
            'next-auth.session-token',
            'next-auth.csrf-token',
            '__Secure-next-auth.session-token',
            '__Host-next-auth.csrf-token',
            'selectedRole',
            'theme',
            'user_preferences',
            'cached_data',
            'app_cache'
          ];
          
          localStorageKeys.forEach(key => {
            localStorage.removeItem(key);
          });
          
          console.log('✅ localStorage limpo');
        } catch (error) {
          console.warn('⚠️ Erro ao limpar localStorage:', error);
          // Fallback: limpar tudo
          try {
            localStorage.clear();
          } catch (fallbackError) {
            console.error('❌ Erro no fallback do localStorage:', fallbackError);
          }
        }
        
        // 2. Limpar sessionStorage
        try {
          sessionStorage.clear();
          console.log('✅ sessionStorage limpo');
        } catch (error) {
          console.warn('⚠️ Erro ao limpar sessionStorage:', error);
        }
        
        // 3. Limpar cookies de forma abrangente
        try {
          const cookiesToClear = [
            'auth_token',
            'refresh_token',
            'session_id',
            'user_data',
            'next-auth.session-token',
            'next-auth.csrf-token',
            '__Secure-next-auth.session-token',
            '__Host-next-auth.csrf-token',
            'redirect_count',
            'theme',
            'user_preferences'
          ];
          
          cookiesToClear.forEach(cookieName => {
            // Limpar para diferentes configurações de path e domain
            const domains = ['', window.location.hostname, `.${window.location.hostname}`];
            const paths = ['/', ''];
            
            domains.forEach(domain => {
              paths.forEach(path => {
                const domainPart = domain ? `;domain=${domain}` : '';
                const pathPart = path ? `;path=${path}` : '';
                
                // Limpar com diferentes configurações de segurança
                document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT${pathPart}${domainPart}`;
                document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT${pathPart}${domainPart};secure`;
                document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT${pathPart}${domainPart};httponly`;
                document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT${pathPart}${domainPart};secure;httponly`;
              });
            });
          });
          
          console.log('✅ Cookies limpos');
        } catch (error) {
          console.warn('⚠️ Erro ao limpar cookies:', error);
        }
        
        // 4. Limpar caches do navegador (se suportado)
        try {
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map(cacheName => caches.delete(cacheName))
            );
            console.log('✅ Caches do navegador limpos');
          }
        } catch (error) {
          console.warn('⚠️ Erro ao limpar caches do navegador:', error);
        }
        
        // 5. Limpar IndexedDB (se existir)
        try {
          if ('indexedDB' in window) {
            // Tentar limpar databases conhecidos
            const dbNames = ['app_cache', 'user_data', 'offline_data'];
            for (const dbName of dbNames) {
              try {
                const deleteRequest = indexedDB.deleteDatabase(dbName);
                await new Promise((resolve, reject) => {
                  deleteRequest.onsuccess = () => resolve(undefined);
                  deleteRequest.onerror = () => reject(deleteRequest.error);
                });
              } catch (dbError) {
                console.warn(`⚠️ Erro ao limpar IndexedDB ${dbName}:`, dbError);
              }
            }
            console.log('✅ IndexedDB limpo');
          }
        } catch (error) {
          console.warn('⚠️ Erro ao limpar IndexedDB:', error);
        }
        
        // 6. Invalidar Service Worker cache
        try {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'CLEAR_CACHE',
              payload: { reason: 'logout' }
            });
            console.log('✅ Service Worker notificado para limpar cache');
          }
        } catch (error) {
          console.warn('⚠️ Erro ao notificar Service Worker:', error);
        }
        
        console.log('✅ Limpeza completa de dados finalizada');
      };
      
      // Executar limpeza completa
      await performCompleteCleanup();
      
      // Chamar serviço de logout (limpa sessão no backend)
      try {
        await authService.logout();
        console.log('✅ Logout no backend realizado');
      } catch (backendError) {
        console.warn('⚠️ Erro no logout do backend:', backendError);
        // Continuar mesmo se o backend falhar
      }
      
      // Aguardar um pouco para garantir que tudo foi processado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirecionar para login com parâmetro de logout
      console.log('🎯 Redirecionando para login após logout completo');
      safeRedirect('/auth/login?logout=true');
      
    } catch (err: any) {
      console.error('❌ Erro no logout:', err);
      
      // Garantir limpeza de emergência mesmo com erro
      try {
        setUser(null);
        setError(null);
        
        if (typeof window !== 'undefined') {
          // Limpeza de emergência
          localStorage.clear();
          sessionStorage.clear();
          
          // Limpar cookies principais
          const mainCookies = ['auth_token', 'session_id', 'user_data'];
          mainCookies.forEach(cookie => {
            document.cookie = `${cookie}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          });
        }
      } catch (cleanupError) {
        console.error('❌ Erro na limpeza de emergência:', cleanupError);
      }
      
      // Redirecionar mesmo com erro
      safeRedirect('/auth/login?logout=true&error=cleanup_failed');
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
    loading: loading || isInitializing, // Include initialization loading
    error,
    isAuthenticated,
    login,
    handleGoogleLogin,
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
 * Hook para usar o contexto de autenticação com melhor tratamento de loading
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Em vez de lançar erro imediatamente, verificar se estamos em um estado de loading
    if (typeof window !== 'undefined') {
      console.warn('⚠️ useAuth: Contexto não encontrado, possivelmente ainda carregando...');
      console.warn('⚠️ Certifique-se de que o componente está dentro de um AuthProvider');
    }
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

/**
 * Hook seguro para usar o contexto de autenticação que não falha durante loading
 */
export function useAuthSafe() {
  const context = useContext(AuthContext);
  return context; // Retorna undefined se não estiver disponível
}

/**
 * Hook para exigir autenticação - Simplificado
 */
export function useRequireAuth(redirectTo = '/auth/login') {
  const authContext = useAuthSafe();
  const router = useRouter();
  
  // Mover hooks para fora da condição
  useEffect(() => {
    if (!authContext) return;
    
    const { user, loading } = authContext;
    
    if (!loading && !user) {
      console.log('🔐 useRequireAuth: Usuário não autenticado, redirecionando...');
      
      // Redirecionar diretamente sem limpeza adicional
      const redirectUrl = redirectTo.includes('?')
        ? `${redirectTo}&error=unauthorized`
        : `${redirectTo}?error=unauthorized`;
      
      router.replace(redirectUrl);
    }
  }, [authContext, router, redirectTo]);

  // Se o contexto não estiver disponível, aguardar
  if (!authContext) {
    return { user: null, loading: true, isAuthenticated: false };
  }
  
  const { user, loading } = authContext;

  return { user, loading, isAuthenticated: !!user };
}

/**
 * Hook para exigir roles específicas
 */
export function useRequireRole(allowedRoles: string[], redirectTo = '/dashboard') {
  const authContext = useAuthSafe();
  const router = useRouter();
  
  // Mover hooks para fora da condição
  useEffect(() => {
    if (!authContext) return;
    
    const { user, loading, hasRole } = authContext;
    const hasAllowedRole = allowedRoles.some(role => hasRole(role));

    if (!loading && user && !hasAllowedRole) {
      console.log(`🔐 useRequireRole: Usuário não tem role permitida. Role atual: ${user.role}, Permitidas: ${allowedRoles.join(', ')}`);
      
      // Redirecionar para dashboard apropriado baseado na role atual
      const normalizedRole = user.role?.toLowerCase();
      const dashboardPath = getDashboardPath(normalizedRole);
      
      router.replace(dashboardPath || redirectTo);
    }
  }, [authContext, allowedRoles, router, redirectTo]);

  // Se o contexto não estiver disponível, aguardar
  if (!authContext) {
    return { user: null, loading: true, hasRole: false, isAuthenticated: false };
  }
  
  const { user, loading, hasRole } = authContext;
  const hasAllowedRole = allowedRoles.some(role => hasRole(role));

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
  const authContext = useAuthSafe();
  const router = useRouter();
  
  // Mover hooks para fora da condição
  useEffect(() => {
    if (!authContext) return;
    
    const { user, loading, hasAllPermissions } = authContext;
    const hasRequiredPermissions = hasAllPermissions(requiredPermissions);

    if (!loading && user && !hasRequiredPermissions) {
      console.log(`🔐 useRequirePermission: Usuário não tem permissões necessárias. Permissões: ${requiredPermissions.join(', ')}`);
      
      // Redirecionar para dashboard apropriado
      const normalizedRole = user.role?.toLowerCase();
      const dashboardPath = getDashboardPath(normalizedRole);
      
      router.replace(dashboardPath || redirectTo);
    }
  }, [authContext, requiredPermissions, router, redirectTo]);

  // Se o contexto não estiver disponível, aguardar
  if (!authContext) {
    return { user: null, loading: true, hasPermissions: false, isAuthenticated: false };
  }
  
  const { user, loading, hasAllPermissions } = authContext;
  const hasRequiredPermissions = hasAllPermissions(requiredPermissions);

  return {
    user,
    loading,
    hasPermissions: hasRequiredPermissions,
    isAuthenticated: !!user
  };
}
