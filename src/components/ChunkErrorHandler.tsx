'use client';

import { useEffect } from 'react';
import { registerGlobalErrorHandler } from '@/utils/chunk-error-handler';

/**
 * Componente para lidar com erros de carregamento de chunks
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    // Registrar handler global de erros
    registerGlobalErrorHandler();

    // Adicionar listener específico para erros de GamificationContext
    const handleError = (event: ErrorEvent) => {
      if (event.error && event.error.message && 
          (event.error.message.includes('GamificationContext') || 
           event.error.message.includes('_app-pages-browser_src_contexts_GamificationContext_tsx'))) {
        
        console.error('Detectado erro no carregamento do GamificationContext', event.error);
        
        // Marcar erro para tratamento
        sessionStorage.setItem('gamification_chunk_error', 'true');
        
        // Limpar caches específicos
        if ('caches' in window) {
          caches.keys().then(function(names) {
            names.forEach(function(name) {
              if (name.includes('next-static') || name.includes('portal-sabercon')) {
                caches.delete(name);
              }
            });
          });
        }
        
        // Recarregar após um breve delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        // Prevenir propagação do erro
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
} 