import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheManager, withSmartCache } from '@/utils/cacheManager';

export interface UseSmartCacheOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  ttl?: number;
  enabled?: boolean;
  staleWhileRevalidate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retryOnError?: boolean;
  retryDelay?: number;
  maxRetries?: number;
}

export interface UseSmartCacheReturn<T> {
  data: T | null;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  mutate: (newData?: T) => Promise<void>;
  revalidate: () => Promise<void>;
  clear: () => Promise<void>;
}

/**
 * Hook para cache inteligente com stale-while-revalidate
 */
export function useSmartCache<T>({
  key,
  fetcher,
  ttl = 300,
  enabled = true,
  staleWhileRevalidate = true,
  onSuccess,
  onError,
  retryOnError = true,
  retryDelay = 1000,
  maxRetries = 3
}: UseSmartCacheOptions<T>): UseSmartCacheReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef<Promise<T> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Função para buscar dados
  const fetchData = useCallback(async (forceRefresh = false): Promise<T | null> => {
    if (!enabled || !mountedRef.current) return null;

    try {
      setError(null);
      
      if (!data || forceRefresh) {
        setIsLoading(true);
      } else {
        setIsValidating(true);
      }

      // Evitar múltiplas requisições simultâneas
      if (lastFetchRef.current && !forceRefresh) {
        return await lastFetchRef.current;
      }

      const fetchPromise = withSmartCache(key, fetcher, {
        ttl,
        forceRefresh,
        skipCache: !staleWhileRevalidate && forceRefresh
      });

      lastFetchRef.current = fetchPromise;

      const result = await fetchPromise;
      
      if (mountedRef.current) {
        setData(result);
        retryCountRef.current = 0;
        onSuccess?.(result);
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (mountedRef.current) {
        setError(error);
        onError?.(error);

        // Retry logic
        if (retryOnError && retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          console.log(`🔄 Tentativa ${retryCountRef.current}/${maxRetries} para ${key}`);
          
          setTimeout(() => {
            if (mountedRef.current) {
              fetchData(forceRefresh);
            }
          }, retryDelay * retryCountRef.current);
        }
      }

      return null;
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsValidating(false);
      }
      lastFetchRef.current = null;
    }
  }, [key, fetcher, ttl, enabled, staleWhileRevalidate, data, onSuccess, onError, retryOnError, retryDelay, maxRetries]);

  // Fetch inicial
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

  // Função para mutar dados localmente
  const mutate = useCallback(async (newData?: T): Promise<void> => {
    if (newData !== undefined) {
      setData(newData);
      // Atualizar cache
      await cacheManager.revalidate(key, () => Promise.resolve(newData), ttl);
    } else {
      // Revalidar do servidor
      await fetchData(true);
    }
  }, [key, ttl, fetchData]);

  // Função para revalidar
  const revalidate = useCallback(async (): Promise<void> => {
    await fetchData(true);
  }, [fetchData]);

  // Função para limpar cache
  const clear = useCallback(async (): Promise<void> => {
    setData(null);
    setError(null);
    await cacheManager.invalidate(key);
  }, [key]);

  return {
    data,
    isLoading,
    isValidating,
    error,
    mutate,
    revalidate,
    clear
  };
}

/**
 * Hook para cache de lista com invalidação automática
 */
export function useSmartCacheList<T>({
  key,
  fetcher,
  ttl = 300,
  enabled = true,
  dependencies = []
}: UseSmartCacheOptions<T[]> & {
  dependencies?: string[];
}): UseSmartCacheReturn<T[]> & {
  invalidateRelated: () => Promise<void>;
} {
  const cacheResult = useSmartCache({
    key,
    fetcher,
    ttl,
    enabled,
    staleWhileRevalidate: true
  });

  // Função para invalidar caches relacionados
  const invalidateRelated = useCallback(async (): Promise<void> => {
    // Invalidar cache principal
    await cacheManager.invalidate(key);
    
    // Invalidar dependências
    for (const dep of dependencies) {
      await cacheManager.invalidate(dep);
    }
    
    // Revalidar
    await cacheResult.revalidate();
  }, [key, dependencies, cacheResult]);

  return {
    ...cacheResult,
    invalidateRelated
  };
}

/**
 * Hook para cache de dados paginados
 */
export function useSmartCachePaginated<T>({
  key,
  fetcher,
  ttl = 300,
  enabled = true,
  page = 1,
  limit = 10
}: UseSmartCacheOptions<{ data: T[]; total: number; page: number; limit: number }> & {
  page?: number;
  limit?: number;
}) {
  const paginatedKey = `${key}:page:${page}:limit:${limit}`;
  
  return useSmartCache({
    key: paginatedKey,
    fetcher,
    ttl,
    enabled,
    staleWhileRevalidate: true
  });
}

/**
 * Hook para invalidação em lote
 */
export function useCacheInvalidation() {
  const invalidateMultiple = useCallback(async (patterns: string[]): Promise<void> => {
    await Promise.all(patterns.map(pattern => cacheManager.invalidate(pattern)));
  }, []);

  const clearAll = useCallback(async (): Promise<void> => {
    await cacheManager.clearAll();
  }, []);

  const getStats = useCallback(async () => {
    return await cacheManager.getStats();
  }, []);

  return {
    invalidateMultiple,
    clearAll,
    getStats
  };
}
