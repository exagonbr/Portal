import getRedisClient from '../config/redis';
import { Logger } from '../utils/Logger';

export class CacheService {
  private static instance: CacheService;
  private client = getRedisClient;
  private logger = new Logger('CacheService');

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error(`Erro ao obter cache para a chave ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      this.logger.error(`Erro ao definir cache para a chave ${key}:`, error);
    }
  }

  async getOrSet<T>(key: string, fallback: () => Promise<T>, ttl: number = 3600): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) {
      return cached;
    }

    const result = await fallback();
    await this.set(key, result, ttl);
    return result;
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Erro ao deletar cache para a chave ${key}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.client.flushdb();
    } catch (error) {
      this.logger.error('Erro ao limpar o cache:', error);
    }
  }
}

export const cacheService = CacheService.getInstance();