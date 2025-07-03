import Redis from 'ioredis';
import { Logger } from '../utils/Logger';
import { getRedisClient, TTL } from '../config/redis';

// Tipos para configuração de cache
export interface CacheConfig {
  ttl?: number;
  tags?: string[];
  strategy?: 'cache-aside' | 'write-through' | 'write-behind';
  compress?: boolean;
  version?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
  memoryUsage: number;
}

export interface CacheEntry<T> {
  data: T;
  createdAt: number;
  expiresAt: number;
  tags?: string[];
  version?: string;
  compressed?: boolean;
}

/**
 * Serviço avançado para gerenciar cache usando Redis
 * Inclui funcionalidades como:
 * - Cache dinâmico e estático
 * - Warmup automático
 * - Query caching
 * - Invalidação por tags
 * - Compressão de dados
 * - Múltiplas estratégias de cache
 */
export class CacheService {
  private static instance: CacheService;
  private client: Redis;
  private logger: Logger;
  private enabled: boolean;
  private stats: CacheStats;
  private warmupTasks: Map<string, () => Promise<any>>;
  private keyPrefix: string;

  private constructor() {
    this.logger = new Logger('CacheService');
    this.enabled = process.env.REDIS_ENABLED !== 'false';
    this.keyPrefix = process.env.CACHE_PREFIX || 'portal_cache:';
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
      memoryUsage: 0
    };
    this.warmupTasks = new Map();
    
    if (this.enabled) {
      try {
        this.client = getRedisClient();
        this.setupEventListeners();
        this.startStatsCollection();
      } catch (error) {
        this.logger.error('Erro ao inicializar Redis:', error);
        this.enabled = false;
      }
    } else {
      this.logger.info('Cache Redis desabilitado por configuração');
    }
  }

  /**
   * Configura listeners para eventos do Redis
   */
  private setupEventListeners(): void {
    this.client.on('connect', () => {
      this.logger.info('✅ Cache Redis conectado com sucesso');
    });

    this.client.on('error', (err) => {
      this.logger.error('❌ Erro na conexão com Redis:', err);
      this.enabled = false;
    });

    this.client.on('reconnecting', () => {
      this.logger.info('🔄 Reconectando ao Redis...');
    });
  }

  /**
   * Inicia coleta de estatísticas do cache
   */
  private startStatsCollection(): void {
    setInterval(async () => {
      try {
        const info = await this.client.info('memory');
        const memoryMatch = info.match(/used_memory:(\d+)/);
        if (memoryMatch) {
          this.stats.memoryUsage = parseInt(memoryMatch[1]);
        }
      } catch (error) {
        // Ignorar erros de coleta de stats
      }
    }, 60000); // A cada minuto
  }

  /**
   * Obtém a instância singleton do serviço de cache
   */
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Gera chave completa com prefixo
   */
  private getFullKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  /**
   * Comprime dados se necessário
   */
  private compressData(data: any): string {
    // Implementação simples - pode ser melhorada com bibliotecas de compressão
    return JSON.stringify(data);
  }

  /**
   * Descomprime dados se necessário
   */
  private decompressData(data: string): any {
    return JSON.parse(data);
  }

  /**
   * Verifica se o cache está habilitado
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Armazena um valor no cache com configurações avançadas
   */
  public async set<T>(
    key: string, 
    value: T, 
    config: CacheConfig = {}
  ): Promise<void> {
    if (!this.enabled) return;
    
    try {
      const ttl = config.ttl || TTL.CACHE;
      const fullKey = this.getFullKey(key);
      const now = Date.now();
      
      const entry: CacheEntry<T> = {
        data: value,
        createdAt: now,
        expiresAt: now + (ttl * 1000),
        tags: config.tags,
        version: config.version,
        compressed: config.compress
      };

      const serializedData = config.compress 
        ? this.compressData(entry)
        : JSON.stringify(entry);

      await this.client.set(fullKey, serializedData, 'EX', ttl);
      
      // Armazenar tags para invalidação
      if (config.tags) {
        for (const tag of config.tags) {
          await this.client.sadd(`${this.keyPrefix}tag:${tag}`, fullKey);
          await this.client.expire(`${this.keyPrefix}tag:${tag}`, ttl);
        }
      }

      this.stats.sets++;
      this.logger.debug(`✅ Cache definido: ${key} (TTL: ${ttl}s, Tags: ${config.tags?.join(', ') || 'none'})`);
    } catch (error) {
      this.logger.error(`❌ Erro ao definir cache para chave ${key}:`, error);
    }
  }

  /**
   * Recupera um valor do cache
   */
  public async get<T>(key: string): Promise<T | null> {
    if (!this.enabled) return null;
    
    try {
      const fullKey = this.getFullKey(key);
      const value = await this.client.get(fullKey);
      
      if (!value) {
        this.stats.misses++;
        return null;
      }
      
      const parsedValue = JSON.parse(value);
      const entry: CacheEntry<T> = parsedValue.compressed 
        ? this.decompressData(parsedValue)
        : parsedValue;

      // Verificar se expirou
      if (Date.now() > entry.expiresAt) {
        await this.delete(key);
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      this.logger.debug(`✅ Cache encontrado: ${key}`);
      return entry.data;
    } catch (error) {
      this.logger.error(`❌ Erro ao obter cache para chave ${key}:`, error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Cache com fallback (Cache-Aside Pattern)
   */
  public async getOrSet<T>(
    key: string, 
    fallback: () => Promise<T>, 
    config: CacheConfig = {}
  ): Promise<T> {
    if (!this.enabled) return await fallback();
    
    const cachedValue = await this.get<T>(key);
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    this.logger.debug(`🔄 Cache miss para ${key}, executando fallback`);
    const value = await fallback();
    await this.set(key, value, config);
    return value;
  }

  /**
   * Cache para queries de banco de dados
   */
  public async queryCache<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    config: CacheConfig = {}
  ): Promise<T> {
    const cacheKey = `query:${queryKey}`;
    return this.getOrSet(cacheKey, queryFn, {
      ttl: config.ttl || TTL.CACHE,
      tags: ['queries', ...(config.tags || [])],
      ...config
    });
  }

  /**
   * Cache para objetos estáticos (longa duração)
   */
  public async staticCache<T>(
    key: string,
    value: T,
    config: Omit<CacheConfig, 'ttl'> = {}
  ): Promise<void> {
    await this.set(key, value, {
      ttl: 24 * 60 * 60, // 24 horas
      tags: ['static', ...(config.tags || [])],
      ...config
    });
  }

  /**
   * Cache para objetos dinâmicos (curta duração)
   */
  public async dynamicCache<T>(
    key: string,
    value: T,
    config: Omit<CacheConfig, 'ttl'> = {}
  ): Promise<void> {
    await this.set(key, value, {
      ttl: 5 * 60, // 5 minutos
      tags: ['dynamic', ...(config.tags || [])],
      ...config
    });
  }

  /**
   * Remove um valor do cache
   */
  public async delete(key: string): Promise<void> {
    if (!this.enabled) return;
    
    try {
      const fullKey = this.getFullKey(key);
      await this.client.del(fullKey);
      this.stats.deletes++;
      this.logger.debug(`🗑️ Cache removido: ${key}`);
    } catch (error) {
      this.logger.error(`❌ Erro ao remover cache para chave ${key}:`, error);
    }
  }

  /**
   * Invalida cache por tags
   */
  public async invalidateByTag(tag: string): Promise<void> {
    if (!this.enabled) return;
    
    try {
      const tagKey = `${this.keyPrefix}tag:${tag}`;
      const keys = await this.client.smembers(tagKey);
      
      if (keys.length > 0) {
        await this.client.del(...keys);
        await this.client.del(tagKey);
        this.stats.deletes += keys.length;
        this.logger.info(`🏷️ Invalidados ${keys.length} itens com tag: ${tag}`);
      }
    } catch (error) {
      this.logger.error(`❌ Erro ao invalidar por tag ${tag}:`, error);
    }
  }

  /**
   * Remove múltiplos valores do cache usando um padrão
   */
  public async deleteByPattern(pattern: string): Promise<void> {
    if (!this.enabled) return;
    
    try {
      const fullPattern = this.getFullKey(pattern);
      const keys = await this.client.keys(fullPattern);
      
      if (keys.length > 0) {
        await this.client.del(...keys);
        this.stats.deletes += keys.length;
        this.logger.info(`🔍 Removidos ${keys.length} itens com padrão: ${pattern}`);
      }
    } catch (error) {
      this.logger.error(`❌ Erro ao remover cache com padrão ${pattern}:`, error);
    }
  }

  /**
   * Registra uma tarefa de warmup
   */
  public registerWarmupTask(key: string, task: () => Promise<any>): void {
    this.warmupTasks.set(key, task);
    this.logger.debug(`📝 Tarefa de warmup registrada: ${key}`);
  }

  /**
   * Executa warmup do cache
   */
  public async warmup(keys?: string[]): Promise<void> {
    if (!this.enabled) return;
    
    const tasksToRun = keys 
      ? keys.filter(key => this.warmupTasks.has(key))
      : Array.from(this.warmupTasks.keys());

    this.logger.info(`🔥 Iniciando warmup para ${tasksToRun.length} tarefas...`);
    
    const promises = tasksToRun.map(async (key) => {
      try {
        const task = this.warmupTasks.get(key);
        if (task) {
          await task();
          this.logger.debug(`✅ Warmup concluído: ${key}`);
        }
      } catch (error) {
        this.logger.error(`❌ Erro no warmup para ${key}:`, error);
      }
    });

    await Promise.allSettled(promises);
    this.logger.info('🔥 Warmup concluído');
  }

  /**
   * Limpa todo o cache
   */
  public async clear(): Promise<void> {
    if (!this.enabled) return;
    
    try {
      const keys = await this.client.keys(`${this.keyPrefix}*`);
      if (keys.length > 0) {
        await this.client.del(...keys);
        this.logger.info(`🧹 Cache limpo: ${keys.length} chaves removidas`);
      }
    } catch (error) {
      this.logger.error('❌ Erro ao limpar cache:', error);
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reseta estatísticas do cache
   */
  public resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
      memoryUsage: 0
    };
  }

  /**
   * Verifica a saúde do cache
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  }> {
    if (!this.enabled) {
      return {
        status: 'unhealthy',
        details: { error: 'Cache desabilitado' }
      };
    }

    try {
      const start = Date.now();
      await this.client.ping();
      const latency = Date.now() - start;
      
      const info = await this.client.info();
      const stats = this.getStats();
      
      return {
        status: latency < 100 ? 'healthy' : 'degraded',
        details: {
          latency,
          stats,
          redis_info: info,
          enabled: this.enabled
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }
}

// Instância singleton
export const cacheService = CacheService.getInstance();

// Funções utilitárias
export const withCache = async <T>(
  key: string,
  fallback: () => Promise<T>,
  config?: CacheConfig
): Promise<T> => {
  return cacheService.getOrSet(key, fallback, config);
};

export const queryCache = async <T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  config?: CacheConfig
): Promise<T> => {
  return cacheService.queryCache(queryKey, queryFn, config);
};

// Chaves de cache padronizadas
export const CacheKeys = {
  USER_BY_ID: (id: string) => `user:${id}`,
  USER_LIST: (filters: string) => `users:list:${filters}`,
  COURSE_BY_ID: (id: string) => `course:${id}`,
  COURSE_LIST: (filters: string) => `courses:list:${filters}`,
  BOOK_BY_ID: (id: string) => `book:${id}`,
  BOOK_LIST: (filters: string) => `books:list:${filters}`,
  QUERY: (hash: string) => `query:${hash}`,
  SESSION: (id: string) => `session:${id}`,
  ROLE_LIST: (filters: string) => `roles:list:${filters}`,
  INSTITUTION_BY_ID: (id: string) => `institution:${id}`,
  STATIC_CONFIG: 'static:config',
  STATIC_MENU: 'static:menu',
  STATIC_PERMISSIONS: 'static:permissions',
};

// TTLs específicos para diferentes tipos de cache
export const CacheTTL = {
  VERY_SHORT: 60,        // 1 minuto
  SHORT: 300,            // 5 minutos
  MEDIUM: 900,           // 15 minutos
  LONG: 3600,            // 1 hora
  VERY_LONG: 86400,      // 24 horas
  STATIC: 604800,        // 7 dias
  SESSION: TTL.SESSION,
  QUERY: TTL.CACHE,
};

export default cacheService; 