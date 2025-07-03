'use client';

import { useState, useEffect, useCallback } from 'react';
import { ActiveSession } from '../services/sessionService';

interface SessionStats {
  activeUsers: number;
  activeSessions: number;
}

interface UseSessionMonitorReturn {
  stats: SessionStats;
  sessions: ActiveSession[];
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  refreshUserSessions: (userId: string) => Promise<void>;
  removeSession: (sessionId: string) => Promise<boolean>;
  removeAllUserSessions: (userId: string) => Promise<boolean>;
  cleanupExpiredSessions: () => Promise<number>;
}

export const useSessionMonitor = (userId?: string): UseSessionMonitorReturn => {
  const [stats, setStats] = useState<SessionStats>({ activeUsers: 0, activeSessions: 0 });
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega estatísticas gerais
  const refreshStats = useCallback(async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setError(null);
      } else {
        throw new Error('Falha ao carregar estatísticas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, []);

  // Carrega sessões de um usuário específico
  const refreshUserSessions = useCallback(async (targetUserId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sessions?userId=${targetUserId}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
        setError(null);
      } else {
        throw new Error('Falha ao carregar sessões do usuário');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao carregar sessões do usuário:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove uma sessão específica
  const removeSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
        await refreshStats();
        setError(null);
        return true;
      } else {
        throw new Error('Falha ao remover sessão');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao remover sessão:', err);
      return false;
    }
  }, [refreshStats]);

  // Remove todas as sessões de um usuário
  const removeAllUserSessions = useCallback(async (targetUserId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sessions?userId=${targetUserId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSessions([]);
        await refreshStats();
        setError(null);
        return true;
      } else {
        throw new Error('Falha ao remover sessões do usuário');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao remover sessões do usuário:', err);
      return false;
    }
  }, [refreshStats]);

  // Limpa sessões expiradas
  const cleanupExpiredSessions = useCallback(async (): Promise<number> => {
    try {
      const response = await fetch('/api/sessions?action=cleanup', {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        await refreshStats();
        if (userId) {
          await refreshUserSessions(userId);
        }
        setError(null);
        return data.cleanedCount || 0;
      } else {
        throw new Error('Falha ao limpar sessões expiradas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao limpar sessões expiradas:', err);
      return 0;
    }
  }, [refreshStats, refreshUserSessions, userId]);

  // Carrega dados iniciais
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // Carrega sessões do usuário quando userId muda
  useEffect(() => {
    if (userId) {
      refreshUserSessions(userId);
    } else {
      setSessions([]);
      setLoading(false);
    }
  }, [userId, refreshUserSessions]);

  // Auto-refresh das estatísticas a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshStats]);

  // Auto-refresh das sessões do usuário a cada 60 segundos
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      refreshUserSessions(userId);
    }, 60000);

    return () => clearInterval(interval);
  }, [userId, refreshUserSessions]);

  return {
    stats,
    sessions,
    loading,
    error,
    refreshStats,
    refreshUserSessions,
    removeSession,
    removeAllUserSessions,
    cleanupExpiredSessions,
  };
};

// Hook para validar sessão atual
export const useSessionValidation = () => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const validateCurrentSession = useCallback(async () => {
    try {
      setLoading(true);
      
      // Recupera session ID do localStorage ou cookie
      const sessionId = localStorage.getItem('session_id') || 
                       document.cookie
                         .split('; ')
                         .find(row => row.startsWith('session_id='))
                         ?.split('=')[1];

      if (!sessionId) {
        setIsValid(false);
        return false;
      }

      const response = await fetch('/api/sessions/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();
      setIsValid(data.valid);
      return data.valid;
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      setIsValid(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const extendCurrentSession = useCallback(async (extendBy?: number) => {
    try {
      const sessionId = localStorage.getItem('session_id') || 
                       document.cookie
                         .split('; ')
                         .find(row => row.startsWith('session_id='))
                         ?.split('=')[1];

      if (!sessionId) {
        return false;
      }

      const response = await fetch('/api/sessions/validate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, extendBy }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao estender sessão:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    validateCurrentSession();
  }, [validateCurrentSession]);

  // Valida sessão a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      validateCurrentSession();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [validateCurrentSession]);

  return {
    isValid,
    loading,
    validateCurrentSession,
    extendCurrentSession,
  };
};

export default useSessionMonitor;
