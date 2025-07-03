import { getRedisClient, TTL } from '../config/redis';
import { cacheService, CacheKeys, CacheTTL } from './CacheService';
import { RoleService } from './RoleService';
import { Logger } from '../utils/Logger';
import db from '../config/database';

export interface WarmupTask {
  key: string;
  priority: 'high' | 'medium' | 'low';
  ttl: number;
  tags: string[];
  task: () => Promise<any>;
  dependencies?: string[];
  schedule?: string; // cron expression
}

export interface WarmupStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  duration: number;
  lastRun: Date;
}

/**
 * Serviço avançado para warmup de cache
 * Inclui funcionalidades como:
 * - Warmup prioritizado
 * - Warmup incremental
 * - Warmup agendado
 * - Warmup baseado em uso
 * - Dependências entre tarefas
 */
export class CacheWarmupService {
  private static logger = new Logger('CacheWarmupService');
  private static redis = getRedisClient();
  private static roleService = new RoleService();
  private static warmupTasks: Map<string, WarmupTask> = new Map();
  private static stats: WarmupStats = {
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    duration: 0,
    lastRun: new Date()
  };

  /**
   * Registra todas as tarefas de warmup padrão
   */
  public static async initialize(): Promise<void> {
    this.logger.info('🔧 Inicializando tarefas de warmup...');

    // Registrar tarefas de warmup
    await this.registerDefaultTasks();
    
    // Configurar warmup automático no cacheService
    this.setupCacheServiceIntegration();
    
    this.logger.info(`✅ ${this.warmupTasks.size} tarefas de warmup registradas`);
  }

  /**
   * Registra tarefas padrão de warmup
   */
  private static async registerDefaultTasks(): Promise<void> {
    // Warmup de roles (alta prioridade)
    this.registerTask({
      key: 'roles_active',
      priority: 'high',
      ttl: CacheTTL.LONG,
      tags: ['roles', 'static'],
      task: () => this.warmupRoles()
    });

    // Warmup de usuários ativos (média prioridade)
    this.registerTask({
      key: 'users_active',
      priority: 'medium',
      ttl: CacheTTL.MEDIUM,
      tags: ['users', 'dynamic'],
      task: () => this.warmupActiveUsers(),
      dependencies: ['roles_active']
    });

    // Warmup de cursos populares (média prioridade)
    this.registerTask({
      key: 'courses_popular',
      priority: 'medium',
      ttl: CacheTTL.LONG,
      tags: ['courses', 'static'],
      task: () => this.warmupPopularCourses()
    });

    // Warmup de configurações do sistema (alta prioridade)
    this.registerTask({
      key: 'system_config',
      priority: 'high',
      ttl: CacheTTL.STATIC,
      tags: ['config', 'static'],
      task: () => this.warmupSystemConfig()
    });

    // Warmup de estatísticas (baixa prioridade)
    this.registerTask({
      key: 'dashboard_stats',
      priority: 'low',
      ttl: CacheTTL.SHORT,
      tags: ['stats', 'dynamic'],
      task: () => this.warmupDashboardStats()
    });

    // Warmup de livros mais acessados (média prioridade)
    this.registerTask({
      key: 'books_popular',
      priority: 'medium',
      ttl: CacheTTL.LONG,
      tags: ['books', 'static'],
      task: () => this.warmupPopularBooks()
    });
  }

  /**
   * Registra uma tarefa de warmup
   */
  public static registerTask(task: WarmupTask): void {
    this.warmupTasks.set(task.key, task);
    
    // Registrar no cacheService também
    cacheService.registerWarmupTask(task.key, task.task);
    
    this.logger.debug(`📝 Tarefa registrada: ${task.key} (prioridade: ${task.priority})`);
  }

  /**
   * Configura integração com cacheService
   */
  private static setupCacheServiceIntegration(): void {
    // Registrar todas as tarefas no cacheService
    for (const [key, task] of this.warmupTasks) {
      cacheService.registerWarmupTask(key, task.task);
    }
  }

  /**
   * Executa warmup completo com priorização
   */
  public static async warmupCache(options: {
    priority?: 'high' | 'medium' | 'low' | 'all';
    maxConcurrent?: number;
    timeout?: number;
  } = {}): Promise<WarmupStats> {
    const {
      priority = 'all',
      maxConcurrent = 5,
      timeout = 30000
    } = options;

    const startTime = Date.now();
    this.logger.info(`🔥 Iniciando warmup (prioridade: ${priority})...`);

    // Filtrar tarefas por prioridade
    const tasksToRun = this.filterTasksByPriority(priority);
    
    // Ordenar por prioridade e dependências
    const orderedTasks = this.orderTasksByDependencies(tasksToRun);

    this.stats.totalTasks = orderedTasks.length;
    this.stats.completedTasks = 0;
    this.stats.failedTasks = 0;

    // Executar tarefas em lotes
    await this.executeBatches(orderedTasks, maxConcurrent, timeout);

    this.stats.duration = Date.now() - startTime;
    this.stats.lastRun = new Date();

    this.logger.info(`🔥 Warmup concluído: ${this.stats.completedTasks}/${this.stats.totalTasks} tarefas (${this.stats.duration}ms)`);
    
    return { ...this.stats };
  }

  /**
   * Filtra tarefas por prioridade
   */
  private static filterTasksByPriority(priority: string): WarmupTask[] {
    if (priority === 'all') {
      return Array.from(this.warmupTasks.values());
    }

    return Array.from(this.warmupTasks.values())
      .filter(task => task.priority === priority);
  }

  /**
   * Ordena tarefas por dependências
   */
  private static orderTasksByDependencies(tasks: WarmupTask[]): WarmupTask[] {
    const ordered: WarmupTask[] = [];
    const completed = new Set<string>();
    const remaining = [...tasks];

    while (remaining.length > 0) {
      const readyTasks = remaining.filter(task => 
        !task.dependencies || 
        task.dependencies.every(dep => completed.has(dep))
      );

      if (readyTasks.length === 0) {
        // Evitar loop infinito - adicionar tarefas restantes
        ordered.push(...remaining);
        break;
      }

      // Adicionar tarefas prontas ordenadas por prioridade
      readyTasks.sort((a, b) => {
        const priorities = { high: 3, medium: 2, low: 1 };
        return priorities[b.priority] - priorities[a.priority];
      });

      for (const task of readyTasks) {
        ordered.push(task);
        completed.add(task.key);
        remaining.splice(remaining.indexOf(task), 1);
      }
    }

    return ordered;
  }

  /**
   * Executa tarefas em lotes
   */
  private static async executeBatches(
    tasks: WarmupTask[], 
    maxConcurrent: number, 
    timeout: number
  ): Promise<void> {
    for (let i = 0; i < tasks.length; i += maxConcurrent) {
      const batch = tasks.slice(i, i + maxConcurrent);
      
      const promises = batch.map(task => 
        this.executeTaskWithTimeout(task, timeout)
      );

      await Promise.allSettled(promises);
    }
  }

  /**
   * Executa uma tarefa com timeout
   */
  private static async executeTaskWithTimeout(
    task: WarmupTask, 
    timeout: number
  ): Promise<void> {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      );

      await Promise.race([task.task(), timeoutPromise]);
      
      this.stats.completedTasks++;
      this.logger.debug(`✅ Warmup concluído: ${task.key}`);
    } catch (error) {
      this.stats.failedTasks++;
      this.logger.error(`❌ Erro no warmup ${task.key}:`, error);
    }
  }

  /**
   * Warmup de roles
   */
  private static async warmupRoles(): Promise<void> {
    const activeRolesParams = {
      active: true,
      page: 1,
      limit: 100,
      sortBy: "name" as const,
      sortOrder: "asc" as const
    };

    const result = await this.roleService.findRolesWithFilters(activeRolesParams);
    
    if (result.success && result.data) {
      await cacheService.staticCache(
        CacheKeys.ROLE_LIST(JSON.stringify(activeRolesParams)),
        result.data,
        { tags: ['roles', 'static'] }
      );
    }
  }

  /**
   * Warmup de usuários ativos
   */
  private static async warmupActiveUsers(): Promise<void> {
    try {
      // Query para usuários ativos (últimos 30 dias)
      const activeUsers = await db('users')
        .select('id', 'name', 'email', 'role', 'last_login')
        .where('last_login', '>', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .limit(100);

      await cacheService.dynamicCache(
        'users:active:recent',
        activeUsers,
        { tags: ['users', 'dynamic'] }
      );
    } catch (error) {
      this.logger.error('Erro no warmup de usuários ativos:', error);
    }
  }

  /**
   * Warmup de cursos populares
   */
  private static async warmupPopularCourses(): Promise<void> {
    try {
      // Query para cursos mais acessados
      const popularCourses = await db('courses')
        .select('*')
        .where('active', true)
        .orderBy('access_count', 'desc')
        .limit(50);

      await cacheService.staticCache(
        'courses:popular',
        popularCourses,
        { tags: ['courses', 'static'] }
      );
    } catch (error) {
      this.logger.error('Erro no warmup de cursos populares:', error);
    }
  }

  /**
   * Warmup de configurações do sistema
   */
  private static async warmupSystemConfig(): Promise<void> {
    try {
      const config = {
        app_name: 'Portal Sabercon',
        version: '2.0.0',
        features: {
          cache: true,
          notifications: true,
          analytics: true
        },
        limits: {
          max_upload_size: '10MB',
          max_users_per_course: 1000
        }
      };

      await cacheService.staticCache(
        CacheKeys.STATIC_CONFIG,
        config,
        { tags: ['config', 'static'] }
      );
    } catch (error) {
      this.logger.error('Erro no warmup de configurações:', error);
    }
  }

  /**
   * Warmup de estatísticas do dashboard
   */
  private static async warmupDashboardStats(): Promise<void> {
    try {
      const stats = {
        total_users: await db('users').count('* as count').first(),
        total_courses: await db('courses').count('* as count').first(),
        total_books: await db('books').count('* as count').first(),
        active_sessions: await db('user_sessions')
          .where('expires_at', '>', new Date())
          .count('* as count')
          .first()
      };

      await cacheService.dynamicCache(
        'dashboard:stats',
        stats,
        { tags: ['stats', 'dynamic'] }
      );
    } catch (error) {
      this.logger.error('Erro no warmup de estatísticas:', error);
    }
  }

  /**
   * Warmup de livros populares
   */
  private static async warmupPopularBooks(): Promise<void> {
    try {
      const popularBooks = await db('books')
        .select('*')
        .where('active', true)
        .orderBy('download_count', 'desc')
        .limit(50);

      await cacheService.staticCache(
        'books:popular',
        popularBooks,
        { tags: ['books', 'static'] }
      );
    } catch (error) {
      this.logger.error('Erro no warmup de livros populares:', error);
    }
  }

  /**
   * Warmup incremental baseado em uso
   */
  public static async incrementalWarmup(): Promise<void> {
    this.logger.info('🔄 Iniciando warmup incremental...');

    try {
      // Obter chaves mais acessadas do Redis
      const pattern = `${process.env.CACHE_PREFIX || 'portal_cache:'}*`;
      const keys = await this.redis.keys(pattern);
      
      // Analisar estatísticas de acesso (simplificado)
      const accessStats = new Map<string, number>();
      
      for (const key of keys.slice(0, 100)) { // Limitar para performance
        try {
          const ttl = await this.redis.ttl(key);
          if (ttl > 0) {
            accessStats.set(key, ttl);
          }
        } catch (error) {
          // Ignorar erros individuais
        }
      }

      // Renovar chaves que estão prestes a expirar
      const expiringKeys = Array.from(accessStats.entries())
        .filter(([_, ttl]) => ttl < 300) // Menos de 5 minutos
        .map(([key]) => key);

      if (expiringKeys.length > 0) {
        this.logger.info(`🔄 Renovando ${expiringKeys.length} chaves expirando...`);
        
        // Executar warmup para tarefas relacionadas
        await this.warmupCache({ priority: 'high', maxConcurrent: 3 });
      }
    } catch (error) {
      this.logger.error('Erro no warmup incremental:', error);
    }
  }

  /**
   * Agenda warmup automático
   */
  public static scheduleWarmup(): void {
    // Warmup completo a cada 6 horas
    setInterval(async () => {
      await this.warmupCache({ priority: 'all' });
    }, 6 * 60 * 60 * 1000);

    // Warmup incremental a cada 30 minutos
    setInterval(async () => {
      await this.incrementalWarmup();
    }, 30 * 60 * 1000);

    // Warmup de alta prioridade a cada hora
    setInterval(async () => {
      await this.warmupCache({ priority: 'high' });
    }, 60 * 60 * 1000);

    this.logger.info('⏰ Warmup automático agendado');
  }

  /**
   * Obtém estatísticas do warmup
   */
  public static getStats(): WarmupStats {
    return { ...this.stats };
  }

  /**
   * Lista tarefas registradas
   */
  public static listTasks(): Array<{ key: string; priority: string; tags: string[] }> {
    return Array.from(this.warmupTasks.values()).map(task => ({
      key: task.key,
      priority: task.priority,
      tags: task.tags
    }));
  }

  /**
   * Verifica saúde do warmup
   */
  public static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  }> {
    const stats = this.getStats();
    const tasks = this.listTasks();
    
    const successRate = stats.totalTasks > 0 
      ? stats.completedTasks / stats.totalTasks 
      : 1;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (successRate < 0.5) {
      status = 'unhealthy';
    } else if (successRate < 0.8) {
      status = 'degraded';
    }

    return {
      status,
      details: {
        stats,
        tasks_count: tasks.length,
        success_rate: successRate,
        last_run_ago: Date.now() - stats.lastRun.getTime()
      }
    };
  }
} 