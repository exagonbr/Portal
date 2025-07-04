/**
 * Gerenciador centralizado de cache para o Portal Sabercon
 * Coordena cache do Service Worker, memória e invalidação inteligente
 */

// Mock do cacheService para remover a dependência externa
const memoryCache = new Map<string, { data: any; expiry: number }>();
const MOCK_DEFAULT_TTL = 60 * 1000; // 1 minuto em milissegundos
let isMemoryCacheEnabled = true;
let defaultTTLMs = MOCK_DEFAULT_TTL;

const mockCacheService = {
  async get<T>(key: string): Promise<T | null> {
    if (!isMemoryCacheEnabled) return null;
    const item = memoryCache.get(key);
    if (item && item.expiry > Date.now()) {
      return item.data as T;
    }
    if (item) {
      memoryCache.delete(key);
    }
    return null;
  },

  async set(key: string, data: any, ttlSeconds: number): Promise<void> {
    if (!isMemoryCacheEnabled) return;
    const expiry = Date.now() + (ttlSeconds * 1000 || defaultTTLMs);
    memoryCache.set(key, { data, expiry });
  },

  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    for (const key of Array.from(memoryCache.keys())) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
  },

  async clear(): Promise<void> {
    memoryCache.clear();
  },

  getStats() {
    return {
      size: memoryCache.size,
      keys: Array.from(memoryCache.keys()),
    };
  },
  
  setMemoryCacheEnabled(enabled: boolean) {
    isMemoryCacheEnabled = enabled;
    if (!enabled) {
        memoryCache.clear();
    }
  },
  
  setDefaultTTLMs(ttl: number) {
    defaultTTLMs = ttl;
  }
};

const cacheService = mockCacheService;

export interface CacheManagerConfig {
  enableServiceWorker?: boolean;
  enableMemoryCache?: boolean;
  defaultTTL?: number;
  staleWhileRevalidate?: boolean;
}

export class CacheManager {
  private config: Required<CacheManagerConfig>;
  private pendingRevalidations = new Set<string>();

  constructor(config: CacheManagerConfig = {}) {
    this.config = {
      enableServiceWorker: false,
      enableMemoryCache: false,
      defaultTTL: 60, // 1 minuto
      staleWhileRevalidate: false,
      ...config
    };
  }

  /**
   * Busca dados com estratégia stale-while-revalidate
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: number;
      forceRefresh?: boolean;
      skipCache?: boolean;
    } = {}
  ): Promise<T> {
    const { ttl = this.config.defaultTTL, forceRefresh = false, skipCache = false } = options;

    // Se forçar refresh ou pular cache, busca direto
    if (forceRefresh || skipCache || !this.config.enableMemoryCache) {
      const data = await fetcher();
      if (!skipCache) {
        await cacheService.set(key, data, ttl);
      }
      return data;
    }

    // Tentar buscar do cache primeiro
    const cached = await cacheService.get<T>(key);
    
    if (cached !== null && this.config.staleWhileRevalidate) {
      // Retorna dados em cache imediatamente
      // E dispara revalidação em background (apenas uma por vez por chave)
      if (!this.pendingRevalidations.has(key)) {
        this.revalidateInBackground(key, fetcher, ttl);
      }
      return cached;
    }

    // Se não tem cache ou não está usando stale-while-revalidate
    if (cached === null) {
      const data = await fetcher();
      await cacheService.set(key, data, ttl);
      return data;
    }

    return cached;
  }

  /**
   * Revalida dados em background
   */
  private async revalidateInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<void> {
    this.pendingRevalidations.add(key);
    
    try {
      console.log(`🔄 Revalidando cache em background: ${key}`);
      const freshData = await fetcher();
      await cacheService.set(key, freshData, ttl);
      console.log(`✅ Cache revalidado: ${key}`);
    } catch (error) {
      console.warn(`⚠️ Falha na revalidação de ${key}:`, error);
    } finally {
      this.pendingRevalidations.delete(key);
    }
  }

  /**
   * Força revalidação imediata de uma chave
   */
  async revalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    console.log(`🔄 Revalidação forçada: ${key}`);
    const data = await fetcher();
    await cacheService.set(key, data, ttl || this.config.defaultTTL);
    return data;
  }

  /**
   * Invalida cache por padrão
   */
  async invalidate(pattern: string): Promise<void> {
    console.log(`🗑️ Invalidando cache: ${pattern}`);
    await cacheService.invalidatePattern(pattern);
    
    // Limpar revalidações pendentes relacionadas
    for (const key of Array.from(this.pendingRevalidations)) {
      if (key.includes(pattern)) {
        this.pendingRevalidations.delete(key);
      }
    }
  }

  /**
   * Limpa todo o cache
   */
  async clearAll(): Promise<void> {
    console.log('🧹 Limpando todo o cache...');
    
    // Limpar cache em memória
    await cacheService.clear();
    
    // Limpar cache do Service Worker
    if (this.config.enableServiceWorker && 'serviceWorker' in navigator) {
      try {
        await this.clearServiceWorkerCache();
      } catch (error) {
        console.warn('⚠️ Falha ao limpar cache do Service Worker:', error);
      }
    }
    
    // Limpar revalidações pendentes
    this.pendingRevalidations.clear();
    
    console.log('✅ Cache limpo completamente');
  }

  /**
   * Limpa cache do Service Worker
   */
  async clearServiceWorkerCache(): Promise<void> {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      throw new Error('Service Worker não disponível');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve();
        } else {
          reject(new Error(event.data.error || 'Erro desconhecido'));
        }
      };
      
      // Timeout de 10 segundos
      setTimeout(() => {
        reject(new Error('Timeout na limpeza de cache do Service Worker'));
      }, 10000);
      
      navigator.serviceWorker.controller?.postMessage(
        {
          type: 'CLEAR_CACHE',
          payload: { reason: 'manual_clear_all' }
        },
        [messageChannel.port2]
      );
    });
  }

  /**
   * Obtém informações sobre o cache
   */
  async getStats(): Promise<{
    memory: ReturnType<typeof cacheService.getStats>;
    serviceWorker?: any;
    pendingRevalidations: number;
  }> {
    const stats: {
      memory: ReturnType<typeof cacheService.getStats>;
      serviceWorker?: any;
      pendingRevalidations: number;
    } = {
      memory: cacheService.getStats(),
      pendingRevalidations: this.pendingRevalidations.size
    };

    // Tentar obter stats do Service Worker
    if (this.config.enableServiceWorker && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        stats.serviceWorker = await this.getServiceWorkerStats();
      } catch (error) {
        console.warn('⚠️ Failed to get Service Worker stats:', error);
      }
    }

    return stats;
  }

  /**
   * Obtém estatísticas do Service Worker
   */
  private async getServiceWorkerStats(): Promise<any> {
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve(event.data);
        } else {
          reject(new Error(event.data.error || 'Erro desconhecido'));
        }
      };
      
      setTimeout(() => {
        reject(new Error('Timeout ao obter stats do Service Worker'));
      }, 5000);
      
      navigator.serviceWorker.controller!.postMessage(
        { type: 'GET_CACHE_INFO' },
        [messageChannel.port2]
      );
    });
  }

  /**
   * Configura o gerenciador
   */
  configure(newConfig: Partial<CacheManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Aplicar configurações ao cacheService
    if (newConfig.enableMemoryCache !== undefined) {
      cacheService.setMemoryCacheEnabled(newConfig.enableMemoryCache);
    }
    
    if (newConfig.defaultTTL !== undefined) {
      cacheService.setDefaultTTLMs(newConfig.defaultTTL);
    }
  }
}

// Instância singleton
export const cacheManager = new CacheManager();

// Funções utilitárias para uso direto
export const withSmartCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number;
    forceRefresh?: boolean;
    skipCache?: boolean;
  }
): Promise<T> => {
  return cacheManager.get(key, fetcher, options);
};

export const invalidateCache = async (pattern: string): Promise<void> => {
  return cacheManager.invalidate(pattern);
};

export const revalidateCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  return cacheManager.revalidate(key, fetcher, ttl);
};

export const clearAllCache = async (): Promise<void> => {
  return cacheManager.clearAll();
};

export const getCacheStats = async () => {
  return cacheManager.getStats();
};
