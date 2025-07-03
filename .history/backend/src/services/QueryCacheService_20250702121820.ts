import { cacheService, CacheKeys, CacheTTL } from './CacheService';
import { Logger } from '../utils/Logger';
import crypto from 'crypto';
import db from '../config/database';

export interface QueryCacheOptions {
  ttl?: number;
  tags?: string[];
  invalidateOnTables?: string[];
  keyPrefix?: string;
  compress?: boolean;
}

export interface QueryStats {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  avgExecutionTime: number;
  cacheHitRatio: number;
}

/**
 * Serviço especializado para cache de queries de banco de dados
 * Inclui funcionalidades como:
 * - Cache automático de queries
 * - Invalidação baseada em tabelas
 * - Análise de performance
 * - Cache inteligente baseado em padrões
 */
export class QueryCacheService {
  private static logger = new Logger('QueryCacheService');
  private static stats: QueryStats = {
    totalQueries: 0,
    cacheHits: 0,
    cacheMisses: 0,
    avgExecutionTime: 0,
    cacheHitRatio: 0
  };

  private static executionTimes: number[] = [];
  private static readonly MAX_EXECUTION_HISTORY = 1000;

  /**
   * Executa uma query com cache automático
   */
  public static async cachedQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    options: QueryCacheOptions = {}
  ): Promise<T> {
    const {
      ttl = CacheTTL.QUERY,
      tags = ['queries'],
      invalidateOnTables = [],
      keyPrefix = 'query',
      compress = false
    } = options;

    const cacheKey = this.generateCacheKey(queryKey, keyPrefix);
    const startTime = Date.now();

    try {
      // Tentar obter do cache
      const cachedResult = await cacheService.get<T>(cacheKey);
      
      if (cachedResult !== null) {
        this.updateStats(true, Date.now() - startTime);
        this.logger.debug(`✅ Query cache hit: ${queryKey}`);
        return cachedResult;
      }

      // Cache miss - executar query
      this.logger.debug(`❌ Query cache miss: ${queryKey}`);
      const result = await queryFn();
      const executionTime = Date.now() - startTime;

      // Salvar no cache
      await cacheService.set(cacheKey, result, {
        ttl,
        tags: [...tags, ...invalidateOnTables.map(table => `table:${table}`)],
        compress
      });

      this.updateStats(false, executionTime);
      this.logger.debug(`💾 Query cached: ${queryKey} (${executionTime}ms)`);

      return result;
    } catch (error) {
      this.logger.error(`❌ Erro na query ${queryKey}:`, error);
      throw error;
    }
  }

  /**
   * Cache para queries de usuários
   */
  public static async cacheUserQuery<T>(
    queryFn: () => Promise<T>,
    filters: Record<string, any> = {},
    ttl: number = CacheTTL.MEDIUM
  ): Promise<T> {
    const queryKey = `users:${this.hashFilters(filters)}`;
    
    return this.cachedQuery(queryKey, queryFn, {
      ttl,
      tags: ['users', 'queries'],
      invalidateOnTables: ['users', 'user_roles', 'user_sessions'],
      keyPrefix: 'user_query'
    });
  }

  /**
   * Cache para queries de cursos
   */
  public static async cacheCourseQuery<T>(
    queryFn: () => Promise<T>,
    filters: Record<string, any> = {},
    ttl: number = CacheTTL.LONG
  ): Promise<T> {
    const queryKey = `courses:${this.hashFilters(filters)}`;
    
    return this.cachedQuery(queryKey, queryFn, {
      ttl,
      tags: ['courses', 'queries'],
      invalidateOnTables: ['courses', 'course_users', 'course_content'],
      keyPrefix: 'course_query'
    });
  }

  /**
   * Cache para queries de livros
   */
  public static async cacheBookQuery<T>(
    queryFn: () => Promise<T>,
    filters: Record<string, any> = {},
    ttl: number = CacheTTL.LONG
  ): Promise<T> {
    const queryKey = `books:${this.hashFilters(filters)}`;
    
    return this.cachedQuery(queryKey, queryFn, {
      ttl,
      tags: ['books', 'queries'],
      invalidateOnTables: ['books', 'book_progress', 'book_annotations'],
      keyPrefix: 'book_query'
    });
  }

  /**
   * Cache para queries de instituições
   */
  public static async cacheInstitutionQuery<T>(
    queryFn: () => Promise<T>,
    filters: Record<string, any> = {},
    ttl: number = CacheTTL.LONG
  ): Promise<T> {
    const queryKey = `institutions:${this.hashFilters(filters)}`;
    
    return this.cachedQuery(queryKey, queryFn, {
      ttl,
      tags: ['institutions', 'queries'],
      invalidateOnTables: ['institutions', 'institution_users', 'institution_courses'],
      keyPrefix: 'institution_query'
    });
  }

  /**
   * Cache para queries de estatísticas
   */
  public static async cacheStatsQuery<T>(
    queryFn: () => Promise<T>,
    period: string = 'daily',
    ttl: number = CacheTTL.SHORT
  ): Promise<T> {
    const queryKey = `stats:${period}:${Date.now().toString().slice(0, -5)}`; // Arredondar para 5 minutos
    
    return this.cachedQuery(queryKey, queryFn, {
      ttl,
      tags: ['stats', 'queries'],
      invalidateOnTables: ['users', 'courses', 'books', 'user_sessions'],
      keyPrefix: 'stats_query'
    });
  }

  /**
   * Cache para queries de dashboard
   */
  public static async cacheDashboardQuery<T>(
    queryFn: () => Promise<T>,
    userId: string,
    ttl: number = CacheTTL.SHORT
  ): Promise<T> {
    const queryKey = `dashboard:${userId}`;
    
    return this.cachedQuery(queryKey, queryFn, {
      ttl,
      tags: ['dashboard', 'queries', `user:${userId}`],
      invalidateOnTables: ['courses', 'books', 'user_progress', 'announcements'],
      keyPrefix: 'dashboard_query'
    });
  }

  /**
   * Invalida cache por tabela
   */
  public static async invalidateByTable(tableName: string): Promise<void> {
    try {
      await cacheService.invalidateByTag(`table:${tableName}`);
      this.logger.info(`🗑️ Cache invalidado para tabela: ${tableName}`);
    } catch (error) {
      this.logger.error(`❌ Erro ao invalidar cache da tabela ${tableName}:`, error);
    }
  }

  /**
   * Invalida múltiplas tabelas
   */
  public static async invalidateByTables(tableNames: string[]): Promise<void> {
    const promises = tableNames.map(table => this.invalidateByTable(table));
    await Promise.allSettled(promises);
  }

  /**
   * Invalida cache por tipo de entidade
   */
  public static async invalidateByEntity(entityType: string): Promise<void> {
    const tableMap: Record<string, string[]> = {
      user: ['users', 'user_roles', 'user_sessions', 'user_progress'],
      course: ['courses', 'course_users', 'course_content', 'course_progress'],
      book: ['books', 'book_progress', 'book_annotations'],
      institution: ['institutions', 'institution_users', 'institution_courses']
    };

    const tables = tableMap[entityType] || [entityType];
    await this.invalidateByTables(tables);
  }

  /**
   * Gera chave de cache
   */
  private static generateCacheKey(queryKey: string, prefix: string): string {
    return `${prefix}:${queryKey}`;
  }

  /**
   * Gera hash para filtros
   */
  private static hashFilters(filters: Record<string, any>): string {
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((obj, key) => {
        obj[key] = filters[key];
        return obj;
      }, {} as Record<string, any>);

    return crypto
      .createHash('md5')
      .update(JSON.stringify(sortedFilters))
      .digest('hex');
  }

  /**
   * Atualiza estatísticas
   */
  private static updateStats(isHit: boolean, executionTime: number): void {
    this.stats.totalQueries++;
    
    if (isHit) {
      this.stats.cacheHits++;
    } else {
      this.stats.cacheMisses++;
    }

    // Atualizar tempo médio de execução
    this.executionTimes.push(executionTime);
    if (this.executionTimes.length > this.MAX_EXECUTION_HISTORY) {
      this.executionTimes.shift();
    }

    this.stats.avgExecutionTime = this.executionTimes.reduce((a, b) => a + b, 0) / this.executionTimes.length;
    this.stats.cacheHitRatio = this.stats.cacheHits / this.stats.totalQueries;
  }

  /**
   * Obtém estatísticas do cache de queries
   */
  public static getStats(): QueryStats {
    return { ...this.stats };
  }

  /**
   * Reseta estatísticas
   */
  public static resetStats(): void {
    this.stats = {
      totalQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgExecutionTime: 0,
      cacheHitRatio: 0
    };
    this.executionTimes = [];
  }

  /**
   * Pré-aquece queries mais comuns
   */
  public static async warmupCommonQueries(): Promise<void> {
    this.logger.info('🔥 Iniciando warmup de queries comuns...');

    try {
      // Warmup de usuários ativos
      await this.cacheUserQuery(async () => {
        return db('users')
          .select('id', 'name', 'email', 'role')
          .where('active', true)
          .limit(100);
      }, { active: true });

      // Warmup de cursos ativos
      await this.cacheCourseQuery(async () => {
        return db('courses')
          .select('*')
          .where('active', true)
          .orderBy('created_at', 'desc')
          .limit(50);
      }, { active: true });

      // Warmup de livros populares
      await this.cacheBookQuery(async () => {
        return db('books')
          .select('*')
          .where('active', true)
          .orderBy('download_count', 'desc')
          .limit(50);
      }, { popular: true });

      // Warmup de estatísticas básicas
      await this.cacheStatsQuery(async () => {
        return {
          users: await db('users').count('* as count').first(),
          courses: await db('courses').count('* as count').first(),
          books: await db('books').count('* as count').first()
        };
      });

      this.logger.info('✅ Warmup de queries comuns concluído');
    } catch (error) {
      this.logger.error('❌ Erro no warmup de queries:', error);
    }
  }

  /**
   * Analisa padrões de uso para otimização
   */
  public static analyzeUsagePatterns(): {
    hitRatio: number;
    avgExecutionTime: number;
    recommendations: string[];
  } {
    const stats = this.getStats();
    const recommendations: string[] = [];

    // Analisar hit ratio
    if (stats.cacheHitRatio < 0.5) {
      recommendations.push('Hit ratio baixo - considere aumentar TTL ou melhorar estratégia de cache');
    } else if (stats.cacheHitRatio > 0.9) {
      recommendations.push('Hit ratio muito alto - considere reduzir TTL para dados mais frescos');
    }

    // Analisar tempo de execução
    if (stats.avgExecutionTime > 1000) {
      recommendations.push('Tempo médio alto - considere otimizar queries ou aumentar cache');
    }

    // Analisar volume de queries
    if (stats.totalQueries > 10000) {
      recommendations.push('Alto volume de queries - considere implementar cache preditivo');
    }

    return {
      hitRatio: stats.cacheHitRatio,
      avgExecutionTime: stats.avgExecutionTime,
      recommendations
    };
  }

  /**
   * Verifica saúde do cache de queries
   */
  public static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  }> {
    const stats = this.getStats();
    const analysis = this.analyzeUsagePatterns();
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (stats.cacheHitRatio < 0.3 || stats.avgExecutionTime > 2000) {
      status = 'unhealthy';
    } else if (stats.cacheHitRatio < 0.6 || stats.avgExecutionTime > 1000) {
      status = 'degraded';
    }

    return {
      status,
      details: {
        stats,
        analysis,
        cache_service_health: await cacheService.healthCheck()
      }
    };
  }
}

export default QueryCacheService; 