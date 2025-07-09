'use client';

import { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import { ReloadOutlined, WarningOutlined } from '@ant-design/icons';

interface ChunkErrorInfo {
  count: number;
  lastError: string;
  timestamp: number;
}

export function PWAChunkErrorHandler() {
  const [chunkError, setChunkError] = useState<ChunkErrorInfo | null>(null);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let errorCount = 0;
    const MAX_ERRORS = 3;
    const ERROR_RESET_TIME = 30000; // 30 segundos
    let errorResetTimer: NodeJS.Timeout;

    // Função para detectar erros de chunk
    const isChunkError = (error: any): boolean => {
      if (!error) return false;
      
      const errorMessage = error.message || error.toString();
      return (
        errorMessage.includes('Loading chunk') ||
        errorMessage.includes('ChunkLoadError') ||
        errorMessage.includes('originalFactory') ||
        errorMessage.includes("reading 'call'") ||
        errorMessage.includes('Cannot read properties of undefined') ||
        errorMessage.includes('MIME type') ||
        error.name === 'ChunkLoadError'
      );
    };

    // Handler para erros de window
    const handleError = (event: ErrorEvent) => {
      if (isChunkError(event.error)) {
        errorCount++;
        console.warn(`🔄 Erro de chunk detectado (${errorCount}/${MAX_ERRORS}):`, event.error.message);
        
        // Atualizar estado
        setChunkError({
          count: errorCount,
          lastError: event.error.message,
          timestamp: Date.now()
        });

        // Prevenir que o erro apareça no console
        event.preventDefault();

        // Resetar timer
        clearTimeout(errorResetTimer);
        errorResetTimer = setTimeout(() => {
          errorCount = 0;
          setChunkError(null);
        }, ERROR_RESET_TIME);

        // Se exceder o limite, mostrar opção de recarregar
        if (errorCount >= MAX_ERRORS) {
          message.error('Múltiplos erros de carregamento detectados. Por favor, recarregue a página.');
        }
      }
    };

    // Handler para promises rejeitadas
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (isChunkError(event.reason)) {
        handleError(new ErrorEvent('error', { error: event.reason }));
        event.preventDefault();
      }
    };

    // Handler para erros de script loading
    const handleScriptError = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'SCRIPT') {
        const script = target as HTMLScriptElement;
        if (script.src && (script.src.includes('chunk') || script.src.includes('_next'))) {
          console.warn('🔄 Erro ao carregar script:', script.src);
          
          // Tentar recarregar o script
          setTimeout(() => {
            const newScript = document.createElement('script');
            newScript.src = script.src;
            newScript.async = true;
            document.head.appendChild(newScript);
          }, 1000);
        }
      }
    };

    // Adicionar listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    window.addEventListener('error', handleScriptError, true);

    // Verificar se há service worker e tentar atualizar
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        // Verificar atualizações a cada 5 minutos
        setInterval(() => {
          registration.update().catch(err => {
            console.warn('Erro ao verificar atualizações do SW:', err);
          });
        }, 5 * 60 * 1000);
      });
    }

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      window.removeEventListener('error', handleScriptError, true);
      clearTimeout(errorResetTimer);
    };
  }, []);

  const handleReload = async () => {
    setIsReloading(true);
    
    try {
      // Limpar caches se possível
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => {
            if (name.includes('webpack') || name.includes('next')) {
              return caches.delete(name);
            }
            return Promise.resolve();
          })
        );
      }

      // Limpar cache do webpack se disponível
      if ((window as any).__webpack_require__?.cache) {
        const cache = (window as any).__webpack_require__.cache;
        Object.keys(cache).forEach(key => {
          delete cache[key];
        });
      }

      // Aguardar um pouco antes de recarregar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Forçar recarga completa
      window.location.reload();
    } catch (error) {
      console.error('Erro ao tentar recarregar:', error);
      // Recarregar mesmo assim
      window.location.reload();
    }
  };

  // Não mostrar nada se não houver erros
  if (!chunkError || chunkError.count < 3) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: '#fff',
        padding: '16px 24px',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxWidth: 400,
        zIndex: 9999,
        border: '1px solid #ff4d4f'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
        <WarningOutlined style={{ color: '#ff4d4f', fontSize: 20, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#262626' }}>
            Erro de Carregamento
          </h4>
          <p style={{ margin: '0 0 12px 0', color: '#595959', fontSize: 14 }}>
            Alguns recursos não puderam ser carregados corretamente. 
            Isso pode ser devido a problemas de conexão ou cache.
          </p>
          <Button
            type="primary"
            danger
            icon={<ReloadOutlined />}
            loading={isReloading}
            onClick={handleReload}
            block
          >
            Recarregar Página
          </Button>
        </div>
      </div>
    </div>
  );
} 