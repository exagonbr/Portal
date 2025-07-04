import { cacheService } from './CacheService';
import { RoleService } from './RoleService';
import { UserService } from './UserService';
import { CourseService } from './CourseService';
import { Logger } from '../utils/Logger';

export class CacheWarmupService {
  private static logger = new Logger('CacheWarmupService');

  public static async initialize(): Promise<void> {
    this.logger.info('🔧 Inicializando tarefas de warmup...');
    await this.warmupRoles();
    await this.warmupActiveUsers();
    await this.warmupCourses();
    this.logger.info('✅ Tarefas de warmup concluídas');
  }

  private static async warmupRoles(): Promise<void> {
    try {
      const roleService = new RoleService();
      const { roles } = await roleService.findRolesWithFilters({ limit: 100 });
      await cacheService.set('warmup:roles', roles);
      this.logger.info('🔥 Cache de Roles aquecido');
    } catch (error) {
      this.logger.error('❌ Erro no warmup de Roles:', error);
    }
  }

  private static async warmupActiveUsers(): Promise<void> {
    try {
      const userService = new UserService();
      const { items } = await userService.getUsers({ limit: 100 });
      await cacheService.set('warmup:active_users', items);
      this.logger.info('🔥 Cache de Usuários Ativos aquecido');
    } catch (error) {
      this.logger.error('❌ Erro no warmup de Usuários Ativos:', error);
    }
  }

  private static async warmupCourses(): Promise<void> {
    try {
      const courseService = new CourseService();
      const { courses } = await courseService.findCoursesWithFilters({ limit: 50 });
      await cacheService.set('warmup:courses', courses);
      this.logger.info('🔥 Cache de Cursos aquecido');
    } catch (error) {
      this.logger.error('❌ Erro no warmup de Cursos:', error);
    }
  }
}