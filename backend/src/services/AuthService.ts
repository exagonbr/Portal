import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../repositories/UserRepository';
import { CreateUserDto, LoginDto, AuthResponseDto } from '../dto/AuthDto';
import { AuthTokenPayload } from '../types/express';
import { UserWithRelations } from '../entities/User';
import { AppDataSource } from '../config/typeorm.config';
import { Role, UserRole } from '../entities/Role';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';
const JWT_EXPIRES_IN = '24h';

// Redis session service import
import Redis from 'ioredis';
import { isEmpty } from 'lodash';

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
    // Verifica se é uma sessão de fallback (criada quando Redis não está disponível)
    if (sessionId.startsWith('fallback-')) {
      // Retorna uma sessão simulada para sessões de fallback
      const parts = sessionId.split('-');
      const timestamp = parts[1] ? parseInt(parts[1]) : Date.now();
      
      return {
        userId: 0, // Será preenchido pelo payload do token JWT
        user: null, // Será preenchido pelo payload do token JWT
        createdAt: timestamp,
        lastActivity: Date.now()
      };
    }
    
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
      throw new Error('Email ou senha incorretos. Por favor, verifique suas credenciais.');
    }

    // Tenta criar sessão com Redis, mas continua se falhar
    let sessionId = '';
    try {
      sessionId = await this.createSession(user, clientInfo);
    } catch (error: any) {
      console.warn('⚠️ Redis não disponível, continuando sem sessão:', error.message);
      // Gera um ID de sessão alternativo quando Redis falha
      sessionId = `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }

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
    try {
      await this.destroySession(sessionId);
    } catch (error: any) {
      console.warn('⚠️ Redis não disponível, logout parcial:', error.message);
      // Continua normalmente, mesmo sem poder destruir a sessão no Redis
    }
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

  static async refreshToken(userId: string, sessionId?: string): Promise<{ token: string; expires_at: string }> {
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

  static async getUserById(userId: string): Promise<UserWithRelations | null> {
    const numericUserId = userId
    
    if (isEmpty(numericUserId)) {
      console.error('❌ AuthService: ID de usuário inválido:', userId);
      return null;
    }
    
    console.log('🔍 AuthService: Buscando usuário:', numericUserId);
    return UserRepository.findById(numericUserId);
  }

  static async validateToken(token: string): Promise<AuthTokenPayload> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
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

  /**
   * Cria as roles padrão do sistema
   */
  static async createDefaultRoles(): Promise<void> {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      const roleRepository = AppDataSource.getRepository(Role);

      // Define as roles padrão
      const defaultRoles = [
        {
          name: UserRole.SYSTEM_ADMIN,
          description: 'Administrador do sistema com acesso completo',
          permissions: Role.getDefaultPermissions(UserRole.SYSTEM_ADMIN),
          active: true
        },
        {
          name: UserRole.INSTITUTION_MANAGER,
          description: 'Gerente de instituição com acesso administrativo',
          permissions: Role.getDefaultPermissions(UserRole.INSTITUTION_MANAGER),
          active: true
        },
        {
          name: UserRole.ACADEMIC_COORDINATOR,
          description: 'Coordenador acadêmico',
          permissions: Role.getDefaultPermissions(UserRole.ACADEMIC_COORDINATOR),
          active: true
        },
        {
          name: UserRole.TEACHER,
          description: 'Professor com acesso a turmas e conteúdos',
          permissions: Role.getDefaultPermissions(UserRole.TEACHER),
          active: true
        },
        {
          name: UserRole.STUDENT,
          description: 'Estudante com acesso a materiais e atividades',
          permissions: Role.getDefaultPermissions(UserRole.STUDENT),
          active: true
        },
        {
          name: UserRole.GUARDIAN,
          description: 'Responsável com acesso a informações dos filhos',
          permissions: Role.getDefaultPermissions(UserRole.GUARDIAN),
          active: true
        }
      ];

      for (const roleData of defaultRoles) {
        // Verifica se a role já existe
        const existingRole = await roleRepository.findOne({
          where: { name: roleData.name }
        });

        if (!existingRole) {
          const role = roleRepository.create(roleData);
          await roleRepository.save(role);
          console.log(`✅ Role criada: ${roleData.name}`);
        } else {
          console.log(`ℹ️  Role já existe: ${roleData.name}`);
        }
      }

      console.log('✅ Todas as roles padrão foram verificadas/criadas');
    } catch (error) {
      console.error('❌ Erro ao criar roles padrão:', error);
      throw error;
    }
  }

  /**
   * Cria o usuário administrador padrão
   */
  static async createDefaultAdminUser(): Promise<void> {
    try {
      // Verifica se já existe um usuário admin
      const existingAdmin = await UserRepository.findByEmail('admin@portal.com');

      if (existingAdmin) {
        console.log('ℹ️  Usuário administrador já existe');
        return;
      }

      // Busca a role de SYSTEM_ADMIN
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      const roleRepository = AppDataSource.getRepository(Role);
      const adminRole = await roleRepository.findOne({
        where: { name: UserRole.SYSTEM_ADMIN }
      });

      if (!adminRole) {
        throw new Error('Role SYSTEM_ADMIN não encontrada. Execute createDefaultRoles primeiro.');
      }

      // Tenta criar com diferentes estratégias de role_id para compatibilidade
      let adminData: CreateUserDto;
      
      // Primeira tentativa: assumir que role_id é string/UUID
      try {
        adminData = {
          email: 'admin@portal.com',
          password: 'admin123',
          name: 'Administrador do Sistema',
          role_id: adminRole.id as any // Força o tipo para permitir UUID
        };

        const adminUser = await UserRepository.create(adminData);
        console.log(`✅ Usuário administrador criado: ${adminUser.email}`);
        return;
      } catch (firstError: any) {
        console.log('Primeira tentativa falhou, tentando com role_id como número...');
        
        // Segunda tentativa: tentar converter UUID para número (hash)
        try {
          // Cria um hash numérico do UUID para compatibilidade
          const roleIdHash = Math.abs(adminRole.id.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0));

          adminData = {
            email: 'admin@portal.com',
            password: 'admin123',
            name: 'Administrador do Sistema',
            role_id: roleIdHash
          };

          const adminUser = await UserRepository.create(adminData);
          console.log(`✅ Usuário administrador criado com role_id numérico: ${adminUser.email}`);
          return;
        } catch (secondError: any) {
          console.error('Ambas as tentativas falharam:', { firstError, secondError });
          throw new Error(`Não foi possível criar usuário administrador. Erros: ${firstError.message}, ${secondError.message}`);
        }
      }

    } catch (error) {
      console.error('❌ Erro ao criar usuário administrador:', error);
      throw error;
    }
  }

  static formatUserResponse(user: UserWithRelations): any {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: {
        name: user.role?.name || 'user',
        permissions: user.role?.permissions || []
      },
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }
}
