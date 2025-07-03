'use client';

import React, { useState, useEffect } from 'react';
import { ActiveSession } from '../../services/sessionService';

interface SessionStats {
  activeUsers: number;
  activeSessions: number;
}

const SessionManager: React.FC = () => {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [stats, setStats] = useState<SessionStats>({ activeUsers: 0, activeSessions: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Carrega estatísticas gerais
  const loadStats = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.log('Erro ao carregar estatísticas:', error);
    }
  };

  // Carrega sessões de um usuário específico
  const loadUserSessions = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sessions?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      } else {
        setError('Erro ao carregar sessões do usuário');
      }
    } catch (error) {
      console.log('Erro ao carregar sessões:', error);
      setError('Erro ao carregar sessões');
    } finally {
      setLoading(false);
    }
  };

  // Remove uma sessão específica
  const removeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
        await loadStats(); // Atualiza estatísticas
        setError('');
      } else {
        setError('Erro ao remover sessão');
      }
    } catch (error) {
      console.log('Erro ao remover sessão:', error);
      setError('Erro ao remover sessão');
    }
  };

  // Remove todas as sessões de um usuário
  const removeAllUserSessions = async (userId: string) => {
    try {
      const response = await fetch(`/api/sessions?userId=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSessions([]);
        await loadStats(); // Atualiza estatísticas
        setError('');
      } else {
        setError('Erro ao remover sessões do usuário');
      }
    } catch (error) {
      console.log('Erro ao remover sessões:', error);
      setError('Erro ao remover sessões');
    }
  };

  // Limpa sessões expiradas
  const cleanupExpiredSessions = async () => {
    try {
      const response = await fetch('/api/sessions?action=cleanup', {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        await loadStats(); // Atualiza estatísticas
        if (selectedUserId) {
          await loadUserSessions(selectedUserId); // Recarrega sessões do usuário
        }
        setError(`${data.cleanedCount} sessões expiradas foram removidas`);
      } else {
        setError('Erro ao limpar sessões expiradas');
      }
    } catch (error) {
      console.log('Erro ao limpar sessões:', error);
      setError('Erro ao limpar sessões');
    }
  };

  // Formata data para exibição
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(date));
  };

  // Calcula tempo desde a última atividade
  const getTimeSinceLastActivity = (lastActivity: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(lastActivity).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadUserSessions(selectedUserId);
    }
  }, [selectedUserId]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">
          Gerenciador de Sessões Redis
        </h2>
        
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Usuários Ativos</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.activeUsers}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Sessões Ativas</h3>
            <p className="text-3xl font-bold text-green-600">{stats.activeSessions}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">Ações</h3>
            <button
              onClick={cleanupExpiredSessions}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              Limpar Expiradas
            </button>
          </div>
        </div>

        {/* Filtro por usuário */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por ID do Usuário:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              placeholder="Digite o ID do usuário"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setSelectedUserId('')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Mensagens de erro/sucesso */}
        {error && (
          <div className={`p-3 rounded mb-4 ${
            error.includes('removidas') || error.includes('sucesso')
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {error}
          </div>
        )}
      </div>

      {/* Lista de sessões */}
      {selectedUserId && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-600">
              Sessões do Usuário: {selectedUserId}
            </h3>
            {sessions.length > 0 && (
              <button
                onClick={() => removeAllUserSessions(selectedUserId)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Remover Todas
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando sessões...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma sessão ativa encontrada para este usuário.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sessão ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criada em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Atividade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP / Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessions.map((session) => (
                    <tr key={session.sessionId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                        {session.sessionId.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-700">
                          {session.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(session.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {formatDate(session.lastActivity)}
                        </div>
                        <div className="text-xs text-gray-500">
                          há {getTimeSinceLastActivity(session.lastActivity)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{session.ipAddress || 'N/A'}</div>
                        <div className="text-xs truncate max-w-32" title={session.deviceInfo}>
                          {session.deviceInfo || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => removeSession(session.sessionId)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionManager;