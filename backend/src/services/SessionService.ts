import getRedisClient from '../config/redis';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../entities/User';

interface SessionData {
  userId: number;
  email: string;
  role?: string;
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

    await this.redis.setex(`session:${sessionId}`, 86400, JSON.stringify(sessionData));
    return sessionId;
  }

  static async getSession(sessionId: string): Promise<SessionData | null> {
    const data = await this.redis.get(`session:${sessionId}`);
    if (!data) {
      return null;
    }
    // Atualiza o tempo de expiração da sessão a cada acesso
    await this.redis.expire(`session:${sessionId}`, 86400);
    return JSON.parse(data);
  }

  static async deleteSession(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`);
  }
}

export default SessionService;