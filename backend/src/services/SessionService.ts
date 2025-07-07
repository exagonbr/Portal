import getRedisClient from '../config/redis';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../entities/User';

interface SessionData {
  userId: number;
  email: string;
  role?: string;
}

interface ActiveSession {
  sessionId: string;
  userId: number;
  email: string;
  role?: string;
  createdAt: Date;
  lastActivity: Date;
}

export class SessionService {
  private static redis = getRedisClient;

  static async createSession(user: User): Promise<string> {
    const sessionId = uuidv4();
    const sessionData: SessionData = {
      userId: user.id,
      email: user.email,
      role: user.role?.name,
    };

    const now = new Date();
    await this.redis.setex(`session:${sessionId}`, 86400, JSON.stringify({
      ...sessionData,
      createdAt: now.toISOString(),
      lastActivity: now.toISOString()
    }));
    return sessionId;
  }

  static async getSession(sessionId: string): Promise<SessionData | null> {
    const data = await this.redis.get(`session:${sessionId}`);
    if (!data) {
      return null;
    }
    // Atualiza o tempo de expiração da sessão a cada acesso
    await this.redis.expire(`session:${sessionId}`, 86400);
    
    // Atualiza o timestamp de última atividade
    const sessionData = JSON.parse(data);
    sessionData.lastActivity = new Date().toISOString();
    await this.redis.setex(`session:${sessionId}`, 86400, JSON.stringify(sessionData));
    
    return sessionData;
  }

  static async deleteSession(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`);
  }

  static async getActiveSessions(): Promise<ActiveSession[]> {
    const activeSessions: ActiveSession[] = [];
    
    // Busca todas as chaves de sessão
    const keys = await this.redis.keys('session:*');
    
    // Para cada chave, busca os dados da sessão
    for (const key of keys) {
      const sessionId = key.replace('session:', '');
      const data = await this.redis.get(key);
      
      if (data) {
        const sessionData = JSON.parse(data);
        activeSessions.push({
          sessionId,
          userId: sessionData.userId,
          email: sessionData.email,
          role: sessionData.role,
          createdAt: new Date(sessionData.createdAt || Date.now()),
          lastActivity: new Date(sessionData.lastActivity || Date.now())
        });
      }
    }
    
    return activeSessions;
  }
}

export default SessionService;