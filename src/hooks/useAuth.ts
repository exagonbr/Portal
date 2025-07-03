'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  institutionId: string | null;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  expiresIn: number;
  rememberMe: boolean;
}

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  logout: (logoutAll?: boolean) => Promise<void>;
  refreshToken: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  updateSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!session;

  // Salvar dados no localStorage
  const saveToStorage = useCallback((authData: AuthSession) => {
    try {
      localStorage.setItem('auth_session', JSON.stringify(authData));
      localStorage.setItem('auth_user', JSON.stringify(authData.user));
      localStorage.setItem('auth_token', authData.accessToken);
      localStorage.setItem('refresh_token', authData.refreshToken);
      localStorage.setItem('session_id', authData.sessionId);
      localStorage.setItem('user_role', authData.user.role);
      localStorage.setItem('user_permissions', JSON.stringify(authData.user.permissions));
    } catch (error) {
      console.error('❌ [AUTH] Erro ao salvar no localStorage:', error);
    }
  }, []);

  // Limpar dados do localStorage
  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem('auth_session');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('session_id');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_permissions');
    } catch (error) {
      console.error('❌ [AUTH] Erro ao limpar localStorage:', error);
    }
  }, []);

  // Carregar dados do localStorage
  const loadFromStorage = useCallback(() => {
    try {
      const sessionData = localStorage.getItem('auth_session');
      const userData = localStorage.getItem('auth_user');
      
      if (sessionData && userData) {
        const parsedSession = JSON.parse(sessionData);
        const parsedUser = JSON.parse(userData);
        
        setSession(parsedSession);
        setUser(parsedUser);
        return true;
      }
    } catch (error) {
      console.error('❌ [AUTH] Erro ao carregar do localStorage:', error);
      clearStorage();
    }
    return false;
  }, [clearStorage]);

  // Função de login
  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const authSession: AuthSession = {
          user: data.data.user,
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          sessionId: data.data.sessionId,
          expiresIn: data.data.expiresIn,
          rememberMe: data.data.rememberMe
        };

        setUser(data.data.user);
        setSession(authSession);
        saveToStorage(authSession);

        console.log('✅ [AUTH] Login realizado com sucesso');
        return { success: true };
      } else {
        console.error('❌ [AUTH] Falha no login:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      console.error('❌ [AUTH] Erro no login:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setIsLoading(false);
    }
  }, [saveToStorage]);

  // Função de logout
  const logout = useCallback(async (logoutAll = false) => {
    try {
      setIsLoading(true);
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logoutAll }),
      });

      setUser(null);
      setSession(null);
      clearStorage();

      console.log('✅ [AUTH] Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ [AUTH] Erro no logout:', error);
      // Limpar dados localmente mesmo com erro
      setUser(null);
      setSession(null);
      clearStorage();
    } finally {
      setIsLoading(false);
    }
  }, [clearStorage]);

  // Função para renovar token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const currentRefreshToken = localStorage.getItem('refresh_token');
      
      if (!currentRefreshToken) {
        return false;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const updatedSession: AuthSession = {
          ...session!,
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken || currentRefreshToken,
          user: data.data.user
        };

        setSession(updatedSession);
        setUser(data.data.user);
        saveToStorage(updatedSession);

        console.log('✅ [AUTH] Token renovado com sucesso');
        return true;
      } else {
        console.error('❌ [AUTH] Falha na renovação do token');
        await logout();
        return false;
      }
    } catch (error) {
      console.error('❌ [AUTH] Erro na renovação do token:', error);
      await logout();
      return false;
    }
  }, [session, saveToStorage, logout]);

  // Função para atualizar sessão
  const updateSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.authenticated && data.data) {
        setUser(data.data.user);
        
        if (session) {
          const updatedSession: AuthSession = {
            ...session,
            user: data.data.user
          };
          setSession(updatedSession);
          saveToStorage(updatedSession);
        }

        console.log('✅ [AUTH] Sessão atualizada');
      } else if (!data.authenticated) {
        await logout();
      }
    } catch (error) {
      console.error('❌ [AUTH] Erro ao atualizar sessão:', error);
    }
  }, [session, saveToStorage, logout]);

  // Verificar permissão
  const hasPermission = useCallback((permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  }, [user]);

  // Verificar papel
  const hasRole = useCallback((role: string): boolean => {
    return user?.role === role;
  }, [user]);

  // Inicializar autenticação
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      // Tentar carregar do localStorage
      const hasStoredData = loadFromStorage();
      
      if (hasStoredData) {
        // Validar sessão no servidor
        try {
          const response = await fetch('/api/auth/session', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();

          if (!data.success || !data.authenticated) {
            // Sessão inválida, limpar dados
            setUser(null);
            setSession(null);
            clearStorage();
          }
        } catch (error) {
          console.error('❌ [AUTH] Erro ao validar sessão:', error);
          // Em caso de erro, manter dados locais
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, [loadFromStorage, clearStorage]);

  // Auto-renovação de token
  useEffect(() => {
    if (!session || !isAuthenticated) return;

    const tokenExpiry = session.expiresIn * 1000; // Converter para ms
    const refreshTime = tokenExpiry - (5 * 60 * 1000); // 5 minutos antes de expirar
    const now = Date.now();
    const timeUntilRefresh = refreshTime - now;

    if (timeUntilRefresh > 0) {
      const refreshTimer = setTimeout(() => {
        refreshToken();
      }, timeUntilRefresh);

      return () => clearTimeout(refreshTimer);
    } else {
      // Token já expirou, tentar renovar imediatamente
      refreshToken();
    }
  }, [session, isAuthenticated, refreshToken]);

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    hasPermission,
    hasRole,
    updateSession,
  };
}

export { AuthContext };