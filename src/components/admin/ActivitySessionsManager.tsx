import React, { useState, useEffect } from 'react';
import { useActivitySessions } from '@/hooks/useActivitySessions';
import { ActivitySession } from '@/services/activitySessionsService';

interface ActivitySessionsManagerProps {
  userId?: string;
}

export const ActivitySessionsManager: React.FC<ActivitySessionsManagerProps> = ({ userId }) => {
  const {
    sessions,
    loading,
    error,
    fetchSessions,
    endSession,
    getActiveSessions,
    getUserSessions,
  } = useActivitySessions();

  const [activeSessions, setActiveSessions] = useState<ActivitySession[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'user'>('all');

  useEffect(() => {
    handleViewModeChange(viewMode);
  }, [viewMode]);

  const handleViewModeChange = async (mode: 'all' | 'active' | 'user') => {
    setViewMode(mode);
    
    switch (mode) {
      case 'all':
        await fetchSessions(currentPage);
        break;
      case 'active':
        const active = await getActiveSessions();
        setActiveSessions(active);
        break;
      case 'user':
        if (userId) {
          const userSessions = await getUserSessions(userId);
          setActiveSessions(userSessions);
        }
        break;
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await endSession(sessionId);
      // Atualizar a lista baseada no modo atual
      handleViewModeChange(viewMode);
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const displaySessions = viewMode === 'all' ? sessions : activeSessions;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Erro:</strong> {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Gerenciador de Sessões de Atividade
          </h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewModeChange('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                viewMode === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => handleViewModeChange('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                viewMode === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Ativas
            </button>
            {userId && (
              <button
                onClick={() => handleViewModeChange('user')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  viewMode === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Usuário
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID da Sessão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Início
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visualizações
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Controles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displaySessions.map((session) => (
                <tr key={session.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {session.sessionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(session.startTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDuration(session.durationSeconds)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.pageViews || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.actionsCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        session.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {session.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {session.isActive && (
                      <button
                        onClick={() => handleEndSession(session.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Encerrar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displaySessions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {viewMode === 'active' 
                ? 'Nenhuma sessão ativa encontrada' 
                : 'Nenhuma sessão encontrada'}
            </p>
          </div>
        )}

        {viewMode === 'all' && (
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700">
              Página {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 