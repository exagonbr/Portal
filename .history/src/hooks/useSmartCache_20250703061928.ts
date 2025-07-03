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
  bypassCache?: boolean; // Nova opção para forçar bypass do cache
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
 * Detecta se a chave é cacheável (apenas itens básicos, imagens e menus)
 */
function shouldCache(key: string): boolean {
  const lowerKey = key.toLowerCase();
  
  // Padrões que PODEM ser cacheados
  const cacheablePatterns = [
    // Imagens
    'image', 'img', 'photo', 'picture', 'avatar', 'icon', 'logo',
    // Menus e navegação
    'menu', 'nav', 'sidebar', 'navigation', 'breadcrumb',
    // Recursos básicos
    'font', 'style', 'theme', 'config', 'manifest', 'favicon'
  ];
  
  return cacheablePatterns.some(pattern => lowerKey.includes(pattern));
}

/**
 * Detecta se deve sempre buscar dados frescos (dados dinâmicos/sensíveis)
 */
function shouldBypassCache(key: string): boolean {
  const lowerKey = key.toLowerCase();
  
  // Se não é cacheável, sempre fazer bypass
  if (!shouldCache(key)) {
    return true;
  }
  
  // Dados sensíveis que mesmo sendo de menu/nav devem ser sempre frescos
  const alwaysFreshPatterns = [
    'role', 'permission', 'auth', 'user-role', 'user-permissions',
    'access-control', 'security', 'session', 'token'
  ];
  
  return alwaysFreshPatterns.some(pattern => lowerKey.includes(pattern));
}

/**
 * Hook para cache inteligente com stale-while-revalidate
 * Automaticamente desabilita cache para dados sensíveis de menu/roles/permissions
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
  maxRetries = 3,
  bypassCache = false
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

  // Detectar se deve fazer bypass do cache
  const shouldBypass = bypassCache || shouldBypassCache(key);
  const isCacheable = shouldCache(key);
  
  // Log para debug sobre estratégia de cache
  useEffect(() => {
    if (shouldBypass) {
      console.log(`🔒 [useSmartCache] Cache desabilitado para: "${key}"`);
    } else if (isCacheable) {
      console.log(`💾 [useSmartCache] Cache habilitado para: "${key}"`);
    } else {
      console.log(`🚫 [useSmartCache] Não cacheável: "${key}"`);
    }
  }, [key, shouldBypass, isCacheable]);

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
      if (lastFetchRef.current && !forceRefresh && !shouldBypass) {
        return await lastFetchRef.current;
      }

      // Para dados sensíveis, sempre forçar refresh e pular cache
      const effectiveForceRefresh = forceRefresh || shouldBypass;
      const effectiveSkipCache = !staleWhileRevalidate && effectiveForceRefresh || shouldBypass;

      const fetchPromise = shouldBypass
        ? fetcher() // Busca direta sem cache para dados sensíveis
        : withSmartCache(key, fetcher, {
            ttl,
            forceRefresh: effectiveForceRefresh,
            skipCache: effectiveSkipCache
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
  }, [key, fetcher, ttl, enabled, staleWhileRevalidate, data, onSuccess, onError, retryOnError, retryDelay, maxRetries, shouldBypass]);

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
      // Para dados sensíveis, não atualizar cache
      if (!shouldBypass) {
        await cacheManager.revalidate(key, () => Promise.resolve(newData), ttl);
      }
    } else {
      // Revalidar do servidor
      await fetchData(true);
    }
  }, [key, ttl, fetchData, shouldBypass]);

  // Função para revalidar
  const revalidate = useCallback(async (): Promise<void> => {
    await fetchData(true);
  }, [fetchData]);

  // Função para limpar cache
  const clear = useCallback(async (): Promise<void> => {
    setData(null);
    setError(null);
    // Para dados sensíveis, não há cache para limpar
    if (!shouldBypass) {
      await cacheManager.invalidate(key);
    }
  }, [key, shouldBypass]);

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
  dependencies = [],
  bypassCache = false
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
    staleWhileRevalidate: true,
    bypassCache
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
  limit = 10,
  bypassCache = false
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
    staleWhileRevalidate: true,
    bypassCache
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

/**
 * Hook especializado para dados de menu/permissões que sempre busca dados frescos
 * Não utiliza cache para garantir que mudanças de role sejam refletidas imediatamente
 */
export function useMenuCache<T>({
  key,
  fetcher,
  enabled = true,
  onSuccess,
  onError,
  retryOnError = true,
  retryDelay = 1000,
  maxRetries = 3
}: Omit<UseSmartCacheOptions<T>, 'ttl' | 'staleWhileRevalidate' | 'bypassCache'>): UseSmartCacheReturn<T> {
  return useSmartCache({
    key,
    fetcher,
    enabled,
    onSuccess,
    onError,
    retryOnError,
    retryDelay,
    maxRetries,
    bypassCache: true, // Sempre bypass cache para dados de menu/permissões
    ttl: 0, // TTL zero para garantir que não seja cacheado
    staleWhileRevalidate: false // Não usar stale-while-revalidate
  });
}
