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
          averageSessionDuration: 0,
        },
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
      const user = await this.userRepository.getUserWithRoleAndInstitution(userId.toString());

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
   * Obtém dados de atividade do usuário
   */
  private static async getUserActivity(userId: number) {
    // Sessões recentes do usuário
    const recentSessions = await SessionService.getUserSessions(userId.toString());
    
    // Streak de estudo (simulado)
    const studyStreak = 0;
    
    // Último acesso baseado na data de criação do usuário (temporário)
    const user = await this.userRepository.findById(userId.toString());

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
      const totalUsers = await this.userRepository.count();
      
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

} 