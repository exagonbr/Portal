import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/connection';
import { generateSlug } from '../utils/slug';
import { JWT_CONFIG, AccessTokenPayload, RefreshTokenPayload } from '../config/jwt';

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role_id: string;
  institution_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserWithRole extends Omit<User, 'password'> {
  role_name: string | undefined;
  uuid: string;
  permissions: string[];
  institution_name?: string;
  role?: string;
  role_slug?: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: UserWithRole;
  expiresIn: number;
  message: string;
}



export class OptimizedAuthService {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Login otimizado com consulta SQL unificada
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    const startTime = Date.now();
    
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    try {
      console.log(`🔐 [${new Date().toISOString()}] Iniciando login para: ${email}`);

      // Consulta otimizada para buscar usuário com campos booleanos de role
      const user = await db('users as u')
        .select(
          'u.id',
          'u.id as uuid',
          'u.email',
          'u.password',
          'u.full_name as name',
          'u.institution_id',
          'u.enabled as is_active',
          'u.date_created as created_at',
          'u.last_updated as updated_at',
          'u.is_admin',
          'u.is_institution_manager',
          'u.is_coordinator',
          'u.is_guardian',
          'u.is_teacher',
          'u.is_student',
          'u.role_id',
          'i.name as institution_name'
        )
        .leftJoin('institutions as i', 'u.institution_id', 'i.id')
        .where('u.email', email)
        .where('u.enabled', true)
        .first();

      if (!user) {
        console.log(`❌ Usuário não encontrado ou inativo: ${email}`);
        throw new Error('Credenciais inválidas');
      }

      // Determinar role e permissions baseado nos campos booleanos
      const { roleName, roleSlug, permissions } = OptimizedAuthService.mapUserRoleAndPermissions(user);
      
      console.log('✅ Dados completos do usuário:', {
        id: user.id,
        email: user.email,
        role: roleName,
        role_slug: roleSlug,
        permissions: permissions,
        permissions_count: permissions.length,
        is_admin: user.is_admin,
        is_teacher: user.is_teacher,
        is_student: user.is_student
      });

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log(`❌ Senha inválida para: ${email}`);
        throw new Error('Credenciais inválidas');
      }

      // Gerar sessionId único
      const sessionId = uuidv4();

      // Adicionar role e permissions ao objeto user
      user.role_name = roleName.toUpperCase();
      user.permissions = permissions;

      // Gerar tokens JWT padrão
      const accessToken = this.generateAccessToken(user, sessionId);
      const refreshToken = this.generateRefreshToken(user.id, sessionId);

      // Preparar resposta do usuário
      const userResponse: UserWithRole = {
        ...user,
        permissions: permissions,
        role: roleName.toUpperCase(),
        role_name: roleName.toUpperCase(),
        role_slug: roleSlug,
      };

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ [${new Date().toISOString()}] Login bem-sucedido para: ${email} (${duration}ms)`);
      console.log(`📊 User role: ${userResponse.role_name}, permissions: ${permissions.length}`);

      return {
        success: true,
        token: accessToken,
        refreshToken,
        user: userResponse,
        expiresIn: 3600, // 1 hora em segundos
        message: 'Login realizado com sucesso'
      };

    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`❌ [${new Date().toISOString()}] Erro no login para: ${email} (${duration}ms)`, error.message);
      throw error;
    }
  }

  /**
   * Mapear role e permissions baseado nos campos booleanos do usuário
   */
  private static mapUserRoleAndPermissions(user: any): { roleName: string; roleSlug: string; permissions: string[] } {
    let roleName = 'STUDENT';
    let permissions: string[] = [];

    // Determinar role baseado nos campos booleanos (ordem de prioridade)
    if (user.is_admin) {
      roleName = 'SYSTEM_ADMIN';
      permissions = [
        'system:admin',
        'users:create', 'users:read', 'users:update', 'users:delete',
        'institutions:create', 'institutions:read', 'institutions:update', 'institutions:delete',
        'courses:create', 'courses:read', 'courses:update', 'courses:delete',
        'content:create', 'content:read', 'content:update', 'content:delete',
        'analytics:read', 'system:settings', 'logs:read',
        'teachers:create', 'teachers:read', 'teachers:update', 'teachers:delete',
        'students:create', 'students:read', 'students:update', 'students:delete',
        'assignments:create', 'assignments:read', 'assignments:update', 'assignments:delete',
        'grades:create', 'grades:read', 'grades:update', 'grades:delete',
        'reports:create', 'reports:read', 'reports:update', 'reports:delete',
        'settings:create', 'settings:read', 'settings:update', 'settings:delete',
        'roles:create', 'roles:read', 'roles:update', 'roles:delete',
        'permissions:create', 'permissions:read', 'permissions:update', 'permissions:delete',
        'groups:create', 'groups:read', 'groups:update', 'groups:delete',
        'notifications:create', 'notifications:read', 'notifications:update', 'notifications:delete',
        'attendance:create', 'attendance:read', 'attendance:update', 'attendance:delete',
        'profile:read', 'profile:update',
        'modules:create', 'modules:read', 'modules:update', 'modules:delete',
        'lessons:create', 'lessons:read', 'lessons:update', 'lessons:delete',
        'books:create', 'books:read', 'books:update', 'books:delete',
        'videos:create', 'videos:read', 'videos:update', 'videos:delete',
        'collections:create', 'collections:read', 'collections:update', 'collections:delete',
        'forum:create', 'forum:read', 'forum:update', 'forum:delete',
        'chats:create', 'chats:read', 'chats:update', 'chats:delete',
        'quizzes:create', 'quizzes:read', 'quizzes:update', 'quizzes:delete',
        'certificates:create', 'certificates:read', 'certificates:update', 'certificates:delete',
        'backup:create', 'backup:read', 'backup:restore',
        'maintenance:read', 'maintenance:update',
        'monitoring:read', 'security:read', 'security:update'
      ];
    } else if (user.is_institution_manager) {
      roleName = 'INSTITUTION_MANAGER';
      permissions = [
        'institution:admin',
        'users:create', 'users:read', 'users:update',
        'courses:create', 'courses:read', 'courses:update',
        'content:create', 'content:read', 'content:update',
        'teachers:read', 'teachers:update',
        'students:read', 'students:update',
        'analytics:read', 'reports:read',
        'settings:read', 'settings:update'
      ];
    } else if (user.is_coordinator) {
      roleName = 'COORDINATOR';
      permissions = [
        'courses:read', 'courses:update',
        'content:read', 'content:update',
        'students:read', 'students:update',
        'teachers:read',
        'assignments:read', 'assignments:update',
        'grades:read',
        'reports:read',
        'analytics:read'
      ];
    } else if (user.is_guardian) {
      roleName = 'GUARDIAN';
      permissions = [
        'students:read',
        'courses:read',
        'content:read',
        'assignments:read',
        'grades:read',
        'attendance:read',
        'reports:read',
        'profile:read', 'profile:update',
        'notifications:read'
      ];
    } else if (user.is_teacher) {
      roleName = 'TEACHER';
      permissions = [
        'courses:create', 'courses:read', 'courses:update',
        'content:create', 'content:read', 'content:update',
        'students:read', 'students:update',
        'assignments:create', 'assignments:read', 'assignments:update',
        'grades:create', 'grades:read', 'grades:update'
      ];
    } else if (user.is_student) {
      roleName = 'STUDENT';
      permissions = [
        'courses:read',
        'content:read',
        'assignments:read', 'assignments:submit',
        'grades:read',
        'profile:read', 'profile:update'
      ];
    }

    const roleSlug = generateSlug(roleName.toLowerCase());

    return { roleName, roleSlug, permissions };
  }

  /**
   * Gerar Access Token JWT padrão
   */
  private static generateAccessToken(user: any, sessionId: string): string {
    const tokenPayload: Omit<AccessTokenPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role_name || 'STUDENT',
      permissions: user.permissions || [],
      institutionId: user.institution_id,
      sessionId,
      type: 'access'
    };

    return jwt.sign(tokenPayload, JWT_CONFIG.SECRET, {
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
      algorithm: JWT_CONFIG.ALGORITHM,
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE
    });
  }

  /**
   * Gerar Refresh Token JWT padrão
   */
  private static generateRefreshToken(userId: string, sessionId: string): string {
    const tokenPayload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
      userId,
      sessionId,
      type: 'refresh'
    };

    return jwt.sign(tokenPayload, JWT_CONFIG.SECRET, {
      expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
      algorithm: JWT_CONFIG.ALGORITHM,
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE
    });
  }

  /**
   * Validar Access Token
   */
  static async validateAccessToken(token: string): Promise<AccessTokenPayload | null> {
    try {
      const decoded = jwt.verify(token, JWT_CONFIG.SECRET, {
        algorithms: [JWT_CONFIG.ALGORITHM],
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE
      }) as AccessTokenPayload;
      
      if (decoded.type !== 'access') {
        throw new Error('Token type inválido');
      }

      // Verificar se o usuário ainda existe e está ativo
      const user = await db('users')
        .where({ id: decoded.userId, enabled: true })
        .first();
        
      if (!user) {
        return null;
      }
      
      return decoded;
    } catch (error) {
      console.log('Erro ao validar access token:', error);
      return null;
    }
  }

  /**
   * Validar Refresh Token
   */
  static async validateRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
    try {
      const decoded = jwt.verify(token, JWT_CONFIG.JWT_SECRET, {
        algorithms: [JWT_CONFIG.ALGORITHM],
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE
      }) as RefreshTokenPayload;
      
      if (decoded.type !== 'refresh') {
        throw new Error('Token type inválido');
      }

      // Verificar se o usuário ainda existe e está ativo
      const user = await db('users')
        .where({ id: decoded.userId, enabled: true })
        .first();
        
      if (!user) {
        return null;
      }
      
      return decoded;
    } catch (error) {
      console.log('Erro ao validar refresh token:', error);
      return null;
    }
  }

  /**
   * Renovar Access Token usando Refresh Token
   */
  static async refreshAccessToken(refreshToken: string): Promise<{ token: string; expiresIn: number } | null> {
    try {
      // Validar refresh token
      const decoded = await this.validateRefreshToken(refreshToken);
      if (!decoded) {
        return null;
      }

      // Buscar dados atualizados do usuário com a consulta otimizada
      const user = await this.getUserById(decoded.userId);

      if (!user) {
        return null;
      }

      const newAccessToken = this.generateAccessToken({
        userId: user.id,
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        name: user.name,
        role: (user.role_name || 'STUDENT').toUpperCase(),
        role_id: user.role_id,
        role_name: (user.role_name || 'STUDENT').toUpperCase(),
        role_slug: user.role_slug || 'student',
        permissions: user.permissions,
        institutionId: user.institution_id,
        institutionName: user.institution_name || '',
        sessionId: decoded.sessionId
      });

      return {
        token: newAccessToken,
        expiresIn: 3600
      };

    } catch (error) {
      console.log('Erro ao renovar access token:', error);
      return null;
    }
  }

  static async getUserById(userId: string): Promise<UserWithRole | null> {
    try {
      const user = await db('users as u')
        .select(
          'u.id',
          'u.id as uuid',
          'u.email',
          'u.full_name as name',
          'u.institution_id',
          'u.enabled as is_active',
          'u.date_created as created_at',
          'u.last_updated as updated_at',
          'u.is_admin',
          'u.is_institution_manager',
          'u.is_coordinator',
          'u.is_guardian',
          'u.is_teacher',
          'u.is_student',
          'u.role_id',
          'i.name as institution_name'
        )
        .leftJoin('institutions as i', 'u.institution_id', 'i.id')
        .where('u.id', userId)
        .where('u.enabled', true)
        .first();

      if (!user) {
        return null;
      }

      // Determinar role e permissions baseado nos campos booleanos
      const { roleName, roleSlug, permissions } = this.mapUserRoleAndPermissions(user);

      const userResponse: UserWithRole = {
        ...user,
        permissions,
        role: roleName.toUpperCase(),
        role_name: roleName.toUpperCase(),
        role_slug: roleSlug,
      };

      return userResponse;

    } catch (error) {
      console.log('Erro ao buscar usuário por ID:', error);
      return null;
    }
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);

      if (!user || !user.permissions) {
        return false;
      }

      return user.permissions.includes(permission);

    } catch (error) {
      console.log('Erro ao verificar permissão:', error);
      return false;
    }
  }
}