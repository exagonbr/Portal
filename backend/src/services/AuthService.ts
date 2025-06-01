import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../repositories/UserRepository';
import { CreateUserDto, LoginDto, AuthResponseDto } from '../dto/AuthDto';
import { AuthTokenPayload } from '../types/express';
import { UserWithRelations } from '../entities/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';
const JWT_EXPIRES_IN = '24h';

// Redis session service import
import Redis from 'ioredis';

interface ClientInfo {
  ipAddress: string;
  userAgent: string;
  deviceInfo: string;
}

interface SessionData {
  userId: number;
  user: any;
  createdAt: number;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
}

export class AuthService {
  private static redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  });

  private static readonly SESSION_PREFIX = 'session:';
  private static readonly USER_SESSIONS_PREFIX = 'user_sessions:';
  private static readonly ACTIVE_USERS_SET = 'active_users';
  private static readonly SESSION_TTL = 24 * 60 * 60; // 24 hours

  static generateToken(user: UserWithRelations, sessionId?: string): string {
    const payload: Partial<AuthTokenPayload> = {
      userId: user.id.toString(),
      email: user.email,
      permissions: user.role?.permissions || [],
      role: user.role?.name?.toUpperCase() || 'USER',
      sessionId: sessionId
    };

    return jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  static async createSession(user: any, clientInfo: ClientInfo): Promise<string> {
    const sessionId = uuidv4();
    const now = Date.now();
    
    const sessionData: SessionData = {
      userId: user.id,
      user,
      createdAt: now,
      lastActivity: now,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      deviceInfo: clientInfo.deviceInfo,
    };

    // Store session data
    await this.redis.setex(
      `${this.SESSION_PREFIX}${sessionId}`,
      this.SESSION_TTL,
      JSON.stringify(sessionData)
    );

    // Add session to user's session list
    await this.redis.sadd(`${this.USER_SESSIONS_PREFIX}${user.id}`, sessionId);
    
    // Add user to active users set
    await this.redis.sadd(this.ACTIVE_USERS_SET, user.id.toString());

    // Set TTL for user sessions list
    await this.redis.expire(`${this.USER_SESSIONS_PREFIX}${user.id}`, this.SESSION_TTL);

    console.log(`✅ Session created for user ${user.email}: ${sessionId}`);
    return sessionId;
  }

  static async validateSession(sessionId: string): Promise<SessionData | null> {
    try {
      const sessionDataStr = await this.redis.get(`${this.SESSION_PREFIX}${sessionId}`);
      
      if (!sessionDataStr) {
        return null;
      }

      const sessionData: SessionData = JSON.parse(sessionDataStr);
      
      // Update last activity
      await this.updateSessionActivity(sessionId);
      
      return sessionData;
    } catch (error) {
      console.error('Error validating session:', error);
      return null;
    }
  }

  static async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      const sessionDataStr = await this.redis.get(`${this.SESSION_PREFIX}${sessionId}`);
      
      if (sessionDataStr) {
        const sessionData: SessionData = JSON.parse(sessionDataStr);
        sessionData.lastActivity = Date.now();
        
        await this.redis.setex(
          `${this.SESSION_PREFIX}${sessionId}`,
          this.SESSION_TTL,
          JSON.stringify(sessionData)
        );
      }
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }

  static async destroySession(sessionId: string): Promise<boolean> {
    try {
      const sessionDataStr = await this.redis.get(`${this.SESSION_PREFIX}${sessionId}`);
      
      if (sessionDataStr) {
        const sessionData: SessionData = JSON.parse(sessionDataStr);
        
        // Remove session
        await this.redis.del(`${this.SESSION_PREFIX}${sessionId}`);
        
        // Remove session from user's list
        await this.redis.srem(`${this.USER_SESSIONS_PREFIX}${sessionData.userId}`, sessionId);
        
        // Check if user has other active sessions
        const userSessions = await this.redis.smembers(`${this.USER_SESSIONS_PREFIX}${sessionData.userId}`);
        
        if (userSessions.length === 0) {
          // Remove user from active users set
          await this.redis.srem(this.ACTIVE_USERS_SET, sessionData.userId.toString());
          // Remove user sessions key
          await this.redis.del(`${this.USER_SESSIONS_PREFIX}${sessionData.userId}`);
        }
        
        console.log(`✅ Session destroyed: ${sessionId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error destroying session:', error);
      return false;
    }
  }

  static async register(userData: CreateUserDto, clientInfo: ClientInfo): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(userData.email);

    if (existingUser) {
      throw new Error('Usuário já existe');
    }

    // Create new user
    const user = await UserRepository.create(userData);

    // Get user with relations for response
    const userWithRelations = await UserRepository.findById(user.id);
    
    if (!userWithRelations) {
      throw new Error('Erro ao buscar usuário criado');
    }

    // Create session
    const sessionId = await this.createSession(userWithRelations, clientInfo);

    // Generate token
    const token = this.generateToken(userWithRelations, sessionId);

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return {
      user: this.formatUserResponse(userWithRelations),
      token,
      sessionId,
      expires_at: expiresAt.toISOString()
    };
  }

  static async login(loginData: LoginDto, clientInfo: ClientInfo): Promise<AuthResponseDto> {
    // Find user by email
    const user = await UserRepository.findByEmail(loginData.email);

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Usuário inativo');
    }

    // Verify password
    const isPasswordValid = await UserRepository.comparePassword(loginData.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Create session
    const sessionId = await this.createSession(user, clientInfo);

    // Generate token
    const token = this.generateToken(user, sessionId);

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return {
      user: this.formatUserResponse(user),
      token,
      sessionId,
      expires_at: expiresAt.toISOString()
    };
  }

  static async logout(sessionId: string): Promise<void> {
    await this.destroySession(sessionId);
  }

  static async logoutAllDevices(userId: number): Promise<number> {
    try {
      const userSessions = await this.redis.smembers(`${this.USER_SESSIONS_PREFIX}${userId}`);
      
      let destroyedCount = 0;
      for (const sessionId of userSessions) {
        const destroyed = await this.destroySession(sessionId);
        if (destroyed) destroyedCount++;
      }
      
      // Clean up user sessions list
      await this.redis.del(`${this.USER_SESSIONS_PREFIX}${userId}`);
      await this.redis.srem(this.ACTIVE_USERS_SET, userId.toString());
      
      return destroyedCount;
    } catch (error) {
      console.error('Error logging out all devices:', error);
      return 0;
    }
  }

  static async refreshToken(userId: number, sessionId?: string): Promise<{ token: string; expires_at: string }> {
    const user = await UserRepository.findById(userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const token = this.generateToken(user, sessionId);
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return {
      token,
      expires_at: expiresAt.toISOString()
    };
  }

  static async getUserSessions(userId: number): Promise<any[]> {
    try {
      const sessionIds = await this.redis.smembers(`${this.USER_SESSIONS_PREFIX}${userId}`);
      const sessions = [];
      
      for (const sessionId of sessionIds) {
        const sessionDataStr = await this.redis.get(`${this.SESSION_PREFIX}${sessionId}`);
        if (sessionDataStr) {
          const sessionData = JSON.parse(sessionDataStr);
          sessions.push({
            sessionId,
            createdAt: new Date(sessionData.createdAt),
            lastActivity: new Date(sessionData.lastActivity),
            ipAddress: sessionData.ipAddress,
            userAgent: sessionData.userAgent,
            deviceInfo: sessionData.deviceInfo
          });
        }
      }
      
      return sessions.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  static async getUserById(userId: number): Promise<UserWithRelations | null> {
    return UserRepository.findById(userId);
  }

  static async validateToken(token: string): Promise<AuthTokenPayload> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  static async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await UserRepository.findById(userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isCurrentPasswordValid = await UserRepository.comparePassword(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

    await UserRepository.update(userId, { password: newPassword });
  }

  private static formatUserResponse(user: UserWithRelations): any {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
