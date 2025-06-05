import { getRedisClient, TTL } from '../config/redis';
import { User } from '../types/auth';
import { v4 as uuidv4 } from 'uuid';

export interface SessionData {
  userId: string;
  user: User;
  createdAt: number;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
}

export interface ActiveSession {
  sessionId: string;
  userId: string;
  user: User;
  createdAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
}

class SessionService {
  private redis = getRedisClient();
  private readonly SESSION_PREFIX = 'session:';
  private readonly USER_SESSIONS_PREFIX = 'user_sessions:';
  private readonly ACTIVE_USERS_SET = 'active_users';

  /**
   * Cria uma nova sessão para o usuário
   */
  async createSession(
    user: User, 
    ipAddress?: string, 
    userAgent?: string,
    deviceInfo?: string
  ): Promise<string> {
    const sessionId = uuidv4();
    const now = Date.now();
    
    const sessionData: SessionData = {
      userId: user.id,
      user,
      createdAt: now,
      lastActivity: now,
      ipAddress,
      userAgent,
      deviceInfo,
    };

    // Armazena os dados da sessão
    await this.redis.setex(
      `${this.SESSION_PREFIX}${sessionId}`,
      TTL.SESSION,
      JSON.stringify(sessionData)
    );

    // Adiciona a sessão à lista de sessões do usuário
    await this.redis.sadd(`${this.USER_SESSIONS_PREFIX}${user.id}`, sessionId);
    
    // Adiciona o usuário ao conjunto de usuários ativos
    await this.redis.sadd(this.ACTIVE_USERS_SET, user.id);

    // Define TTL para a lista de sessões do usuário
    await this.redis.expire(`${this.USER_SESSIONS_PREFIX}${user.id}`, TTL.SESSION);

    console.log(`✅ Sessão criada para usuário ${user.email}: ${sessionId}`);
    return sessionId;
  }

  /**
   * Recupera os dados de uma sessão
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const sessionDataStr = await this.redis.get(`${this.SESSION_PREFIX}${sessionId}`);
      
      if (!sessionDataStr) {
        return null;
      }

      const sessionData: SessionData = JSON.parse(sessionDataStr);
      
      // Atualiza a última atividade
      await this.updateLastActivity(sessionId);
      
      return sessionData;
    } catch (error) {
      console.error('Erro ao recuperar sessão:', error);
      return null;
    }
  }

  /**
   * Atualiza a última atividade da sessão
   */
  async updateLastActivity(sessionId: string): Promise<void> {
    try {
      const sessionDataStr = await this.redis.get(`${this.SESSION_PREFIX}${sessionId}`);
      
      if (sessionDataStr) {
        const sessionData: SessionData = JSON.parse(sessionDataStr);
        sessionData.lastActivity = Date.now();
        
        await this.redis.setex(
          `${this.SESSION_PREFIX}${sessionId}`,
          TTL.SESSION,
          JSON.stringify(sessionData)
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar última atividade:', error);
    }
  }

  /**
   * Remove uma sessão específica
   */
  async destroySession(sessionId: string): Promise<boolean> {
    try {
      // Recupera os dados da sessão antes de removê-la
      const sessionDataStr = await this.redis.get(`${this.SESSION_PREFIX}${sessionId}`);
      
      if (sessionDataStr) {
        const sessionData: SessionData = JSON.parse(sessionDataStr);
        
        // Remove a sessão
        await this.redis.del(`${this.SESSION_PREFIX}${sessionId}`);
        
        // Remove a sessão da lista do usuário
        await this.redis.srem(`${this.USER_SESSIONS_PREFIX}${sessionData.userId}`, sessionId);
        
        // Verifica se o usuário ainda tem outras sessões ativas
        const userSessions = await this.redis.smembers(`${this.USER_SESSIONS_PREFIX}${sessionData.userId}`);
        
        if (userSessions.length === 0) {
          // Remove o usuário do conjunto de usuários ativos
          await this.redis.srem(this.ACTIVE_USERS_SET, sessionData.userId);
          // Remove a chave de sessões do usuário
          await this.redis.del(`${this.USER_SESSIONS_PREFIX}${sessionData.userId}`);
        }
        
        console.log(`✅ Sessão removida: ${sessionId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao remover sessão:', error);
      return false;
    }
  }

  /**
   * Remove todas as sessões de um usuário
   */
  async destroyAllUserSessions(userId: string): Promise<number> {
    try {
      const sessionIds = await this.redis.smembers(`${this.USER_SESSIONS_PREFIX}${userId}`);
      
      if (sessionIds.length === 0) {
        return 0;
      }

      // Remove todas as sessões
      const sessionKeys = sessionIds.map(id => `${this.SESSION_PREFIX}${id}`);
      await this.redis.del(...sessionKeys);
      
      // Remove a lista de sessões do usuário
      await this.redis.del(`${this.USER_SESSIONS_PREFIX}${userId}`);
      
      // Remove o usuário do conjunto de usuários ativos
      await this.redis.srem(this.ACTIVE_USERS_SET, userId);
      
      console.log(`✅ ${sessionIds.length} sessões removidas para usuário ${userId}`);
      return sessionIds.length;
    } catch (error) {
      console.error('Erro ao remover todas as sessões do usuário:', error);
      return 0;
    }
  }

  /**
   * Lista todas as sessões ativas de um usuário
   */
  async getUserSessions(userId: string): Promise<ActiveSession[]> {
    try {
      const sessionIds = await this.redis.smembers(`${this.USER_SESSIONS_PREFIX}${userId}`);
      const sessions: ActiveSession[] = [];

      for (const sessionId of sessionIds) {
        const sessionDataStr = await this.redis.get(`${this.SESSION_PREFIX}${sessionId}`);
        
        if (sessionDataStr) {
          const sessionData: SessionData = JSON.parse(sessionDataStr);
          sessions.push({
            sessionId,
            userId: sessionData.userId,
            user: sessionData.user,
            createdAt: new Date(sessionData.createdAt),
            lastActivity: new Date(sessionData.lastActivity),
            ipAddress: sessionData.ipAddress,
            userAgent: sessionData.userAgent,
            deviceInfo: sessionData.deviceInfo,
          });
        }
      }

      return sessions.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
    } catch (error) {
      console.error('Erro ao listar sessões do usuário:', error);
      return [];
    }
  }

  /**
   * Lista todos os usuários ativos
   */
  async getActiveUsers(): Promise<string[]> {
    try {
      return await this.redis.smembers(this.ACTIVE_USERS_SET);
    } catch (error) {
      console.error('Erro ao listar usuários ativos:', error);
      return [];
    }
  }

  /**
   * Conta o número total de sessões ativas
   */
  async getActiveSessionsCount(): Promise<number> {
    try {
      const keys = await this.redis.keys(`${this.SESSION_PREFIX}*`);
      return keys.length;
    } catch (error) {
      console.error('Erro ao contar sessões ativas:', error);
      return 0;
    }
  }

  /**
   * Limpa sessões expiradas (executado periodicamente)
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const sessionKeys = await this.redis.keys(`${this.SESSION_PREFIX}*`);
      let cleanedCount = 0;

      for (const key of sessionKeys) {
        const ttl = await this.redis.ttl(key);
        
        // Se TTL é -1, a chave não tem expiração definida (problema)
        // Se TTL é 0 ou negativo, a chave expirou
        if (ttl <= 0) {
          const sessionId = key.replace(this.SESSION_PREFIX, '');
          await this.destroySession(sessionId);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`🧹 ${cleanedCount} sessões expiradas foram limpas`);
      }

      return cleanedCount;
    } catch (error) {
      console.error('Erro na limpeza de sessões expiradas:', error);
      return 0;
    }
  }

  /**
   * Verifica se uma sessão é válida
   */
  async isSessionValid(sessionId: string): Promise<boolean> {
    try {
      const exists = await this.redis.exists(`${this.SESSION_PREFIX}${sessionId}`);
      return exists === 1;
    } catch (error) {
      console.error('Erro ao verificar validade da sessão:', error);
      return false;
    }
  }

  /**
   * Estende o tempo de vida de uma sessão
   */
  async extendSession(sessionId: string, additionalSeconds: number = TTL.SESSION): Promise<boolean> {
    try {
      const exists = await this.redis.exists(`${this.SESSION_PREFIX}${sessionId}`);
      
      if (exists) {
        await this.redis.expire(`${this.SESSION_PREFIX}${sessionId}`, additionalSeconds);
        await this.updateLastActivity(sessionId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao estender sessão:', error);
      return false;
    }
  }
}

// Instância singleton do serviço de sessão
export const sessionService = new SessionService();
export default sessionService; 