/**
 * Gerenciador centralizado de cache para o Portal Sabercon
 * Coordena cache seletivo: apenas itens básicos, imagens e menus
 */

import { cacheService } from '@/services/cacheService';

export interface CacheManagerConfig {
  enableServiceWorker?: boolean;
  enableMemoryCache?: boolean;
  defaultTTL?: number;
  staleWhileRevalidate?: boolean;
  selectiveMode?: boolean; // Novo: modo seletivo
}

/**
 * Verifica se uma chave deve ser cacheada (apenas básicos, imagens e menus)
 */
function isKeyCacheable(key: string): boolean {
  const lowerKey = key.toLowerCase();
  
  const cacheablePatterns = [
    // Imagens
    'image', 'img', 'photo', 'picture', 'avatar', 'icon', 'logo',
    // Menus e navegação básicos
    'menu', 'nav', 'sidebar', 'navigation', 'breadcrumb',
    // Recursos básicos
    'font', 'style', 'theme', 'config', 'manifest', 'favicon'
  ];
  
  return cacheablePatterns.some(pattern => lowerKey.includes(pattern));
}

export class CacheManager {
  private config: Required<CacheManagerConfig>;
  private pendingRevalidations = new Set<string>();

  constructor(config: CacheManagerConfig = {}) {
    this.config = {
      enableServiceWorker: true,
      enableMemoryCache: true,
      defaultTTL: 300, // 5 minutos
      staleWhileRevalidate: true,
      selectiveMode: true, // Ativar modo seletivo por padrão
      ...config
    };
  }

  /**
   * Busca dados com estratégia seletiva (apenas básicos, imagens e menus)
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

    // Verificar se deve cachear esta chave no modo seletivo
    const shouldCacheKey = !this.config.selectiveMode || isKeyCacheable(key);
    
    // Se não deve cachear, sempre buscar da rede
    if (!shouldCacheKey || forceRefresh || skipCache || !this.config.enableMemoryCache) {
      const data = await fetcher();
      // Só salvar no cache se for cacheável
      if (!skipCache && shouldCacheKey) {
        await cacheService.set(key, data, ttl);
      }
      return data;
    }

    // Tentar buscar do cache primeiro (apenas para chaves cacheáveis)
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
   * Invalida cache por padrão (apenas chaves cacheáveis no modo seletivo)
   */
  async invalidate(pattern: string): Promise<void> {
    console.log(`🗑️ Invalidando cache seletivo: ${pattern}`);
    
    // No modo seletivo, só invalidar se o padrão for cacheável
    if (this.config.selectiveMode && !isKeyCacheable(pattern)) {
      console.log(`⚠️ Padrão "${pattern}" não é cacheável no modo seletivo`);
      return;
    }
    
    await cacheService.invalidatePattern(pattern);
    
    // Limpar revalidações pendentes relacionadas
    const keysToDelete: string[] = [];
    this.pendingRevalidations.forEach(key => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.pendingRevalidations.delete(key);
    });
  }

  /**
   * Limpa cache seletivo (apenas itens cacheáveis)
   */
  async clearAll(): Promise<void> {
    console.log('🧹 Limpando cache seletivo...');
    
    if (this.config.selectiveMode) {
      // No modo seletivo, limpar apenas chaves cacheáveis
      console.log('📋 Modo seletivo: limpando apenas itens básicos, imagens e menus');
      await this.clearSelectiveCache();
    } else {
      // Limpar todo o cache (modo legado)
      await cacheService.clear();
    }
    
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
    
    console.log('✅ Cache seletivo limpo');
  }

  /**
   * Limpa apenas cache de itens cacheáveis (básicos, imagens e menus)
   */
  private async clearSelectiveCache(): Promise<void> {
    // Como não temos getAllKeys, vamos invalidar por padrões conhecidos
    const cacheablePatterns = [
      'image', 'img', 'photo', 'picture', 'avatar', 'icon', 'logo',
      'menu', 'nav', 'sidebar', 'navigation', 'breadcrumb',
      'font', 'style', 'theme', 'config', 'manifest', 'favicon'
    ];
    
    console.log(`🎯 Limpando cache por padrões cacheáveis: ${cacheablePatterns.join(', ')}`);
    
    for (const pattern of cacheablePatterns) {
      try {
        await cacheService.invalidatePattern(pattern);
      } catch (error) {
        console.warn(`⚠️ Erro ao limpar padrão "${pattern}":`, error);
      }
    }
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
      
      navigator.serviceWorker.controller.postMessage(
        {
          type: 'CLEAR_CACHE',
          payload: { reason: 'manual_clear_all' }
        },
        [messageChannel.port2]
      );
    });
  }

  /**
   * Obtém informações sobre o cache seletivo
   */
  async getStats(): Promise<{
    memory: ReturnType<typeof cacheService.getStats>;
    serviceWorker?: any;
    pendingRevalidations: number;
    selectiveMode: boolean;
  }> {
    const stats: {
      memory: ReturnType<typeof cacheService.getStats>;
      serviceWorker?: any;
      pendingRevalidations: number;
      selectiveMode: boolean;
    } = {
      memory: cacheService.getStats(),
      pendingRevalidations: this.pendingRevalidations.size,
      selectiveMode: this.config.selectiveMode
    };

    // Tentar obter stats do Service Worker
    if (this.config.enableServiceWorker && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        stats.serviceWorker = await this.getServiceWorkerStats();
      } catch (error) {
        console.warn('⚠️ Falha ao obter stats do Service Worker:', error);
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
    
    console.log('⚙️ Cache Manager configurado:', {
      selectiveMode: this.config.selectiveMode,
      enableMemoryCache: this.config.enableMemoryCache,
      defaultTTL: this.config.defaultTTL
    });
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
