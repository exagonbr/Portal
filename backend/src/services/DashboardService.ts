import { getRedisClient } from '../config/redis';
import { SessionService } from './SessionService';
import { UserRepository } from '../repositories/UserRepository';

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
        sessions: sessionStats,
        system: systemStats,
        recent: recentActivity
      };
    } catch (error) {
      console.log('Erro ao obter dashboard do sistema:', error);
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
  static async getUserDashboard(userId: number): Promise<UserDashboard> {
    try {
      // Busca dados do usuário
      const user = await this.userRepository.getUserWithRoleAndInstitution(userId);

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
      console.log('Erro ao obter dashboard do usuário:', error);
      throw new Error('Erro ao obter dashboard do usuário');
    }
  }

  /**
   * Obtém estatísticas de usuários
   */
  static async getUserStats() {
    try {
      const [
        totalUsers,
        newThisMonth,
        byRole,
        byInstitution
      ] = await Promise.all([
        this.userRepository.count(),
        this.userRepository.countNewThisMonth(),
        this.userRepository.getUserStatsByRole(),
        this.userRepository.getUserStatsByInstitution()
      ]);

      return {
        total: totalUsers,
        active: 0, // Placeholder for active users as last_login is not available
        newThisMonth,
        byRole,
        byInstitution
      };
    } catch (error) {
      console.log('Erro ao obter estatísticas de usuários:', error);
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
    console.warn("getRecentActivity is returning mock data as underlying repository methods were removed for stability.");
    return {
      registrations: [],
      logins: []
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
      console.log('Erro ao calcular duração média de sessão:', error);
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
  private static async getUserActivity(userId: number) {
    // Sessões recentes do usuário
    const recentSessions = await SessionService.getUserSessions(userId.toString());
    
    // Streak de estudo (simulado)
    const studyStreak = 0;
    
    // Último acesso baseado na data de criação do usuário (temporário)
    const user = await this.userRepository.findById(userId);

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
      console.log('Erro ao obter métricas em tempo real:', error);
      return {
        activeUsers: 0,
        activeSessions: 0,
        redisMemory: '0MB',
        timestamp: new Date().toISOString()
      };
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
      console.log('Erro ao obter dados de analytics:', error);
      throw new Error('Erro ao obter dados de analytics');
    }
  }

  /**
   * Obtém dados analíticos de usuários
   */
  private static async getUserAnalytics(startDate: Date, endDate: Date) {
    console.warn("getUserAnalytics is returning mock data as underlying repository method was removed for stability.");
    return {
      type: 'users',
      data: []
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