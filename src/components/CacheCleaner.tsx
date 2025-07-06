'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function CacheCleaner() {
  const [isClearing, setIsClearing] = useState(false);
  const [cacheVersion, setCacheVersion] = useState<string | null>(null);
  const [hasServiceWorker, setHasServiceWorker] = useState(false);

  useEffect(() => {
    // Verificar se há Service Worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      setHasServiceWorker(true);
      
      // Obter versão do cache
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data?.version) {
          setCacheVersion(event.data.version);
        }
      };
      
      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );
    }
  }, []);

  const clearAllCaches = async () => {
    setIsClearing(true);
    
    try {
      // 1. Limpar localStorage (exceto dados importantes)
      const keysToKeep = ['user-token', 'user-preferences'];
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      // 2. Limpar sessionStorage
      sessionStorage.clear();

      // 3. Limpar caches do browser
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // 4. Limpar cache do Service Worker
      if (hasServiceWorker && navigator.serviceWorker.controller) {
        await new Promise<void>((resolve, reject) => {
          const messageChannel = new MessageChannel();
          
          messageChannel.port1.onmessage = (event) => {
            if (event.data.success) {
              resolve();
            } else {
              reject(new Error(event.data.error || 'Erro ao limpar cache'));
            }
          };
          
          // Timeout de 5 segundos
          const timeout = setTimeout(() => {
            reject(new Error('Timeout ao limpar cache'));
          }, 5000);
          
          navigator.serviceWorker.controller?.postMessage(
            { type: 'CLEAR_CACHE' },
            [messageChannel.port2]
          );
          
          messageChannel.port1.onmessage = (event) => {
            clearTimeout(timeout);
            if (event.data.success) {
              resolve();
            } else {
              reject(new Error(event.data.error || 'Erro ao limpar cache'));
            }
          };
        });
      }

      // 5. Desregistrar Service Worker temporariamente
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      toast.success('Cache limpo com sucesso!');
      
      // Aguardar um momento e recarregar
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      toast.error('Erro ao limpar cache. Tente novamente.');
      setIsClearing(false);
    }
  };

  const forceRefresh = () => {
    // Forçar recarga completa ignorando cache
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              Problemas de atualização?
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Se a página não está atualizando corretamente, limpe o cache.
            </p>
            {cacheVersion && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Versão do cache: {cacheVersion.slice(0, 8)}...
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={forceRefresh}
                disabled={isClearing}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Atualizar
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={clearAllCaches}
                disabled={isClearing}
                className="text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {isClearing ? 'Limpando...' : 'Limpar Cache'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook para detectar problemas de cache
export function useCacheProblems() {
  const [hasCacheProblems, setHasCacheProblems] = useState(false);

  useEffect(() => {
    // Detectar se a página foi carregada do cache do navegador
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation && navigation.type === 'back_forward') {
      setHasCacheProblems(true);
    }

    // Detectar se há diferença entre a versão do build e a versão em cache
    const buildVersion = process.env.NEXT_PUBLIC_BUILD_VERSION;
    const cachedVersion = localStorage.getItem('app-build-version');
    
    if (buildVersion && cachedVersion && buildVersion !== cachedVersion) {
      setHasCacheProblems(true);
      localStorage.setItem('app-build-version', buildVersion);
    }

    // Detectar erros de chunk
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('Loading chunk') ||
          event.error?.message?.includes('ChunkLoadError')) {
        setHasCacheProblems(true);
      }
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  return hasCacheProblems;
} 