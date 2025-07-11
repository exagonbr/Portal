'use client';

import { useAutoCacheCleaner } from '@/hooks/useCacheCleaner';
import { ReactNode } from 'react';

interface CacheCleanerProviderProps {
  children: ReactNode;
}

/**
 * Provider que aplica limpeza automática de cache em toda a aplicação
 * Deve ser usado no layout raiz para garantir funcionamento global
 */
export function CacheCleanerProvider({ children }: CacheCleanerProviderProps) {
  // Hook para limpeza automática de cache
  useAutoCacheCleaner();

  return <>{children}</>;
}

export default CacheCleanerProvider;