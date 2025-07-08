import { useState, useEffect, useCallback, useRef } from 'react';
import { SessionPersistenceService } from '@/services/sessionPersistenceService';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

interface SessionState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginData {
  accessToken: string;
  refreshToken: string;
  user: User;
  sessionId: string;
  expiresIn?: number;
}

/**
 * Hook para gerenciar sessão persistente
 * Garante que a sessão não seja perdida até logout explícito
 */
export function usePersistentSession() {
  const [sessionState, setSessionState] = useState<SessionState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  const isInitialized = useRef(false);

  /**
   * Carrega sessão existente
   */
  const loadSession = useCallback(() => {
    try {
      const session = SessionPersistenceService.getSession();
      
      if (session && SessionPersistenceService.isSessionValid()) {
        setSessionState({
          user: {
            id: session.userId,
            email: session.email,
            name: session.name,
            role: session.role,
            permissions: session.permissions
          },
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        
        console.log('✅ Sessão persistente carregada:', session.email);
        return true;
      } else {
        setSessionState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar sessão:', error);
      setSessionState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Erro ao carregar sessão'
      });
      return false;
    }
  }, []);

  /**
   * Salva nova sessão após login
   */
  const saveSession = useCallback((loginData: LoginData) => {
    try {
      const now = Date.now();
      const expiresAt = loginData.expiresIn 
        ? now + (loginData.expiresIn * 1000)
        : now + (60 * 60 * 1000); // 1h padrão

      SessionPersistenceService.saveSession({
        userId: loginData.user.id,
        email: loginData.user.email,
        name: loginData.user.name,
        role: loginData.user.role,
        permissions: loginData.user.permissions,
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken,
        sessionId: loginData.sessionId,
        expiresAt: expiresAt,
        refreshExpiresAt: now + (7 * 24 * 60 * 60 * 1000) // 7 dias
      });

      setSessionState({
        user: loginData.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      console.log('✅ Nova sessão salva:', loginData.user.email);
    } catch (error) {
      console.error('❌ Erro ao salvar sessão:', error);
      setSessionState(prev => ({
        ...prev,
        error: 'Erro ao salvar sessão'
      }));
    }
  }, []);

  /**
   * Obtém token de acesso atual (com refresh automático)
   */
  const getCurrentToken = useCallback(async (): Promise<string | null> => {
    try {
      return await SessionPersistenceService.getCurrentAccessToken();
    } catch (error) {
      console.error('❌ Erro ao obter token:', error);
      return null;
    }
  }, []);

  /**
   * Força refresh do token
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const result = await SessionPersistenceService.refreshAccessToken();
      
      if (result.success) {
        // Recarregar estado da sessão
        loadSession();
        return true;
      } else {
        console.error('❌ Falha no refresh:', result.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro no refresh:', error);
      return false;
    }
  }, [loadSession]);

  /**
   * Logout completo
   */
  const logout = useCallback(async () => {
    try {
      setSessionState(prev => ({ ...prev, isLoading: true }));
      
      await SessionPersistenceService.forceLogout();
      
      setSessionState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro durante logout:', error);
      
      // Mesmo com erro, limpar estado local
      setSessionState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Erro durante logout, mas sessão local foi limpa'
      });
    }
  }, []);

  /**
   * Verifica se a sessão ainda é válida
   */
  const checkSessionValidity = useCallback((): boolean => {
    return SessionPersistenceService.isSessionValid();
  }, []);

  /**
   * Limpa erros
   */
  const clearError = useCallback(() => {
    setSessionState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Atualiza atividade (para manter sessão ativa)
   */
  const updateActivity = useCallback(() => {
    SessionPersistenceService.updateActivity();
  }, []);

  // Efeito para carregar sessão na inicialização
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      loadSession();
    }
  }, [loadSession]);

  // Efeito para monitorar eventos de storage (sincronizar entre abas)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'session_data' || event.key === 'last_activity') {
        // Recarregar sessão quando houver mudanças
        loadSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadSession]);

  // Efeito para atualizar atividade em eventos do usuário
  useEffect(() => {
    if (!sessionState.isAuthenticated) return;

    const updateActivityOnInteraction = () => {
      updateActivity();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivityOnInteraction, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivityOnInteraction);
      });
    };
  }, [sessionState.isAuthenticated, updateActivity]);

  // Efeito para cleanup na desmontagem
  useEffect(() => {
    return () => {
      // Não parar o monitoramento na desmontagem do componente
      // O serviço deve continuar rodando em background
    };
  }, []);

  return {
    // Estado da sessão
    user: sessionState.user,
    isAuthenticated: sessionState.isAuthenticated,
    isLoading: sessionState.isLoading,
    error: sessionState.error,
    
    // Ações
    saveSession,
    logout,
    refreshToken,
    getCurrentToken,
    updateActivity,
    checkSessionValidity,
    clearError,
    
    // Utilitários
    loadSession
  };
} 