'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Trash2, AlertCircle } from 'lucide-react';

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

      console.log('Cache limpo com sucesso!');
      alert('Cache limpo com sucesso! A página será recarregada.');
      
      // Aguardar um momento e recarregar
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      alert('Erro ao limpar cache. Tente novamente.');
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
        <div className="flex gap-2">
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
  );
}

// Hook para detectar problemas de cache
export function useCacheProblems() {
  const [hasCacheProblems, setHasCacheProblems] = useState(false);
  const [isCleaningCache, setIsCleaningCache] = useState(false);

  useEffect(() => {
    // Detectar se a página foi carregada do cache do navegador
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    // Em dispositivos móveis, sempre considerar como problema de cache
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
    if (isMobile) {
      setHasCacheProblems(true);
    } else if (navigation && navigation.type === 'back_forward') {
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
        
        // Se estiver em mobile, limpar cache imediatamente
        if (isMobile) {
          cleanCache();
        }
      }
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  const cleanCache = async () => {
    if (isCleaningCache) return;
    
    try {
      setIsCleaningCache(true);

      // Salvar dados de autenticação
      const authToken = localStorage.getItem('auth-token');
      const refreshToken = localStorage.getItem('refresh-token');
      const userId = localStorage.getItem('user-id');
      const userPrefs = localStorage.getItem('user-preferences');
      
      // Limpar cache do service worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      // Limpar cache do navegador
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }

      // Limpar storage preservando autenticação
      const preservedItems = {
        'auth-token': authToken,
        'refresh-token': refreshToken,
        'user-id': userId,
        'user-preferences': userPrefs
      };

      localStorage.clear();
      sessionStorage.clear();

      // Restaurar dados de autenticação
      Object.entries(preservedItems).forEach(([key, value]) => {
        if (value) localStorage.setItem(key, value);
      });

      // Recarregar a página
      window.location.reload();
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      // Em caso de erro, tentar recarregar mesmo assim
      window.location.reload();
    } finally {
      setIsCleaningCache(false);
    }
  };

  return { hasCacheProblems, cleanCache, isCleaningCache };
} 