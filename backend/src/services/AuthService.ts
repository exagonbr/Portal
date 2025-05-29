import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../config/typeorm.config';
import { User } from '../entities/User';
import { Role, UserRole } from '../entities/Role';
import { CreateUserDto, LoginDto, AuthResponseDto } from '../dto/AuthDto';

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
  userId: string;
  user: any;
  createdAt: number;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
}

export class AuthService {
  private static userRepository = AppDataSource.getRepository(User);
  private static roleRepository = AppDataSource.getRepository(Role);
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

  static generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        permissions: user.role.permissions,
        role: user.role.name.toUpperCase(),
        type: user.role.name,
        institutionId: user.institution_id
      },
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
    await this.redis.sadd(this.ACTIVE_USERS_SET, user.id);

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
          await this.redis.srem(this.ACTIVE_USERS_SET, sessionData.userId);
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
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new Error('Usuário já existe');
    }

    // Find role
    const role = await this.roleRepository.findOne({
      where: { id: userData.role_id }
    });

    if (!role) {
      throw new Error('Role não encontrada');
    }

    // Create new user
    const user = this.userRepository.create({
      ...userData,
      role
    });

    // Save user (password hashing is done automatically in @BeforeInsert)
    const savedUser = await this.userRepository.save(user);

    // Generate token
    const token = this.generateToken(savedUser);

    // Create session
    const userForSession = {
      ...savedUser,
      role_name: role.name,
      institution_name: savedUser.institution?.name
    };
    const sessionId = await this.createSession(userForSession, clientInfo);

    // Remove password from response
    const { password, ...userWithoutPassword } = savedUser;

    return {
      user: {
        ...userWithoutPassword,
        role_name: role.name,
        institution_name: savedUser.institution?.name,
        created_at: savedUser.created_at.toISOString(),
        updated_at: savedUser.updated_at.toISOString()
      } as any,
      token,
      sessionId,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }

  static async login(loginData: LoginDto, clientInfo: ClientInfo): Promise<AuthResponseDto> {
    // Find user with role and institution
    const user = await this.userRepository.findOne({
      where: { email: loginData.email },
      relations: ['role', 'institution']
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verify password
    const isValidPassword = await user.comparePassword(loginData.password);
    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Usuário inativo');
    }

    // Generate token
    const token = this.generateToken(user);

    // Create session
    const userForSession = {
      ...user,
      role_name: user.role.name,
      institution_name: user.institution?.name
    };
    const sessionId = await this.createSession(userForSession, clientInfo);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: {
        ...userWithoutPassword,
        role_name: user.role.name,
        institution_name: user.institution?.name
      } as any,
      token,
      sessionId,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }

  static async logout(sessionId: string): Promise<void> {
    await this.destroySession(sessionId);
  }

  static async logoutAllDevices(userId: string): Promise<number> {
    try {
      const sessionIds = await this.redis.smembers(`${this.USER_SESSIONS_PREFIX}${userId}`);
      
      if (sessionIds.length === 0) {
        return 0;
      }

      // Remove all sessions
      const sessionKeys = sessionIds.map(id => `${this.SESSION_PREFIX}${id}`);
      await this.redis.del(...sessionKeys);
      
      // Remove user sessions list
      await this.redis.del(`${this.USER_SESSIONS_PREFIX}${userId}`);
      
      // Remove user from active users set
      await this.redis.srem(this.ACTIVE_USERS_SET, userId);
      
      console.log(`✅ ${sessionIds.length} sessions removed for user ${userId}`);
      return sessionIds.length;
    } catch (error) {
      console.error('Error logging out all devices:', error);
      return 0;
    }
  }

  static async refreshToken(userId: string, sessionId?: string): Promise<{ token: string; expires_at: string }> {
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Update session activity if session ID provided
    if (sessionId) {
      await this.updateSessionActivity(sessionId);
    }

    const token = this.generateToken(user);

    return {
      token,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }

  static async getUserSessions(userId: string): Promise<any[]> {
    try {
      const sessionIds = await this.redis.smembers(`${this.USER_SESSIONS_PREFIX}${userId}`);
      const sessions: any[] = [];

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
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'institution']
    });

    return user;
  }

  static async validateToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      throw new Error('Senha atual incorreta');
    }

    // Update password
    user.password = newPassword;
    await this.userRepository.save(user);
  }

  static async createDefaultRoles(): Promise<void> {
    const roles = Object.values(UserRole);
    
    for (const roleName of roles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleName }
      });

      if (!existingRole) {
        const role = this.roleRepository.create({
          name: roleName,
          description: Role.getDefaultPermissions(roleName).join(', '),
          permissions: Role.getDefaultPermissions(roleName),
          active: true
        });

        await this.roleRepository.save(role);
        console.log(`Role ${roleName} criada com sucesso`);
      }
    }
  }

  static async createDefaultAdminUser(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@portal.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      const adminRole = await this.roleRepository.findOne({
        where: { name: UserRole.SYSTEM_ADMIN }
      });

      if (adminRole) {
        const admin = this.userRepository.create({
          email: adminEmail,
          password: adminPassword,
          name: 'Administrador do Sistema',
          role: adminRole,
          is_active: true
        });

        await this.userRepository.save(admin);
        console.log('Usuário administrador criado com sucesso');
      }
    }
  }
}
