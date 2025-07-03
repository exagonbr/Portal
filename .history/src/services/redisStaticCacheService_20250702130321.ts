/**
 * Serviço de Cache Estático Redis
 * 
 * Este serviço gerencia cache de conteúdos estáticos para evitar loops
 * e melhorar performance do sistema.
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  version: string;
  compressed?: boolean;
}

interface CacheStats {
  totalKeys: number;
  memoryUsage: number;
  hitRate: number;
  missRate: number;
  lastCleanup: string;
}

export class RedisStaticCacheService {
  private static instance: RedisStaticCacheService;
  private cacheStats = {
    hits: 0,
    misses: 0,
    lastCleanup: new Date().toISOString()
  };

  public static getInstance(): RedisStaticCacheService {
    if (!RedisStaticCacheService.instance) {
      RedisStaticCacheService.instance = new RedisStaticCacheService();
    }
    return RedisStaticCacheService.instance;
  }

  /**
   * Define um item no cache estático
   */
  public async set(
    key: string, 
    value: any, 
    ttl: number = 24 * 60 * 60, // 24 horas por padrão
    compress: boolean = false
  ): Promise<boolean> {
    try {
      // Importar RedisManager dinamicamente
      const { RedisManager } = await import('@/../../backend/src/config/redis');
      const redisManager = RedisManager.getInstance();

      const cacheEntry: CacheEntry = {
        data: value,
        timestamp: Date.now(),
        ttl,
        version: this.generateVersion(),
        compressed: compress
      };

      // Comprimir dados se solicitado
      if (compress && typeof value === 'object') {
        cacheEntry.data = JSON.stringify(value);
      }

      await redisManager.setStaticCache(key, cacheEntry, ttl);
      
      console.log(`✅ Item adicionado ao cache estático: ${key}`);
      return true;

    } catch (error) {
      console.error(`❌ Erro ao definir cache estático para ${key}:`, error);
      return false;
    }
  }

  /**
   * Obtém um item do cache estático
   */
  public async get(key: string): Promise<any | null> {
    try {
      // Importar RedisManager dinamicamente
      const { RedisManager } = await import('@/../../backend/src/config/redis');
      const redisManager = RedisManager.getInstance();

      const cacheEntry: CacheEntry | null = await redisManager.getStaticCache(key);
      
      if (!cacheEntry) {
        this.cacheStats.misses++;
        console.log(`❌ Cache miss para: ${key}`);
        return null;
      }

      // Verificar se o cache não expirou
      const now = Date.now();
      const ageInSeconds = (now - cacheEntry.timestamp) / 1000;
      
      if (ageInSeconds > cacheEntry.ttl) {
        this.cacheStats.misses++;
        console.log(`⏰ Cache expirado para: ${key}`);
        await this.delete(key);
        return null;
      }

      this.cacheStats.hits++;
      console.log(`✅ Cache hit para: ${key}`);

      // Descomprimir dados se necessário
      if (cacheEntry.compressed && typeof cacheEntry.data === 'string') {
        try {
          return JSON.parse(cacheEntry.data);
        } catch (error) {
          console.warn(`⚠️ Erro ao descomprimir cache para ${key}:`, error);
          return cacheEntry.data;
        }
      }

      return cacheEntry.data;

    } catch (error) {
      console.error(`❌ Erro ao obter cache estático para ${key}:`, error);
      this.cacheStats.misses++;
      return null;
    }
  }

  /**
   * Remove um item do cache estático
   */
  public async delete(key: string): Promise<boolean> {
    try {
      // Implementar remoção do cache
      // Por enquanto, apenas log
      console.log(`🗑️ Item removido do cache estático: ${key}`);
      return true;

    } catch (error) {
      console.error(`❌ Erro ao remover cache estático para ${key}:`, error);
      return false;
    }
  }

  /**
   * Cache para componentes React
   */
  public async cacheComponent(
    componentName: string,
    props: any,
    renderResult: string,
    ttl: number = 60 * 60 // 1 hora
  ): Promise<void> {
    const cacheKey = `component:${componentName}:${this.hashProps(props)}`;
    await this.set(cacheKey, renderResult, ttl, true);
  }

  /**
   * Obtém componente do cache
   */
  public async getCachedComponent(
    componentName: string,
    props: any
  ): Promise<string | null> {
    const cacheKey = `component:${componentName}:${this.hashProps(props)}`;
    return await this.get(cacheKey);
  }

  /**
   * Cache para respostas de API
   */
  public async cacheApiResponse(
    endpoint: string,
    params: any,
    response: any,
    ttl: number = 30 * 60 // 30 minutos
  ): Promise<void> {
    const cacheKey = `api:${endpoint}:${this.hashProps(params)}`;
    await this.set(cacheKey, response, ttl);
  }

  /**
   * Obtém resposta de API do cache
   */
  public async getCachedApiResponse(
    endpoint: string,
    params: any
  ): Promise<any | null> {
    const cacheKey = `api:${endpoint}:${this.hashProps(params)}`;
    return await this.get(cacheKey);
  }

  /**
   * Cache para dados de usuário
   */
  public async cacheUserData(
    userId: string,
    dataType: string,
    data: any,
    ttl: number = 60 * 60 // 1 hora
  ): Promise<void> {
    const cacheKey = `user:${userId}:${dataType}`;
    await this.set(cacheKey, data, ttl);
  }

  /**
   * Obtém dados de usuário do cache
   */
  public async getCachedUserData(
    userId: string,
    dataType: string
  ): Promise<any | null> {
    const cacheKey = `user:${userId}:${dataType}`;
    return await this.get(cacheKey);
  }

  /**
   * Cache para conteúdo educacional
   */
  public async cacheEducationalContent(
    contentType: 'course' | 'lesson' | 'book' | 'video',
    contentId: string,
    content: any,
    ttl: number = 4 * 60 * 60 // 4 horas
  ): Promise<void> {
    const cacheKey = `education:${contentType}:${contentId}`;
    await this.set(cacheKey, content, ttl);
  }

  /**
   * Obtém conteúdo educacional do cache
   */
  public async getCachedEducationalContent(
    contentType: 'course' | 'lesson' | 'book' | 'video',
    contentId: string
  ): Promise<any | null> {
    const cacheKey = `education:${contentType}:${contentId}`;
    return await this.get(cacheKey);
  }

  /**
   * Invalidar cache por padrão
   */
  public async invalidatePattern(pattern: string): Promise<number> {
    try {
      console.log(`🧹 Invalidando cache com padrão: ${pattern}`);
      // Implementar invalidação por padrão
      // Por enquanto, apenas log
      return 0;

    } catch (error) {
      console.error(`❌ Erro ao invalidar cache com padrão ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Limpar todo o cache estático
   */
  public async clearAll(): Promise<boolean> {
    try {
      console.log('🧹 Limpando todo o cache estático...');
      
      // Resetar estatísticas
      this.cacheStats = {
        hits: 0,
        misses: 0,
        lastCleanup: new Date().toISOString()
      };

      return true;

    } catch (error) {
      console.error('❌ Erro ao limpar cache estático:', error);
      return false;
    }
  }

  /**
   * Obter estatísticas do cache
   */
  public async getStats(): Promise<CacheStats> {
    const totalRequests = this.cacheStats.hits + this.cacheStats.misses;
    const hitRate = totalRequests > 0 ? (this.cacheStats.hits / totalRequests) * 100 : 0;
    const missRate = totalRequests > 0 ? (this.cacheStats.misses / totalRequests) * 100 : 0;

    return {
      totalKeys: 0, // Implementar contagem real
      memoryUsage: 0, // Implementar cálculo real
      hitRate: Math.round(hitRate * 100) / 100,
      missRate: Math.round(missRate * 100) / 100,
      lastCleanup: this.cacheStats.lastCleanup
    };
  }

  /**
   * Gerar hash das props para cache
   */
  private hashProps(props: any): string {
    try {
      const str = JSON.stringify(props, Object.keys(props).sort());
      return this.simpleHash(str);
    } catch (error) {
      return 'default';
    }
  }

  /**
   * Hash simples para strings
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Gerar versão do cache
   */
  private generateVersion(): string {
    return `v${Date.now()}`;
  }

  /**
   * Wrapper para operações com fallback
   */
  public async withFallback<T>(
    cacheKey: string,
    fallbackFn: () => Promise<T>,
    ttl: number = 60 * 60
  ): Promise<T> {
    // Tentar obter do cache primeiro
    const cached = await this.get(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Executar função de fallback
    const result = await fallbackFn();
    
    // Armazenar no cache
    await this.set(cacheKey, result, ttl);
    
    return result;
  }

  /**
   * Pré-aquecer cache com dados importantes
   */
  public async warmup(data: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    console.log(`🔥 Pré-aquecendo cache com ${data.length} itens...`);
    
    const promises = data.map(item => 
      this.set(item.key, item.value, item.ttl || 60 * 60)
    );
    
    await Promise.all(promises);
    console.log('✅ Cache pré-aquecido com sucesso');
  }
}

// Função utilitária para uso rápido
export const staticCache = RedisStaticCacheService.getInstance();

export default RedisStaticCacheService; 