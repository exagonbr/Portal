import { apiGet, apiPost } from './apiService';

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
}

export interface RoleStats {
  total: number;
  byType: Record<string, number>;
}

export interface AwsConnectionStats {
  connected: boolean;
  region: string;
  bucketsCount: number;
}

export interface AuthenticationTest {
  success: boolean;
  message: string;
  timestamp: Date;
}

class SystemAdminServiceClass {
  async getRealUserStats(): Promise<UserStats> {
    try {
      const response = await apiGet<UserStats>('/admin/stats/users');
      return response;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de usuários:', error);
      throw error;
    }
  }

  async getRoleStats(): Promise<RoleStats> {
    try {
      const response = await apiGet<RoleStats>('/admin/stats/roles');
      return response;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de papéis:', error);
      throw error;
    }
  }

  async getAwsConnectionStats(): Promise<AwsConnectionStats> {
    try {
      const response = await apiGet<AwsConnectionStats>('/admin/stats/aws');
      return response;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de conexão AWS:', error);
      throw error;
    }
  }

  async testAuthentication(): Promise<AuthenticationTest> {
    try {
      const response = await apiGet<AuthenticationTest>('/admin/test/auth');
      return response;
    } catch (error) {
      console.error('Erro ao testar autenticação:', error);
      return {
        success: false,
        message: 'Erro ao testar autenticação',
        timestamp: new Date()
      };
    }
  }

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    services: Record<string, boolean>;
  }> {
    try {
      const response = await apiGet<{
        status: 'healthy' | 'degraded' | 'down';
        services: Record<string, boolean>;
      }>('/admin/health');
      return response;
    } catch (error) {
      console.error('Erro ao verificar saúde do sistema:', error);
      return {
        status: 'down',
        services: {}
      };
    }
  }

  async clearCache(): Promise<void> {
    try {
      await apiPost('/admin/cache/clear', {});
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      throw error;
    }
  }
}

export const systemAdminService = new SystemAdminServiceClass(); 