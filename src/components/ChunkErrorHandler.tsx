'use client';

import { useEffect } from 'react';

/**
 * Componente para configurar o handler global de ChunkLoadError
 */
export default function ChunkErrorHandler() {
  useEffect(() => {
    // Importar e configurar o handler de chunk errors
    import('../utils/chunk-retry').then(({ setupChunkErrorHandler }) => {
      setupChunkErrorHandler();
      console.log('🔧 Handler de ChunkLoadError configurado');
    }).catch(error => {
      console.warn('⚠️ Erro ao configurar handler de chunk errors:', error);
    });
  }, []);

  return null; // Componente invisível
} 