'use client';

import { useEffect } from 'react';

/**
 * Componente para configurar o handler global de ChunkLoadError
 * DESABILITADO para evitar recarregamentos automáticos excessivos
 */
export default function ChunkErrorHandler() {
  useEffect(() => {
    // DESABILITADO: Não configurar mais handlers automáticos
    console.log('⚠️ ChunkErrorHandler DESABILITADO para evitar recarregamentos excessivos');
    
    // CÓDIGO ORIGINAL COMENTADO:
    /*
    // Importar e configurar o handler de chunk errors
    import('../utils/chunk-retry').then(({ setupChunkErrorHandler }) => {
      setupChunkErrorHandler();
      console.log('🔧 Handler de ChunkLoadError configurado');
    }).catch(error => {
      console.warn('⚠️ Erro ao configurar handler de chunk errors:', error);
    });

    // Importar e configurar o interceptor de fetch
    import('../utils/fetch-interceptor').then(({ installFetchInterceptor }) => {
      installFetchInterceptor();
      console.log('🔧 Interceptor de fetch configurado');
    }).catch(error => {
      console.warn('⚠️ Erro ao configurar interceptor de fetch:', error);
    });

    // Cleanup function
    return () => {
      import('../utils/fetch-interceptor').then(({ uninstallFetchInterceptor }) => {
        uninstallFetchInterceptor();
      }).catch(() => {
        // Ignore cleanup errors
      });
    };
    */
  }, []);

  return null; // Componente invisível
} 