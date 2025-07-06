'use client';

import { useEffect } from 'react';
import { registerGlobalErrorHandler } from '@/utils/chunk-error-handler';

/**
 * Componente DESABILITADO - não faz nada para evitar problemas
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    registerGlobalErrorHandler();
  }, []);

  return null;
} 