'use client';

import { CacheCleaner, useCacheProblems } from './CacheCleaner';

export function CacheManager() {
  const hasCacheProblems = useCacheProblems();
  
  // Mostrar o CacheCleaner apenas se houver problemas de cache detectados
  if (!hasCacheProblems) {
    return null;
  }
  
  return <CacheCleaner />;
} 