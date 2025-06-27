'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, Trash2, Bug } from 'lucide-react';

interface ServiceWorkerStatus {
  supported: boolean;
  registered: boolean;
  active: boolean;
  scriptUrl?: string;
  state?: string;
  cacheCount: number;
  problematicUrls: Array<{ url: string; status?: number; error?: string }>;
}

export default function ServiceWorkerDebug() {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    supported: false,
    registered: false,
    active: false,
    cacheCount: 0,
    problematicUrls: []
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
        problematicUrls: []
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

      // Testar URLs problemáticos
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

      setStatus(newStatus);
      addLog(`✅ Status verificado: ${newStatus.registered ? 'SW registrado' : 'SW não registrado'}`);
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

  const forceReload = () => {
    addLog('🔄 Forçando recarregamento da página...');
    window.location.reload();
  };

  useEffect(() => {
    checkServiceWorkerStatus();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Diagnóstico do Service Worker
        </CardTitle>
        <CardDescription>
          Ferramenta para diagnosticar e resolver problemas com o Service Worker
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            {status.supported ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Suportado</span>
          </div>
          <div className="flex items-center gap-2">
            {status.registered ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Registrado</span>
          </div>
          <div className="flex items-center gap-2">
            {status.active ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Ativo</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {status.cacheCount} Caches
            </Badge>
          </div>
        </div>

        {/* Detalhes */}
        {status.scriptUrl && (
          <div className="text-sm text-gray-600">
            <strong>Script:</strong> {status.scriptUrl}
            <br />
            <strong>Estado:</strong> {status.state}
          </div>
        )}

        {/* URLs Problemáticos */}
        {status.problematicUrls.length > 0 && (
          <div>
            <h4 className="font-medium text-red-600 mb-2">URLs Problemáticos:</h4>
            <div className="space-y-1">
              {status.problematicUrls.map((item, index) => (
                <div key={index} className="text-sm bg-red-50 p-2 rounded">
                  <strong>{item.url}</strong>
                  {item.status && <span className="text-red-600"> - Status: {item.status}</span>}
                  {item.error && <span className="text-red-600"> - Erro: {item.error}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={checkServiceWorkerStatus}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Verificar Status
          </Button>
          <Button
            onClick={clearServiceWorkerCache}
            disabled={isLoading}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Cache
          </Button>
          <Button
            onClick={reloadProblematicAssets}
            disabled={isLoading}
            variant="secondary"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar Assets
          </Button>
          <Button
            onClick={forceReload}
            disabled={isLoading}
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar Página
          </Button>
        </div>

        {/* Logs */}
        {logs.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Logs:</h4>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono max-h-40 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 