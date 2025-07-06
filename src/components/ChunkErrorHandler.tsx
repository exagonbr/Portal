'use client';

import { useEffect, useState } from 'react';

/**
 * Componente DESABILITADO - não faz nada para evitar problemas
 */
export function ChunkErrorHandler() {
  const [hasChunkError, setHasChunkError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

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

    const handleError = (event: ErrorEvent) => {
      if (isChunkError(event.error)) {
        console.warn('🔄 Erro de chunk detectado:', event.error.message);
        setHasChunkError(true);
        setErrorCount(prev => prev + 1);
        
        // Prevenir que o erro apareça no console
        event.preventDefault();
        
        // Se for o primeiro erro, tentar limpar cache e recarregar
        if (errorCount === 0) {
          setTimeout(() => {
            console.log('🔄 Limpando cache e recarregando...');
            
            // Limpar caches do navegador
            if ('caches' in window) {
              caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
              });
            }
            
            // Limpar sessionStorage e localStorage de itens antigos
            try {
              const keysToRemove: string[] = [];
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('webpack') || key.includes('next'))) {
                  keysToRemove.push(key);
                }
              }
              keysToRemove.forEach(key => localStorage.removeItem(key));
            } catch (e) {
              console.warn('Erro ao limpar localStorage:', e);
            }
            
            // Forçar recarga completa
            window.location.reload();
          }, 1000);
        }
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      if (isChunkError(event.reason)) {
        handleError(new ErrorEvent('error', { error: event.reason }));
        event.preventDefault();
      }
    };

    // Adicionar listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [errorCount]);

  if (!hasChunkError || errorCount > 3) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4">Atualizando aplicação...</h2>
        <p className="text-gray-600 mb-4">
          Detectamos uma atualização. A página será recarregada automaticamente.
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
} 