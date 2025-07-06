'use client';

import { useEffect } from 'react';
import { initializeChunkErrorHandler } from '@/utils/chunk-error-handler';

/**
 * Componente DESABILITADO - não faz nada para evitar problemas
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    // Inicializar o handler de erros de chunk
    initializeChunkErrorHandler();
  }, []);

  return null;
} 