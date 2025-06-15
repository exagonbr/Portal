'use client';

import { useEffect, useState } from 'react';
import { QueueStats } from '@/services/queueService';
import { apiClient } from '@/services';

interface QueueMonitorStats extends QueueStats {
  lastUpdate: string;
  isHealthy: boolean;
  responseTime: number;
}

export function QueueMonitor() {
  const [stats, setStats] = useState<QueueMonitorStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueueStats = async (): Promise<QueueMonitorStats | null> => {
    const startTime = Date.now();
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get<QueueStats>('/api/queue/stats');
      const responseTime = Date.now() - startTime;

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao obter estatísticas da fila');
      }

      const queueStats: QueueMonitorStats = {
        ...response.data,
        lastUpdate: new Date().toISOString(),
        isHealthy: response.data.failed < 10 && response.data.pending < 50,
        responseTime
      };

      return queueStats;
    } catch (error) {
      console.error('Erro ao obter estatísticas da fila:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      const currentStats = await fetchQueueStats();
      if (currentStats) {
        setStats(currentStats);
      }
    }, 5000); // Atualiza a cada 5 segundos

    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    // Mostrar automaticamente se há problemas na fila
    if (stats && !stats.isHealthy) {
      setIsVisible(true);
    }
  }, [stats?.isHealthy]);

  const handleManualRefresh = async () => {
    const currentStats = await fetchQueueStats();
    if (currentStats) {
      setStats(currentStats);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const getStatusColor = (isHealthy: boolean) => {
    return isHealthy ? 'text-green-500' : 'text-red-500';
  };

  const getProgressColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'bg-red-500';
    if (value >= threshold * 0.7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Botão flutuante para mostrar/ocultar
  if (!isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed bottom-4 left-16 z-50 p-2 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-colors"
        title="Queue Monitor"
      >
        📊
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-16 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          🔍 Queue Monitor
        </h3>
        <button
          onClick={toggleVisibility}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
          ❌ {error}
        </div>
      )}

      {stats ? (
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <span className={`font-medium ${getStatusColor(stats.isHealthy)}`}>
              {stats.isHealthy ? '✅ Saudável' : '🚨 Problemas'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Pendentes:</span>
            <span className="font-mono text-gray-900 dark:text-white">
              {stats.pending}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Processando:</span>
            <span className="font-mono text-gray-900 dark:text-white">
              {stats.processing}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Concluídos:</span>
            <span className="font-mono text-gray-900 dark:text-white">
              {stats.completed}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Falhados:</span>
            <span className={`font-mono ${stats.failed > 10 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
              {stats.failed}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total:</span>
            <span className="font-mono text-gray-900 dark:text-white">
              {stats.total}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Tempo Resp.:</span>
            <span className="font-mono text-gray-900 dark:text-white text-xs">
              {stats.responseTime}ms
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Última Atualização:</span>
            <span className="font-mono text-gray-900 dark:text-white text-xs">
              {new Date(stats.lastUpdate).toLocaleTimeString()}
            </span>
          </div>

          {/* Barra de progresso para jobs falhados */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600 dark:text-gray-400">Jobs Falhados:</span>
              <span className="text-gray-900 dark:text-white">
                {stats.failed}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(stats.failed, 10)}`}
                style={{ 
                  width: `${Math.min((stats.failed / 10) * 100, 100)}%` 
                }}
              />
            </div>
          </div>

          {/* Barra de progresso para jobs pendentes */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600 dark:text-gray-400">Jobs Pendentes:</span>
              <span className="text-gray-900 dark:text-white">
                {stats.pending}/50
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(stats.pending, 50)}`}
                style={{ 
                  width: `${Math.min((stats.pending / 50) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {isLoading ? 'Carregando estatísticas...' : 'Nenhuma estatística disponível'}
        </div>
      )}

      <div className="mt-4 space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoRefreshQueue"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-3 h-3"
          />
          <label htmlFor="autoRefreshQueue" className="text-xs text-gray-600 dark:text-gray-400">
            Auto-refresh (5s)
          </label>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isLoading}
          className="w-full px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? '⏳ Carregando...' : '🔄 Atualizar Manualmente'}
        </button>

        {stats && !stats.isHealthy && (
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-700 dark:text-yellow-300">
            ⚠️ Atenção: {stats.failed > 10 ? `${stats.failed} jobs falhados` : ''} {stats.pending > 50 ? `${stats.pending} jobs pendentes` : ''}
          </div>
        )}
      </div>

      {/* Indicador de atividade */}
      {stats && !stats.isHealthy && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}

      {isLoading && (
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-purple-500 rounded-full animate-spin" />
      )}
    </div>
  );
} 