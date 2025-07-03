'use client';

import React, { useState, useEffect } from 'react';
import { isProduction } from '@/utils/env';
import { cacheManager, getCacheStats, clearAllCache } from '@/utils/cacheManager';
import { useCacheInvalidation } from '@/hooks/useSmartCache';

interface CacheStats {
  memory: {
    memoryEntries: number;
    memorySize: number;
    enabled: boolean;
    defaultTTL: number;
  };
  serviceWorker?: {
    currentVersion: string;
    activeCaches: string[];
    totalCaches: number;
  };
  pendingRevalidations: number;
}

export function CacheDebugPanel() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const { invalidateMultiple, clearAll, getStats } = useCacheInvalidation();

  // Carregar estatísticas
  const loadStats = async () => {
    setIsLoading(true);
    try {
      const newStats = await getCacheStats();
      setStats(newStats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar estatísticas do cache:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar estatísticas iniciais
  useEffect(() => {
    loadStats();
  }, []);

  // Auto-refresh a cada 10 segundos se visível
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, [isVisible]);

  // Limpar todo o cache
  const handleClearAll = async () => {
    if (confirm('Tem certeza que deseja limpar todo o cache?')) {
      setIsLoading(true);
      try {
        await clearAllCache();
        await loadStats();
        alert('Cache limpo com sucesso!');
      } catch (error) {
        console.error('Erro ao limpar cache:', error);
        alert('Erro ao limpar cache: ' + error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Invalidar padrões específicos
  const handleInvalidatePattern = async (pattern: string) => {
    if (!pattern.trim()) return;
    
    setIsLoading(true);
    try {
      await invalidateMultiple([pattern]);
      await loadStats();
      alert(`Padrão "${pattern}" invalidado com sucesso!`);
    } catch (error) {
      console.error('Erro ao invalidar padrão:', error);
      alert('Erro ao invalidar padrão: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatação de tamanho
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Só mostrar em desenvolvimento ou para admins
  if (isProduction()) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botão toggle */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
        title="Debug de Cache"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>

      {/* Panel */}
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cache Debug
            </h3>
            <button
              onClick={loadStats}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              {isLoading ? '🔄' : '↻'}
            </button>
          </div>

          {stats && (
            <div className="space-y-4">
              {/* Estatísticas de Memória */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Cache em Memória
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <div>Entradas: {stats.memory.memoryEntries}</div>
                  <div>Tamanho: {formatSize(stats.memory.memorySize)}</div>
                  <div>TTL Padrão: {stats.memory.defaultTTL}s</div>
                  <div>Status: {stats.memory.enabled ? '✅ Ativo' : '❌ Inativo'}</div>
                </div>
              </div>

              {/* Estatísticas do Service Worker */}
              {stats.serviceWorker && (
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Service Worker
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <div>Versão: {stats.serviceWorker.currentVersion}</div>
                    <div>Caches Ativos: {stats.serviceWorker.activeCaches.length}</div>
                    <div>Total de Caches: {stats.serviceWorker.totalCaches}</div>
                  </div>
                </div>
              )}

              {/* Revalidações Pendentes */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Atividade
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <div>Revalidações Pendentes: {stats.pendingRevalidations}</div>
                  {lastUpdate && (
                    <div>Última Atualização: {lastUpdate.toLocaleTimeString()}</div>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="space-y-2">
                <button
                  onClick={handleClearAll}
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 px-3 rounded text-sm transition-colors"
                >
                  Limpar Todo Cache
                </button>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Padrão (ex: users:)"
                    className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleInvalidatePattern((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      handleInvalidatePattern(input.value);
                      input.value = '';
                    }}
                    disabled={isLoading}
                    className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Invalidar
                  </button>
                </div>
              </div>

              {/* Padrões Comuns */}
              <div className="space-y-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">Padrões Comuns:</div>
                <div className="flex flex-wrap gap-1">
                  {['users:', 'roles:', 'institutions:', 'courses:'].map(pattern => (
                    <button
                      key={pattern}
                      onClick={() => handleInvalidatePattern(pattern)}
                      disabled={isLoading}
                      className="text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 px-2 py-1 rounded transition-colors"
                    >
                      {pattern}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!stats && !isLoading && (
            <div className="text-center text-gray-500 dark:text-gray-400">
              Erro ao carregar estatísticas
            </div>
          )}
        </div>
      )}
    </div>
  );
}
