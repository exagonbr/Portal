import { useState, useEffect, useCallback } from 'react';
import { activitySessionsService, ActivitySession, CreateActivitySessionDto, UpdateActivitySessionDto } from '@/services/activitySessionsService';

export function useActivitySessions() {
  const [sessions, setSessions] = useState<ActivitySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await activitySessionsService.getAllWithPagination(page, limit);
      setSessions(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar sessões');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = useCallback(async (data: CreateActivitySessionDto) => {
    setLoading(true);
    setError(null);
    try {
      const newSession = await activitySessionsService.create(data);
      setSessions(prev => [newSession, ...prev]);
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar sessão');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSession = useCallback(async (id: string, data: UpdateActivitySessionDto) => {
    setLoading(true);
    setError(null);
    try {
      const updatedSession = await activitySessionsService.update(id, data);
      setSessions(prev => prev.map(session => 
        session.id === id ? updatedSession : session
      ));
      return updatedSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar sessão');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await activitySessionsService.delete(id);
      setSessions(prev => prev.filter(session => session.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar sessão');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const endSession = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedSession = await activitySessionsService.endSession(id);
      setSessions(prev => prev.map(session => 
        session.id === id ? updatedSession : session
      ));
      return updatedSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao encerrar sessão');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getActiveSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeSessions = await activitySessionsService.getActiveSessions();
      return activeSessions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar sessões ativas');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserSessions = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const userSessions = await activitySessionsService.getByUserId(userId);
      return userSessions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar sessões do usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateActivity = useCallback(async (id: string, data: { pageViews?: number; actionsCount?: number }) => {
    try {
      const updatedSession = await activitySessionsService.updateActivity(id, data);
      setSessions(prev => prev.map(session => 
        session.id === id ? updatedSession : session
      ));
      return updatedSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar atividade');
      throw err;
    }
  }, []);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    endSession,
    getActiveSessions,
    getUserSessions,
    updateActivity,
  };
}

export function useActivitySession(id?: string) {
  const [session, setSession] = useState<ActivitySession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const sessionData = await activitySessionsService.getById(sessionId);
      setSession(sessionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar sessão');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchSession(id);
    }
  }, [id, fetchSession]);

  return {
    session,
    loading,
    error,
    refetch: () => id && fetchSession(id),
  };
} 