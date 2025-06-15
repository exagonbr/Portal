'use client';

import { useEffect, useState } from 'react';
import { getPWALoopStats, isPWALoopActive, emergencyPWAFix } from '@/utils/pwa-fix';

interface LoopStats {
  requestCount: number;
  timeWindow: number;
  threshold: number;
  isActive: boolean;
  lastReset: string;
}

export function PWALoopDebugger() {
  const [stats, setStats] = useState<LoopStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const currentStats = getPWALoopStats();
      if (currentStats) {
        setStats(currentStats);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    // Mostrar automaticamente se loop for detectado
    if (stats?.isActive) {
      setIsVisible(true);
    }
  }, [stats?.isActive]);

  const handleEmergencyFix = async () => {
    if (confirm('Isso irá limpar todos os dados PWA e recarregar a página. Continuar?')) {
      await emergencyPWAFix();
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Botão flutuante para mostrar/ocultar
  if (!isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed bottom-4 left-4 z-50 p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        title="PWA Loop Debugger"
      >
        🔍
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          PWA Loop Debugger
        </h3>
        <button
          onClick={toggleVisibility}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      {stats ? (
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <span className={`font-medium ${stats.isActive ? 'text-red-500' : 'text-green-500'}`}>
              {stats.isActive ? '🚨 Loop Ativo' : '✅ Normal'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Requisições:</span>
            <span className="font-mono text-gray-900 dark:text-white">
              {stats.requestCount}/{stats.threshold}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Janela:</span>
            <span className="font-mono text-gray-900 dark:text-white">
              {stats.timeWindow}ms
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Último Reset:</span>
            <span className="font-mono text-gray-900 dark:text-white text-xs">
              {new Date(stats.lastReset).toLocaleTimeString()}
            </span>
          </div>

          {/* Barra de progresso */}
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600 dark:text-gray-400">Progresso:</span>
              <span className="text-gray-900 dark:text-white">
                {Math.round((stats.requestCount / stats.threshold) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  stats.isActive 
                    ? 'bg-red-500' 
                    : stats.requestCount > stats.threshold * 0.7 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min((stats.requestCount / stats.threshold) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Carregando estatísticas...
        </div>
      )}

      <div className="mt-4 space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoRefresh"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-3 h-3"
          />
          <label htmlFor="autoRefresh" className="text-xs text-gray-600 dark:text-gray-400">
            Auto-refresh
          </label>
        </div>

        {stats?.isActive && (
          <button
            onClick={handleEmergencyFix}
            className="w-full px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
          >
            🚨 Correção de Emergência
          </button>
        )}

        <button
          onClick={() => {
            const currentStats = getPWALoopStats();
            setStats(currentStats);
          }}
          className="w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
        >
          🔄 Atualizar Manualmente
        </button>
      </div>

      {/* Indicador de atividade */}
      {stats?.isActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
    </div>
  );
} 