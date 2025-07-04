import { cacheService } from './CacheService';
import { Logger } from '../utils/Logger';
import crypto from 'crypto';

export class QueryCacheService {
  private static logger = new Logger('QueryCacheService');

  public static async cachedQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(queryKey);
    
    const cachedResult = await cacheService.get<T>(cacheKey);
    if (cachedResult) {
      this.logger.info(`✅ Query cache hit: ${queryKey}`);
      return cachedResult;
    }

    this.logger.info(`❌ Query cache miss: ${queryKey}`);
    const result = await queryFn();
    await cacheService.set(cacheKey, result, ttl);
    
    return result;
  }

  private static generateCacheKey(queryKey: string): string {
    return `query:${crypto.createHash('md5').update(queryKey).digest('hex')}`;
  }
}

export default QueryCacheService;