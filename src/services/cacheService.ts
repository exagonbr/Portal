import { apiClient, handleApiError } from './apiClient';

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

export class CacheService {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 300; // 5 minutos
  private keyPrefix = 'portal_sabercon:';
  private enabled = true;

  constructor(config?: CacheConfig) {
    if (config?.ttl) this.defaultTTL = config.ttl;
    if (config?.prefix) this.keyPrefix = config.prefix;
    if (config?.enabled !== undefined) this.enabled = config.enabled;

    // Limpeza automática do cache em memória a cada 5 minutos
    setInterval(() => this.cleanupMemoryCache(), 5 * 60 * 1000);
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
  }

  /**
   * Obtém valor do cache (Redis primeiro, depois memória)
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled) return null;

    const cacheKey = this.generateKey(key);

    try {
      // Tenta buscar no Redis primeiro
      const redisValue = await this.getFromRedis<T>(cacheKey);
      if (redisValue !== null) {
        // Atualiza cache em memória para acesso mais rápido
        this.setInMemory(cacheKey, redisValue, this.defaultTTL);
        return redisValue;
      }
    } catch (error) {
      console.warn('Erro ao buscar no Redis, usando cache em memória:', error);
    }

    // Fallback para cache em memória
    const memoryEntry = this.memoryCache.get(cacheKey);
    if (memoryEntry && this.isValidEntry(memoryEntry)) {
      return memoryEntry.data;
    }

    return null;
  }

  /**
   * Define valor no cache (Redis e memória)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.enabled) return;

    const cacheKey = this.generateKey(key);
    const cacheTTL = ttl || this.defaultTTL;

    // Salva em memória para acesso rápido
    this.setInMemory(cacheKey, value, cacheTTL);

    try {
      // Tenta salvar no Redis
      await this.setInRedis(cacheKey, value, cacheTTL);
    } catch (error) {
      console.warn('Erro ao salvar no Redis, mantendo apenas em memória:', error);
    }
  }

  /**
   * Remove valor do cache
   */
  async delete(key: string): Promise<void> {
    const cacheKey = this.generateKey(key);

    // Remove da memória
    this.memoryCache.delete(cacheKey);

    try {
      // Remove do Redis
      await this.deleteFromRedis(cacheKey);
    } catch (error) {
      console.warn('Erro ao remover do Redis:', error);
    }
  }

  /**
   * Limpa todo o cache
   */
  async clear(): Promise<void> {
    // Limpa memória
    this.memoryCache.clear();

    try {
      // Limpa Redis (apenas chaves com nosso prefixo)
      await this.clearRedis();
    } catch (error) {
      console.warn('Erro ao limpar Redis:', error);
    }
  }

  /**
   * Obtém ou define valor no cache (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
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
   * Invalida cache por padrão de chave
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const fullPattern = this.generateKey(pattern);

    // Remove da memória
    const keys = Array.from(this.memoryCache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    try {
      // Remove do Redis
      await this.invalidateRedisPattern(fullPattern);
    } catch (error) {
      console.warn('Erro ao invalidar padrão no Redis:', error);
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats(): {
    memoryEntries: number;
    memorySize: number;
    enabled: boolean;
    defaultTTL: number;
  } {
    return {
      memoryEntries: this.memoryCache.size,
      memorySize: JSON.stringify(Array.from(this.memoryCache.entries())).length,
      enabled: this.enabled,
      defaultTTL: this.defaultTTL
    };
  }

  // Métodos privados para interação com Redis

  private setInMemory<T>(key: string, value: T, ttl: number): void {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
      key
    };
    this.memoryCache.set(key, entry);
  }

  private async getFromRedis<T>(key: string): Promise<T | null> {
    try {
      const response = await apiClient.get<{ value: T; exists: boolean }>(
        '/cache/get',
        { key }
      );

      if (response.success && response.data?.exists) {
        return response.data.value;
      }
    } catch (error) {
      console.debug('Redis get failed:', error);
    }

    return null;
  }

  private async setInRedis<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      await apiClient.post('/cache/set', {
        key,
        value,
        ttl
      });
    } catch (error) {
      console.debug('Redis set failed:', error);
      throw error;
    }
  }

  private async deleteFromRedis(key: string): Promise<void> {
    try {
      // Como o método DELETE não aceita body, precisamos passar como query param
      const endpoint = `/cache/delete?key=${encodeURIComponent(key)}`;
      await apiClient.delete(endpoint);
    } catch (error) {
      console.debug('Redis delete failed:', error);
      throw error;
    }
  }

  private async clearRedis(): Promise<void> {
    try {
      await apiClient.post('/cache/clear', { pattern: this.keyPrefix + '*' });
    } catch (error) {
      console.debug('Redis clear failed:', error);
      throw error;
    }
  }

  private async invalidateRedisPattern(pattern: string): Promise<void> {
    try {
      await apiClient.post('/cache/invalidate', { pattern });
    } catch (error) {
      console.debug('Redis invalidate pattern failed:', error);
      throw error;
    }
  }

  /**
   * Habilita ou desabilita o cache
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.memoryCache.clear();
    }
  }

  /**
   * Configura TTL padrão
   */
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }

  /**
   * Pré-aquece o cache com dados frequentemente acessados
   */
  async warmup(keys: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>): Promise<void> {
    const promises = keys.map(async ({ key, fetcher, ttl }) => {
      try {
        const value = await fetcher();
        await this.set(key, value, ttl);
      } catch (error) {
        console.warn(`Erro ao pré-aquecer cache para chave ${key}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }
}

// Instância singleton do serviço de cache
export const cacheService = new CacheService({
  ttl: 300, // 5 minutos padrão
  prefix: 'portal_sabercon:',
  enabled: true
});

// Configurações específicas por tipo de dados
export const CacheKeys = {
  // Usuários
  USER_BY_ID: (id: string) => `user:${id}`,
  USER_LIST: (filters: string) => `users:list:${filters}`,
  USER_PROFILE: (id: string) => `user:profile:${id}`,
  USER_COURSES: (id: string) => `user:courses:${id}`,
  USER_STATS: 'users:stats',

  // Roles
  ROLE_BY_ID: (id: string) => `role:${id}`,
  ROLE_LIST: (filters: string) => `roles:list:${filters}`,
  ACTIVE_ROLES: 'roles:active',
  ROLE_STATS: 'roles:stats',

  // Instituições
  INSTITUTION_BY_ID: (id: string) => `institution:${id}`,
  INSTITUTION_LIST: (filters: string) => `institutions:list:${filters}`,
  ACTIVE_INSTITUTIONS: 'institutions:active',
  INSTITUTION_STATS: 'institutions:stats',

  // Cursos
  COURSE_BY_ID: (id: string) => `course:${id}`,
  COURSE_LIST: (filters: string) => `courses:list:${filters}`,
  COURSES_BY_INSTITUTION: (institutionId: string) => `courses:institution:${institutionId}`,
  ACTIVE_COURSES: 'courses:active',
  COURSE_STATS: 'courses:stats',

  // Autenticação
  AUTH_USER: (token: string) => `auth:user:${token}`,
  AUTH_PERMISSIONS: (userId: string) => `auth:permissions:${userId}`,

  // Configurações
  APP_CONFIG: 'app:config',
  SYSTEM_HEALTH: 'system:health'
} as const;

// TTLs específicos por tipo de dados (em segundos)
export const CacheTTL = {
  SHORT: 60,        // 1 minuto - dados que mudam frequentemente
  MEDIUM: 300,      // 5 minutos - dados normais
  LONG: 1800,       // 30 minutos - dados estáticos
  VERY_LONG: 3600,  // 1 hora - configurações
  STATS: 900        // 15 minutos - estatísticas
} as const;

// Funções utilitárias para cache
export const withCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  return cacheService.getOrSet(key, fetcher, ttl);
};

export const invalidateUserCache = async (userId?: string): Promise<void> => {
  if (userId) {
    await cacheService.delete(CacheKeys.USER_BY_ID(userId));
    await cacheService.delete(CacheKeys.USER_PROFILE(userId));
    await cacheService.delete(CacheKeys.USER_COURSES(userId));
  }
  await cacheService.invalidatePattern('users:list:');
  await cacheService.delete(CacheKeys.USER_STATS);
};

export const invalidateRoleCache = async (roleId?: string): Promise<void> => {
  if (roleId) {
    await cacheService.delete(CacheKeys.ROLE_BY_ID(roleId));
  }
  await cacheService.invalidatePattern('roles:list:');
  await cacheService.delete(CacheKeys.ACTIVE_ROLES);
  await cacheService.delete(CacheKeys.ROLE_STATS);
};

export const invalidateInstitutionCache = async (institutionId?: string): Promise<void> => {
  if (institutionId) {
    await cacheService.delete(CacheKeys.INSTITUTION_BY_ID(institutionId));
  }
  await cacheService.invalidatePattern('institutions:list:');
  await cacheService.delete(CacheKeys.ACTIVE_INSTITUTIONS);
  await cacheService.delete(CacheKeys.INSTITUTION_STATS);
};

export const invalidateCourseCache = async (courseId?: string, institutionId?: string): Promise<void> => {
  if (courseId) {
    await cacheService.delete(CacheKeys.COURSE_BY_ID(courseId));
  }
  if (institutionId) {
    await cacheService.delete(CacheKeys.COURSES_BY_INSTITUTION(institutionId));
  }
  await cacheService.invalidatePattern('courses:list:');
  await cacheService.delete(CacheKeys.ACTIVE_COURSES);
  await cacheService.delete(CacheKeys.COURSE_STATS);
};