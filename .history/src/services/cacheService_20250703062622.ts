export interface CacheConfig {
  ttl?: number; // Time to live em segundos
  prefix?: string; // Prefixo para as chaves
  enabled?: boolean; // Se o cache está habilitado
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
}

/**
 * Serviço de cache em memória local - RESTRITO APENAS PARA SESSÃO/AUTH
 * - Cache APENAS para dados de sessão, token, user, userData, refreshToken, roles, permissions
 * - Sem dependência do Redis
 * - Cleanup automático de itens expirados
 */
export class CacheService {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 300; // 5 minutos
  private keyPrefix = 'portal_sabercon:';
  private enabled = true;
  
  // Lista de chaves permitidas para cache (APENAS DADOS DE SESSÃO/AUTH)
  private allowedKeys = [
    'session',
    'token',
    'accessToken',
    'refreshToken',
    'user',
    'userData',
    'roles',
    'permissions',
    'auth',
    'login'
  ];
  
  // Estatísticas de cache
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0
  };

  // Cleanup automático a cada 5 minutos
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config?: CacheConfig) {
    if (config?.ttl) this.defaultTTL = config.ttl;
    if (config?.prefix) this.keyPrefix = config.prefix;
    if (config?.enabled !== undefined) this.enabled = config.enabled;

    // Só configurar cleanup automático no cliente
    if (typeof window !== 'undefined') {
      // Limpeza automática do cache em memória a cada 5 minutos
      this.cleanupInterval = setInterval(() => this.cleanupMemoryCache(), 5 * 60 * 1000);

      // Cleanup quando a página for fechada
      window.addEventListener('beforeunload', () => {
        this.cleanup();
      });
    }
  }

  /**
   * Verifica se a chave é permitida para cache (apenas dados de sessão/auth)
   */
  private isKeyAllowed(key: string): boolean {
    return this.allowedKeys.some(allowedKey =>
      key.toLowerCase().includes(allowedKey.toLowerCase())
    );
  }

  /**
   * Gera chave de cache com prefixo
   */
  private generateKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  /**
   * Verifica se uma entrada de cache é válida
   */
  private isValidEntry<T>(entry: CacheEntry<T>): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < (entry.ttl * 1000);
  }

  /**
   * Limpa entradas expiradas do cache em memória
   */
  private cleanupMemoryCache(): void {
    const now = Date.now();
    const entries = Array.from(this.memoryCache.entries());
    for (const [key, entry] of entries) {
      if ((now - entry.timestamp) >= (entry.ttl * 1000)) {
        this.memoryCache.delete(key);
      }
    }
    this.updateCacheSize();
  }

  /**
   * Atualiza o tamanho do cache nas estatísticas
   */
  private updateCacheSize(): void {
    this.stats.size = this.memoryCache.size;
  }

  /**
   * Reseta as estatísticas
   */
  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0
    };
  }

  /**
   * Define valor na memória
   */
  private setInMemory<T>(key: string, value: T, ttl: number): void {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
      key
    };
    this.memoryCache.set(key, entry);
  }

  /**
   * Obtém valor do cache (apenas memória) - RESTRITO A DADOS DE SESSÃO/AUTH
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled) return null;
    
    // VALIDAÇÃO: Só permite cache de dados de sessão/auth
    if (!this.isKeyAllowed(key)) {
      console.warn(`🚫 Cache negado para chave não autorizada: ${key}`);
      return null;
    }

    const cacheKey = this.generateKey(key);

    // Busca apenas na memória
    const memoryEntry = this.memoryCache.get(cacheKey);
    if (memoryEntry && this.isValidEntry(memoryEntry)) {
      this.stats.hits++;
      return memoryEntry.data;
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Define valor no cache (apenas memória) - RESTRITO A DADOS DE SESSÃO/AUTH
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.enabled) return;
    
    // VALIDAÇÃO: Só permite cache de dados de sessão/auth
    if (!this.isKeyAllowed(key)) {
      console.warn(`🚫 Cache negado para chave não autorizada: ${key}`);
      return;
    }

    const cacheKey = this.generateKey(key);
    const cacheTTL = ttl || this.defaultTTL;

    // Salva apenas na memória
    this.setInMemory(cacheKey, value, cacheTTL);
    this.stats.sets++;
    this.updateCacheSize();
  }

  /**
   * Remove valor do cache (apenas memória)
   */
  async delete(key: string): Promise<void> {
    const cacheKey = this.generateKey(key);

    // Remove da memória
    this.memoryCache.delete(cacheKey);
    this.stats.deletes++;
    this.updateCacheSize();
  }

  /**
   * Limpa todo o cache (apenas memória)
   */
  async clear(): Promise<void> {
    // Limpa memória
    this.memoryCache.clear();
    this.resetStats();
  }

  /**
   * Obtém ou define valor no cache (cache-aside pattern) - RESTRITO A DADOS DE SESSÃO/AUTH
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // VALIDAÇÃO: Só permite cache de dados de sessão/auth
    if (!this.isKeyAllowed(key)) {
      console.warn(`🚫 Cache negado para chave não autorizada: ${key}`);
      // Se não é permitido cache, apenas executa a função
      return await fetcher();
    }

    // Tenta buscar no cache primeiro
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Se não encontrou, executa a função e salva no cache
    const value = await fetcher();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Força revalidação de uma chave específica
   */
  async revalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    console.log(`🔄 Revalidando cache: ${key}`);
    const value = await fetcher();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Obtém valor com estratégia stale-while-revalidate
   */
  async getStaleWhileRevalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      // Retorna valor em cache imediatamente
      // E dispara revalidação em background
      this.revalidateInBackground(key, fetcher, ttl);
      return cached;
    }

    // Se não tem cache, busca normalmente
    const value = await fetcher();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Revalidação em background (não bloqueia)
   */
  private async revalidateInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<void> {
    try {
      const value = await fetcher();
      await this.set(key, value, ttl);
      console.log(`✅ Cache revalidado em background: ${key}`);
    } catch (error) {
      console.warn(`⚠️ Falha na revalidação em background de ${key}:`, error);
    }
  }

  /**
   * Invalida cache por padrão de chave
   */
  async invalidatePattern(pattern: string): Promise<void> {
    // Remove da memória (busca por padrão)
    const keys = Array.from(this.memoryCache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    this.updateCacheSize();
  }

  /**
   * Pré-carrega dados no cache
   */
  async preload<T>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    const promises = entries.map(entry => 
      this.set(entry.key, entry.value, entry.ttl)
    );
    
    await Promise.all(promises);
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats(): CacheStats & { memorySize: number; enabled: boolean; defaultTTL: number } {
    return {
      ...this.stats,
      memorySize: this.memoryCache.size,
      enabled: this.enabled,
      defaultTTL: this.defaultTTL
    };
  }

  /**
   * Cleanup manual
   */
  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.memoryCache.clear();
    this.resetStats();
  }
}

// Instância singleton do cache
export const cacheService = new CacheService();

// Export default para compatibilidade
export default cacheService;