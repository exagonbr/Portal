export interface ActiveSession {
  id: string;
  userId: string;
  userRole: string;
  userName: string;
  userEmail: string;
  institutionId?: string;
  institutionName?: string;
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    ip: string;
  };
  loginTime: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
  location?: {
    country: string;
    city: string;
    region: string;
  };
}

class SessionService {
  private sessions: Map<string, ActiveSession> = new Map();

  /**
   * Verifica se uma sessão é válida
   */
  async isSessionValid(sessionId: string): Promise<boolean> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return false;
      }

      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      
      return session.isActive && now < expiresAt;
    } catch (error) {
      console.error('Erro ao verificar validade da sessão:', error);
      return false;
    }
  }

  /**
   * Obtém dados de uma sessão
   */
  async getSession(sessionId: string): Promise<ActiveSession | null> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return null;
      }

      // Verificar se a sessão ainda é válida
      const isValid = await this.isSessionValid(sessionId);
      if (!isValid) {
        this.sessions.delete(sessionId);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Erro ao obter sessão:', error);
      return null;
    }
  }

  /**
   * Estende o tempo de uma sessão
   */
  async extendSession(sessionId: string, extendByMinutes: number = 30): Promise<boolean> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return false;
      }

      const currentExpiry = new Date(session.expiresAt);
      const newExpiry = new Date(currentExpiry.getTime() + (extendByMinutes * 60 * 1000));
      
      session.expiresAt = newExpiry.toISOString();
      session.lastActivity = new Date().toISOString();
      
      this.sessions.set(sessionId, session);
      
      return true;
    } catch (error) {
      console.error('Erro ao estender sessão:', error);
      return false;
    }
  }

  /**
   * Cria uma nova sessão
   */
  async createSession(sessionData: Omit<ActiveSession, 'id' | 'loginTime' | 'lastActivity' | 'expiresAt' | 'isActive'>): Promise<string> {
    try {
      const sessionId = this.generateSessionId();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // 8 horas

      const session: ActiveSession = {
        ...sessionData,
        id: sessionId,
        loginTime: now.toISOString(),
        lastActivity: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isActive: true
      };

      this.sessions.set(sessionId, session);
      
      return sessionId;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      throw error;
    }
  }

  /**
   * Remove uma sessão (logout)
   */
  async removeSession(sessionId: string): Promise<boolean> {
    try {
      const session = this.sessions.get(sessionId);
      if (session) {
        session.isActive = false;
        this.sessions.delete(sessionId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao remover sessão:', error);
      return false;
    }
  }

  /**
   * Lista todas as sessões ativas
   */
  async getActiveSessions(): Promise<ActiveSession[]> {
    try {
      const activeSessions: ActiveSession[] = [];
      const now = new Date();

      for (const [sessionId, session] of this.sessions.entries()) {
        const expiresAt = new Date(session.expiresAt);
        
        if (session.isActive && now < expiresAt) {
          activeSessions.push(session);
        } else {
          // Remove sessões expiradas
          this.sessions.delete(sessionId);
        }
      }

      return activeSessions;
    } catch (error) {
      console.error('Erro ao obter sessões ativas:', error);
      return [];
    }
  }

  /**
   * Obtém sessões de um usuário específico
   */
  async getUserSessions(userId: string): Promise<ActiveSession[]> {
    try {
      const allSessions = await this.getActiveSessions();
      return allSessions.filter(session => session.userId === userId);
    } catch (error) {
      console.error('Erro ao obter sessões do usuário:', error);
      return [];
    }
  }

  /**
   * Atualiza a última atividade de uma sessão
   */
  async updateLastActivity(sessionId: string): Promise<boolean> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return false;
      }

      session.lastActivity = new Date().toISOString();
      this.sessions.set(sessionId, session);
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar última atividade:', error);
      return false;
    }
  }

  /**
   * Gera um ID único para a sessão
   */
  private generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  }

  /**
   * Limpa sessões expiradas (método de limpeza)
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const now = new Date();
      let cleanedCount = 0;

      for (const [sessionId, session] of this.sessions.entries()) {
        const expiresAt = new Date(session.expiresAt);
        
        if (!session.isActive || now >= expiresAt) {
          this.sessions.delete(sessionId);
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      console.error('Erro ao limpar sessões expiradas:', error);
      return 0;
    }
  }

  /**
   * Obtém estatísticas das sessões
   */
  async getSessionStats(): Promise<{
    totalActive: number;
    byDevice: Record<string, number>;
    byRole: Record<string, number>;
    averageSessionDuration: number;
  }> {
    try {
      const activeSessions = await this.getActiveSessions();
      
      const byDevice: Record<string, number> = {};
      const byRole: Record<string, number> = {};
      let totalDuration = 0;

      for (const session of activeSessions) {
        // Contar por dispositivo
        const deviceType = session.deviceInfo.type;
        byDevice[deviceType] = (byDevice[deviceType] || 0) + 1;

        // Contar por role
        const role = session.userRole;
        byRole[role] = (byRole[role] || 0) + 1;

        // Calcular duração da sessão
        const loginTime = new Date(session.loginTime);
        const lastActivity = new Date(session.lastActivity);
        const duration = lastActivity.getTime() - loginTime.getTime();
        totalDuration += duration;
      }

      const averageSessionDuration = activeSessions.length > 0 
        ? totalDuration / activeSessions.length / (1000 * 60) // em minutos
        : 0;

      return {
        totalActive: activeSessions.length,
        byDevice,
        byRole,
        averageSessionDuration
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas das sessões:', error);
      return {
        totalActive: 0,
        byDevice: {},
        byRole: {},
        averageSessionDuration: 0
      };
    }
  }
}

export const sessionService = new SessionService();