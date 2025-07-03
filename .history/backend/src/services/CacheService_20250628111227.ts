import Redis from 'ioredis';
import { Logger } from '../utils/Logger';

/**
 * Serviço para gerenciar cache usando Redis
 */
export class CacheService {
  private static instance: CacheService;
  private client: Redis;
  private logger: Logger;
  private enabled: boolean;

  private constructor() {
    this.logger = new Logger('CacheService');
    this.enabled = process.env.REDIS_ENABLED === 'true';
    
    if (this.enabled) {
      try {
        this.client = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD || undefined,
          db: parseInt(process.env.REDIS_DB || '0'),
          tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
          connectTimeout: 10000,
          maxRetriesPerRequest: 3,
        });

        this.client.on('connect', () => {
          this.logger.info('Conectado ao Redis com sucesso');
        });

        this.client.on('error', (err) => {
          this.logger.error('Erro na conexão com Redis:', err);
          this.enabled = false;
        });
      } catch (error) {
        this.logger.error('Erro ao inicializar Redis:', error);
        this.enabled = false;
      }
    } else {
      this.logger.info('Cache Redis desabilitado por configuração');
    }
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
   * Verifica se o cache está habilitado
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Armazena um valor no cache
   * @param key Chave do cache
   * @param value Valor a ser armazenado
   * @param ttlSeconds Tempo de vida em segundos (padrão: 300 segundos = 5 minutos)
   */
  public async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    if (!this.enabled) return;
    
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      this.logger.debug(`Cache definido para chave: ${key} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
      this.logger.error(`Erro ao definir cache para chave ${key}:`, error);
    }
  }

  /**
   * Recupera um valor do cache
   * @param key Chave do cache
   * @returns O valor armazenado ou null se não encontrado
   */
  public async get<T>(key: string): Promise<T | null> {
    if (!this.enabled) return null;
    
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Erro ao obter cache para chave ${key}:`, error);
      return null;
    }
  }

  /**
   * Recupera um valor do cache ou executa a função fallback se não encontrado
   * @param key Chave do cache
   * @param fallback Função a ser executada se o valor não for encontrado no cache
   * @param ttlSeconds Tempo de vida em segundos (padrão: 300 segundos = 5 minutos)
   * @returns O valor do cache ou o resultado da função fallback
   */
  public async getOrSet<T>(
    key: string, 
    fallback: () => Promise<T>, 
    ttlSeconds: number = 300
  ): Promise<T> {
    if (!this.enabled) return await fallback();
    
    try {
      const cachedValue = await this.get<T>(key);
      if (cachedValue !== null) {
        this.logger.debug(`Cache encontrado para chave: ${key}`);
        return cachedValue;
      }
      
      this.logger.debug(`Cache não encontrado para chave: ${key}, executando fallback`);
      const value = await fallback();
      await this.set(key, value, ttlSeconds);
      return value;
    } catch (error) {
      this.logger.error(`Erro ao obter/definir cache para chave ${key}:`, error);
      return await fallback();
    }
  }

  /**
   * Remove um valor do cache
   * @param key Chave do cache
   */
  public async delete(key: string): Promise<void> {
    if (!this.enabled) return;
    
    try {
      await this.client.del(key);
      this.logger.debug(`Cache removido para chave: ${key}`);
    } catch (error) {
      this.logger.error(`Erro ao remover cache para chave ${key}:`, error);
    }
  }

  /**
   * Remove múltiplos valores do cache usando um padrão
   * @param pattern Padrão de chaves a serem removidas (ex: "user:*")
   */
  public async deleteByPattern(pattern: string): Promise<void> {
    if (!this.enabled) return;
    
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        this.logger.debug(`${keys.length} chaves removidas com padrão: ${pattern}`);
      }
    } catch (error) {
      this.logger.error(`Erro ao remover cache com padrão ${pattern}:`, error);
    }
  }

  /**
   * Limpa todo o cache
   */
  public async clear(): Promise<void> {
    if (!this.enabled) return;
    
    try {
      await this.client.flushdb();
      this.logger.info('Cache limpo completamente');
    } catch (error) {
      this.logger.error('Erro ao limpar cache:', error);
    }
  }
} 