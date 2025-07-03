'use client';

import React, { useState, useEffect } from 'react';

interface ServiceWorkerStatus {
  supported: boolean;
  registered: boolean;
  active: boolean;
  scriptUrl?: string;
  state?: string;
  cacheCount: number;
  problematicUrls: Array<{ url: string; status?: number; error?: string }>;
  apiUrls: Array<{ url: string; status?: number; error?: string }>;
}

export default function ServiceWorkerDebug() {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    supported: false,
    registered: false,
    active: false,
    cacheCount: 0,
    problematicUrls: [],
    apiUrls: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkServiceWorkerStatus = async () => {
    setIsLoading(true);
    addLog('🔍 Verificando status do Service Worker...');

    try {
      const newStatus: ServiceWorkerStatus = {
        supported: 'serviceWorker' in navigator,
        registered: false,
        active: false,
        cacheCount: 0,
        problematicUrls: [],
        apiUrls: []
      };

      if (newStatus.supported) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        newStatus.registered = registrations.length > 0;

        if (registrations.length > 0) {
          const activeReg = registrations.find(reg => reg.active);
          if (activeReg) {
            newStatus.active = true;
            newStatus.scriptUrl = activeReg.active?.scriptURL;
            newStatus.state = activeReg.active?.state;
          }
        }
      }

      // Verificar caches
      const cacheNames = await caches.keys();
      newStatus.cacheCount = cacheNames.length;

      // Testar URLs problemáticos (assets)
      const testUrls = [
        '/_next/static/css/vendors-node_modules_g.css',
        '/_next/static/chunks/webpack.js',
        '/_next/static/chunks/main.js'
      ];

      for (const url of testUrls) {
        try {
          const response = await fetch(url, { cache: 'no-cache' });
          if (!response.ok) {
            newStatus.problematicUrls.push({ url, status: response.status });
          }
        } catch (error) {
          newStatus.problematicUrls.push({ 
            url, 
            error: error instanceof Error ? error.message : 'Erro desconhecido' 
          });
        }
      }

      // Testar URLs de API que podem estar sendo interceptadas incorretamente
      const apiTestUrls = [
        '/api/dashboard/system',
        '/api/users/stats',
        '/api/dashboard/analytics',
        '/api/dashboard/engagement'
      ];

      for (const url of apiTestUrls) {
        try {
          const response = await fetch(url, { 
            cache: 'no-cache',
            headers: {
              'Accept': 'application/json'
            }
          });
          if (!response.ok) {
            newStatus.apiUrls.push({ url, status: response.status });
          } else {
            addLog(`✅ API funcionando: ${url}`);
          }
        } catch (error) {
          newStatus.apiUrls.push({ 
            url, 
            error: error instanceof Error ? error.message : 'Erro desconhecido' 
          });
        }
      }

      setStatus(newStatus);
      addLog(`✅ Status verificado: ${newStatus.registered ? 'SW registrado' : 'SW não registrado'}`);
      
      if (newStatus.apiUrls.length > 0) {
        addLog(`⚠️ ${newStatus.apiUrls.length} APIs com problemas detectadas`);
      }
    } catch (error) {
      addLog(`❌ Erro ao verificar status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearServiceWorkerCache = async () => {
    setIsLoading(true);
    addLog('🧹 Iniciando limpeza do cache...');

    try {
      // Limpar todos os caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          addLog(`🗑️ Removendo cache: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );

      // Desregistrar service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => {
            addLog(`🗑️ Desregistrando SW: ${registration.scope}`);
            return registration.unregister();
          })
        );
      }

      addLog('✅ Limpeza concluída! Recarregue a página.');
      await checkServiceWorkerStatus();
    } catch (error) {
      addLog(`❌ Erro na limpeza: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const reloadProblematicAssets = async () => {
    setIsLoading(true);
    addLog('🔄 Recarregando assets problemáticos...');

    const problematicUrls = [
      '/_next/static/css/vendors-node_modules_g.css',
      '/_next/static/chunks/webpack.js'
    ];

    for (const url of problematicUrls) {
      try {
        addLog(`🔄 Recarregando: ${url}`);
        const response = await fetch(url, { 
          cache: 'no-cache',
          mode: 'cors'
        });

        if (response.ok) {
          addLog(`✅ Asset recarregado: ${url}`);
        } else {
          addLog(`⚠️ Falha ao recarregar: ${url} (${response.status})`);
        }
      } catch (error) {
        addLog(`❌ Erro ao recarregar: ${url} - ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    setIsLoading(false);
    await checkServiceWorkerStatus();
  };

  const testApiEndpoints = async () => {
    setIsLoading(true);
    addLog('🔬 Testando endpoints de API...');

    const apiEndpoints = [
      '/api/dashboard/system',
      '/api/users/stats',
      '/api/dashboard/analytics',
      '/api/dashboard/engagement'
    ];

    // Verificar se há token de autenticação
    const token = localStorage.getItem('auth_token');
    if (!token) {
      addLog('⚠️ Nenhum token de autenticação encontrado!');
    } else {
      addLog(`🔐 Token encontrado (${token.length} caracteres)`);
    }

    for (const endpoint of apiEndpoints) {
      try {
        addLog(`🔬 Testando: ${endpoint}`);
        const headers: Record<string, string> = {
          'Accept': 'application/json'
        };

        // Adicionar token se disponível
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(endpoint, {
          cache: 'no-cache',
          headers
        });

        if (response.ok) {
          addLog(`✅ API OK: ${endpoint} (${response.status})`);
        } else {
          const errorText = await response.text();
          addLog(`❌ API falhou: ${endpoint} (${response.status}) - ${errorText}`);
        }
      } catch (error) {
        addLog(`❌ Erro na API: ${endpoint} - ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    setIsLoading(false);
    await checkServiceWorkerStatus();
  };

  const forceReload = () => {
    addLog('🔄 Forçando recarregamento da página...');
    window.location.reload();
  };

  const runAuthDebug = () => {
    addLog('🔍 Executando diagnóstico de autenticação...');
    // Importar e executar as funções de debug de auth
    import('@/utils/auth-debug').then(({ debugAuth, testTokenDirectly, testMultipleEndpoints }) => {
      debugAuth();
      testTokenDirectly();
      testMultipleEndpoints();
    });
  };

  const clearAuthData = () => {
    addLog('🧹 Limpando dados de autenticação...');
    import('@/utils/auth-debug').then(({ clearAllAuth }) => {
      clearAllAuth();
      addLog('✅ Dados de autenticação limpos');
    });
  };

  useEffect(() => {
    checkServiceWorkerStatus();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
            🐛 Diagnóstico do Service Worker
          </h2>
          <p className="text-gray-600">
            Ferramenta para diagnosticar e resolver problemas com o Service Worker
          </p>
        </div>

        <div className="space-y-6">
          {/* Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${status.supported ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm">Suportado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${status.registered ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm">Registrado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${status.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm">Ativo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
                {status.cacheCount} Caches
              </span>
            </div>
          </div>

          {/* Detalhes */}
          {status.scriptUrl && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <strong>Script:</strong> {status.scriptUrl}
              <br />
              <strong>Estado:</strong> {status.state}
            </div>
          )}

          {/* Assets Problemáticos */}
          {status.problematicUrls.length > 0 && (
            <div>
              <h4 className="font-medium text-red-600 mb-2">Assets Problemáticos:</h4>
              <div className="space-y-1">
                {status.problematicUrls.map((item, index) => (
                  <div key={index} className="text-sm bg-red-50 p-2 rounded border-l-4 border-red-400">
                    <strong>{item.url}</strong>
                    {item.status && <span className="text-red-600"> - Status: {item.status}</span>}
                    {item.error && <span className="text-red-600"> - Erro: {item.error}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APIs Problemáticas */}
          {status.apiUrls.length > 0 && (
            <div>
              <h4 className="font-medium text-orange-600 mb-2">APIs com Problemas:</h4>
              <div className="space-y-1">
                {status.apiUrls.map((item, index) => (
                  <div key={index} className="text-sm bg-orange-50 p-2 rounded border-l-4 border-orange-400">
                    <strong>{item.url}</strong>
                    {item.status && <span className="text-orange-600"> - Status: {item.status}</span>}
                    {item.error && <span className="text-orange-600"> - Erro: {item.error}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={checkServiceWorkerStatus}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
              Verificar Status
            </button>
            <button
              onClick={clearServiceWorkerCache}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              🗑️ Limpar Cache
            </button>
            <button
              onClick={reloadProblematicAssets}
              disabled={isLoading}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              🔄 Recarregar Assets
            </button>
            <button
              onClick={testApiEndpoints}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              🔬 Testar APIs
            </button>
            <button
              onClick={forceReload}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              🔄 Recarregar Página
            </button>
          </div>

          {/* Seção de Debug de Autenticação */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2 text-gray-700">🔐 Debug de Autenticação</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={runAuthDebug}
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                🔍 Diagnosticar Auth
              </button>
              <button
                onClick={clearAuthData}
                disabled={isLoading}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                🧹 Limpar Auth
              </button>
            </div>
          </div>

          {/* Logs */}
          {logs.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Logs:</h4>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono max-h-40 overflow-y-auto border">
                {logs.map((log, index) => (
                  <div key={index} className="py-1">{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 