import { getRedisClient, TTL } from '../config/redis';
import { RoleService } from './RoleService';
import { Logger } from '../utils/Logger';

export class CacheWarmupService {
  private static logger = new Logger('CacheWarmupService');
  private static redis = getRedisClient();
  private static roleService = new RoleService();

  /**
   * Realiza o warmup do cache para as chaves mais comuns
   */
  public static async warmupCache(): Promise<void> {
    this.logger.info('Iniciando warmup do cache...');
    
    try {
      // Lista de promessas para aguardar todas as operações de cache
      const promises: Promise<any>[] = [];
      
      // Warmup para chaves de roles
      promises.push(this.warmupRolesCache());
      
      // Adicionar aqui outros tipos de chaves para warmup:
      // promises.push(this.warmupUsersCache());
      // promises.push(this.warmupCoursesCache());
      // etc.
      
      // Aguardar todas as operações de cache
      await Promise.all(promises);
      
      this.logger.info('Warmup do cache concluído com sucesso');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro durante o warmup do cache: ${errorMessage}`, null, error instanceof Error ? error : undefined);
    }
  }
  
  /**
   * Realiza o warmup do cache para chaves relacionadas a roles
   */
  private static async warmupRolesCache(): Promise<void> {
    this.logger.info('Iniciando warmup do cache para roles...');
    
    try {
      // 1. Buscar roles ativos
      const activeRolesParams = {
        active: true,
        page: 1,
        limit: 100,
        sortBy: "name" as "name" | "created_at" | "updated_at" | "user_count" | undefined,
        sortOrder: "asc" as "asc" | "desc" | undefined
      };
      
      const activeRolesResult = await this.roleService.findRolesWithFilters(activeRolesParams);
      
      if (activeRolesResult.success && activeRolesResult.data) {
        // Definir as chaves de cache
        const activeRolesKey = 'portal_sabercon:roles:active';
        const activeRolesListKey = `portal_sabercon:roles:list:${JSON.stringify(activeRolesParams)}`;
        
        // Armazenar no cache
        await this.redis.set(activeRolesKey, JSON.stringify(activeRolesResult.data), 'EX', TTL.CACHE);
        await this.redis.set(activeRolesListKey, JSON.stringify(activeRolesResult.data), 'EX', TTL.CACHE);
        
        this.logger.info(`Cache populado: ${activeRolesKey}`);
        this.logger.info(`Cache populado: ${activeRolesListKey}`);
      }
      
      // 2. Buscar todos os roles
      const allRolesParams = {
        page: 1,
        limit: 100,
        sortBy: "name" as "name" | "created_at" | "updated_at" | "user_count" | undefined,
        sortOrder: "asc" as "asc" | "desc" | undefined
      };
      
      const allRolesResult = await this.roleService.findRolesWithFilters(allRolesParams);
      
      if (allRolesResult.success && allRolesResult.data) {
        // Definir a chave de cache
        const allRolesListKey = `portal_sabercon:roles:list:${JSON.stringify(allRolesParams)}`;
        
        // Armazenar no cache
        await this.redis.set(allRolesListKey, JSON.stringify(allRolesResult.data), 'EX', TTL.CACHE);
        
        this.logger.info(`Cache populado: ${allRolesListKey}`);
      }
      
      // 3. Buscar roles de sistema e personalizados
      const systemRolesParams = {
        type: "system" as "system" | "custom" | undefined,
        page: 1,
        limit: 100,
        sortBy: "name" as "name" | "created_at" | "updated_at" | "user_count" | undefined,
        sortOrder: "asc" as "asc" | "desc" | undefined
      };
      
      const customRolesParams = {
        type: "custom" as "system" | "custom" | undefined,
        page: 1,
        limit: 100,
        sortBy: "name" as "name" | "created_at" | "updated_at" | "user_count" | undefined,
        sortOrder: "asc" as "asc" | "desc" | undefined
      };
      
      const systemRolesResult = await this.roleService.findRolesWithFilters(systemRolesParams);
      const customRolesResult = await this.roleService.findRolesWithFilters(customRolesParams);
      
      if (systemRolesResult.success && systemRolesResult.data) {
        const systemRolesKey = `portal_sabercon:roles:list:${JSON.stringify(systemRolesParams)}`;
        await this.redis.set(systemRolesKey, JSON.stringify(systemRolesResult.data), 'EX', TTL.CACHE);
        this.logger.info(`Cache populado: ${systemRolesKey}`);
      }
      
      if (customRolesResult.success && customRolesResult.data) {
        const customRolesKey = `portal_sabercon:roles:list:${JSON.stringify(customRolesParams)}`;
        await this.redis.set(customRolesKey, JSON.stringify(customRolesResult.data), 'EX', TTL.CACHE);
        this.logger.info(`Cache populado: ${customRolesKey}`);
      }
      
      this.logger.info('Warmup do cache para roles concluído com sucesso');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro durante o warmup do cache para roles: ${errorMessage}`, null, error instanceof Error ? error : undefined);
    }
  }
} 