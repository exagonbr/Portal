// import { AppDataSource } from '../config/typeorm.config'; // Removido - usando Knex agora
// import { User } from '../entities/User'; // Removido - agora é interface
import { UserRepository } from '../repositories/UserRepository';
import db from '../config/database';
import { SessionService } from './SessionService';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    byRole: Record<string, number>;
    byInstitution: Record<string, number>;
  };
  sessions: {
    activeUsers: number;
    totalActiveSessions: number;
    sessionsByDevice: Record<string, number>;
    averageSessionDuration: number;
  };
  system: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    version: string;
    environment: string;
  };
  recent: {
    registrations: any[];
    logins: any[];
  };
}

interface UserDashboard {
  user: {
    profile: any;
    stats: {
      coursesEnrolled: number;
      coursesCompleted: number;
      totalStudyTime: number;
      achievements: number;
    };
  };
  courses: {
    inProgress: any[];
    completed: any[];
    recent: any[];
  };
  activity: {
    recentSessions: any[];
    studyStreak: number;
    lastAccess: Date;
  };
}

export class DashboardService {
  // private static redis = getRedisClient(); // Removido - não está sendo usado
  // private static userRepository = new UserRepository(); // Removido - usando métodos estáticos agora

  /**
   * Obtém estatísticas gerais do sistema para administradores
   */
  static async getSystemDashboard(): Promise<DashboardStats> {
    try {
      // Stats de usuários
      const userStats = await this.getUserStats();
      
      // Stats de sessões (simuladas)
      const sessionStats = {
        activeUsers: userStats.total,
        totalActiveSessions: userStats.total,
        sessionsByDevice: { 'web': userStats.total },
        averageSessionDuration: 3600
      };
      
      // Stats do sistema
      const systemStats = {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      };

      // Atividades recentes
      const recentActivity = await this.getRecentActivity();

      return {
        users: userStats,
        sessions: sessionStats,
        system: systemStats,
        recent: recentActivity
      };
    } catch (error) {
      console.error('Erro ao obter dashboard do sistema:', error);
      throw new Error('Erro ao obter estatísticas do sistema');
    }
  }

  /**
   * Obtém dashboard personalizado para um usuário
   */
  static async getUserDashboard(userId: number): Promise<UserDashboard> {
    try {
      // Busca dados do usuário
      const user = await UserRepository.findById(userId);

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Stats do usuário (simulados)
      const userStats = {
        coursesEnrolled: 0,
        coursesCompleted: 0,
        totalStudyTime: 0,
        achievements: 0
      };
      
      // Cursos do usuário (simulados)
      const courseData = {
        inProgress: [],
        completed: [],
        recent: []
      };
      
      // Atividade do usuário
      const activityData = await this.getUserActivity(userId);

      return {
        user: {
          profile: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role?.name,
            institution: user.institution?.name,
            phone: user.phone,
            createdAt: user.created_at
          },
          stats: userStats
        },
        courses: courseData,
        activity: activityData
      };
    } catch (error) {
      console.error('Erro ao obter dashboard do usuário:', error);
      throw new Error('Erro ao obter dashboard do usuário');
    }
  }

  /**
   * Obtém estatísticas de usuários
   */
  private static async getUserStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total de usuários
    const totalUsers = await UserRepository.count();

    // Usuários ativos (simplificado - todos por enquanto)
    const activeUsers = totalUsers; // TODO: implementar lógica de last_login

    // Novos usuários este mês
    const newThisMonthResult = await db('users')
      .where('created_at', '>=', firstDayOfMonth)
      .count('id as count')
      .first();
    const newThisMonth = parseInt(newThisMonthResult?.count as string) || 0;

    // Usuários por role (simplificado)
    const byRole: Record<string, number> = { 'Total': totalUsers };

    // Usuários por instituição (simplificado)
    const byInstitution: Record<string, number> = { 'Total': totalUsers };

    return {
      total: totalUsers,
      active: activeUsers,
      newThisMonth,
      byRole,
      byInstitution
    };
  }

  /**
   * Obtém atividades recentes
   */
  private static async getRecentActivity() {
    // Últimos registros (últimos 10)
    const recentRegistrations = await UserRepository.findAll(10, 0);

    return {
      registrations: recentRegistrations.slice(0, 10),
      logins: recentRegistrations.slice(0, 10)
    };
  }

  /**
   * Obtém dados de atividade do usuário
   */
  private static async getUserActivity(userId: number) {
    // Sessões recentes do usuário
    const recentSessions = await SessionService.getUserSessions(userId.toString());
    
    // Streak de estudo (simulado)
    const studyStreak = 0;
    
    // Último acesso baseado na data de criação do usuário
    const user = await UserRepository.findById(userId);

    return {
      recentSessions: recentSessions.slice(0, 5),
      studyStreak,
      lastAccess: user?.created_at || new Date()
    };
  }

  /**
   * Obtém métricas em tempo real
   */
  static async getRealTimeMetrics() {
    try {
      const totalUsers = await UserRepository.count();
      
      // Obtém dados de sessões do SessionService
      const sessionStats = await SessionService.getSessionStats();
      
      return {
        activeUsers: sessionStats.activeUsers,
        activeSessions: sessionStats.totalActiveSessions,
        redisMemory: this.parseRedisMemoryInfo(JSON.stringify(process.memoryUsage())),
        timestamp: new Date().toISOString(),
        users: {
          total: totalUsers,
          online: sessionStats.activeUsers
        },
        system: {
          uptime: process.uptime(),
          memory: this.parseRedisMemoryInfo(JSON.stringify(process.memoryUsage()))
        }
      };
    } catch (error) {
      console.error('Erro ao obter métricas em tempo real:', error);
      throw error;
    }
  }

  /**
   * Parse das informações de memória
   */
  private static parseRedisMemoryInfo(info: string): string {
    return `${Math.round(JSON.parse(info).heapUsed / 1024 / 1024)}MB`;
  }

  /**
   * Obtém dados analíticos
   */
  static async getAnalyticsData(type: 'users' | 'sessions' | 'activity', period: 'day' | 'week' | 'month' = 'week') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    switch (type) {
      case 'users':
        return this.getUserAnalytics(startDate, now);
      case 'sessions':
        return { sessions: [] }; // Simplificado
      case 'activity':
        return { activity: [] }; // Simplificado
    }
  }

  /**
   * Obtém dados analíticos de usuários
   */
  private static async getUserAnalytics(startDate: Date, endDate: Date) {
    const registrations = await db('users')
      .select(db.raw('DATE(created_at) as date'))
      .count('id as count')
      .where('created_at', '>=', startDate)
      .where('created_at', '<=', endDate)
      .groupBy(db.raw('DATE(created_at)'))
      .orderBy('created_at');

    return {
      registrations
    };
  }
} 