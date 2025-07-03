import { AppDataSource } from '../config/typeorm.config';
import { User } from '../entities/User';
import { getRedisClient } from '../config/redis';
import { SessionService } from './SessionService';
import { UserRepository } from '../repositories/UserRepository';
import { MoreThanOrEqual } from 'typeorm';

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
  private static redis = getRedisClient();
  private static userRepository = new UserRepository();

  /**
   * Obtém estatísticas gerais do sistema para administradores
   */
  static async getSystemDashboard(): Promise<DashboardStats> {
    try {
      const [userStats, sessionStats, recentActivity] = await Promise.all([
        this.getUserStats(),
        SessionService.getSessionStats(),
        this.getRecentActivity()
      ]);

      const systemStats = {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      };

      return {
        users: userStats,
        sessions: {
          ...sessionStats,
          averageSessionDuration: await this.getAverageSessionDuration()
        },
        system: systemStats,
        recent: recentActivity
      };
    } catch (error) {
      console.error('Erro ao obter dashboard do sistema:', error);
      // Return a fallback dashboard object to prevent crashes
      return {
        users: { total: 0, active: 0, newThisMonth: 0, byRole: {}, byInstitution: {} },
        sessions: { activeUsers: 0, totalActiveSessions: 0, sessionsByDevice: {}, averageSessionDuration: 0 },
        system: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        },
        recent: { registrations: [], logins: [] }
      };
    }
  }

  /**
   * Obtém dashboard personalizado para um usuário
   */
  static async getUserDashboard(userId: string): Promise<UserDashboard> {
    try {
      // Busca dados do usuário
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['role', 'institution']
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Stats do usuário
      const userStats = await this.getUserPersonalStats(userId);
      
      // Cursos do usuário
      const courseData = await this.getUserCourseData(userId);
      
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
  static async getUserStats() {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        totalUsers,
        activeUsers,
        newThisMonth,
        byRole,
        byInstitution
      ] = await Promise.all([
        this.userRepository.count(),
        this.userRepository.count({ where: { last_login: { '>=': thirtyDaysAgo } } }),
        this.userRepository.count({ where: { created_at: { '>=': firstDayOfMonth } } }),
        this.userRepository.getUserStatsByRole(),
        this.userRepository.createQueryBuilder('user')
          .leftJoin('user.institution', 'institution')
          .select('institution.name', 'institution')
          .addSelect('COUNT(user.id)', 'count')
          .groupBy('institution.name')
          .getRawMany()
          .then(results => {
            const stats: Record<string, number> = {};
            results.forEach(item => {
              stats[item.institution || 'Sem Instituição'] = parseInt(item.count, 10) || 0;
            });
            return stats;
          })
      ]);

      return {
        total: totalUsers,
        active: activeUsers,
        newThisMonth,
        byRole,
        byInstitution
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de usuários:', error);
      return {
        total: 0,
        active: 0,
        newThisMonth: 0,
        byRole: {},
        byInstitution: {}
      };
    }
  }

  /**
   * Obtém atividades recentes
   */
  private static async getRecentActivity() {
    // Últimos registros (últimos 10)
    const recentRegistrations = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .leftJoin('user.institution', 'institution')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.created_at',
        'role.name',
        'institution.name'
      ])
      .orderBy('user.created_at', 'DESC')
      .limit(10)
      .getMany();

    // Últimos logins (simulado - em produção viria do log de sessões)
    const recentLogins = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.last_login',
        'role.name'
      ])
      .where('user.last_login IS NOT NULL')
      .orderBy('user.last_login', 'DESC')
      .limit(10)
      .getMany();

    return {
      registrations: recentRegistrations,
      logins: recentLogins
    };
  }

  /**
   * Calcula duração média de sessão
   */
  private static async getAverageSessionDuration(): Promise<number> {
    try {
      // Busca todas as sessões ativas
      const sessionKeys = await this.redis.keys('session:*');
      let totalDuration = 0;
      let validSessions = 0;

      for (const key of sessionKeys) {
        const sessionDataStr = await this.redis.get(key);
        if (sessionDataStr) {
          const sessionData = JSON.parse(sessionDataStr);
          const duration = sessionData.lastActivity - sessionData.createdAt;
          if (duration > 0) {
            totalDuration += duration;
            validSessions++;
          }
        }
      }

      return validSessions > 0 ? Math.round(totalDuration / validSessions / 1000 / 60) : 0; // em minutos
    } catch (error) {
      console.error('Erro ao calcular duração média de sessão:', error);
      return 0;
    }
  }

  /**
   * Obtém estatísticas pessoais do usuário
   */
  private static async getUserPersonalStats(userId: string) {
    // Aqui você implementaria as consultas específicas baseadas no seu modelo de dados
    // Por exemplo: cursos matriculados, cursos completados, tempo de estudo, etc.
    
    // Implementação simulada - substitua pelas consultas reais do seu sistema
    return {
      coursesEnrolled: 0, // await getCourseEnrollmentCount(userId)
      coursesCompleted: 0, // await getCourseCompletionCount(userId)
      totalStudyTime: 0, // await getTotalStudyTime(userId) - em minutos
      achievements: 0 // await getAchievementCount(userId)
    };
  }

  /**
   * Obtém dados de cursos do usuário
   */
  private static async getUserCourseData(userId: string) {
    // Implementação simulada - substitua pelas consultas reais do seu sistema
    return {
      inProgress: [], // await getCoursesInProgress(userId)
      completed: [], // await getCompletedCourses(userId)
      recent: [] // await getRecentCourses(userId)
    };
  }

  /**
   * Obtém dados de atividade do usuário
   */
  private static async getUserActivity(userId: string) {
    // Sessões recentes do usuário
    const recentSessions = await SessionService.getUserSessions(userId);
    
    // Streak de estudo (dias consecutivos) - implementação simulada
    const studyStreak = 0; // await calculateStudyStreak(userId)
    
    // Último acesso baseado na data de criação do usuário (temporário)
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['created_at']
    });

    return {
      recentSessions: recentSessions.slice(0, 5), // Últimas 5 sessões
      studyStreak,
      lastAccess: user?.created_at || new Date()
    };
  }

  /**
   * Obtém métricas de uso do sistema em tempo real
   */
  static async getRealTimeMetrics() {
    try {
      const activeUsers = await this.redis.scard('active_users');
      const totalSessions = await this.redis.keys('session:*');
      
      // Métricas de performance do Redis
      const redisInfo = await this.redis.info('memory');
      const memoryUsage = this.parseRedisMemoryInfo(redisInfo);
      
      return {
        activeUsers,
        activeSessions: totalSessions.length,
        redisMemory: memoryUsage,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao obter métricas em tempo real:', error);
      return {
        activeUsers: 0,
        activeSessions: 0,
        redisMemory: '0MB',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Analisa informações de memória do Redis
   */
  private static parseRedisMemoryInfo(info: string): string {
    const lines = info.split('\r\n');
    const memoryLine = lines.find(line => line.startsWith('used_memory_human:'));
    return memoryLine ? memoryLine.split(':')[1] : '0MB';
  }

  /**
   * Obtém dados para gráficos de analytics
   */
  static async getAnalyticsData(type: 'users' | 'sessions' | 'activity', period: 'day' | 'week' | 'month' = 'week') {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      // Define período
      switch (period) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
      }

      // Implementação baseada no tipo de analytics solicitado
      switch (type) {
        case 'users':
          return await this.getUserAnalytics(startDate, endDate);
        case 'sessions':
          return await this.getSessionAnalytics(startDate, endDate);
        case 'activity':
          return await this.getActivityAnalytics(startDate, endDate);
        default:
          throw new Error('Tipo de analytics não suportado');
      }
    } catch (error) {
      console.error('Erro ao obter dados de analytics:', error);
      throw new Error('Erro ao obter dados de analytics');
    }
  }

  /**
   * Analytics de usuários
   */
  private static async getUserAnalytics(startDate: Date, endDate: Date) {
    const registrations = await this.userRepository
      .createQueryBuilder('user')
      .select("DATE(user.created_at)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('user.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('DATE(user.created_at)')
      .orderBy('DATE(user.created_at)')
      .getRawMany();

    return {
      type: 'users',
      data: registrations.map(item => ({
        date: item.date,
        value: parseInt(item.count)
      }))
    };
  }

  /**
   * Analytics de sessões (simulado)
   */
  private static async getSessionAnalytics(startDate: Date, endDate: Date) {
    // Em uma implementação real, você teria logs de sessões em uma tabela
    // Aqui retornamos dados simulados
    const data = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      data.push({
        date: currentDate.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100) + 10 // Dados simulados
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      type: 'sessions',
      data
    };
  }

  /**
   * Analytics de atividade (simulado)
   */
  private static async getActivityAnalytics(startDate: Date, endDate: Date) {
    // Implementação simulada
    const data = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      data.push({
        date: currentDate.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 50) + 5 // Dados simulados
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      type: 'activity',
      data
    };
  }
} 