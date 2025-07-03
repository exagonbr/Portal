import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/connection';

const JWT_SECRET = process.env.JWT_SECRET || 'ExagonTech';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'ExagonTechRefresh';

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
  role_name: string;
  role_slug: string;
  permissions: string[];
  institution_name?: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: UserWithRole;
  expiresIn: number;
  message: string;
}

interface AccessTokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  institutionId: string;
  sessionId: string;
  type: 'access';
  iat: number;
  exp: number;
}

interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  type: 'refresh';
  iat: number;
  exp: number;
}

export class OptimizedAuthService {
  private static readonly ACCESS_TOKEN_EXPIRY = '1h'; // 1 hora para access token
  private static readonly REFRESH_TOKEN_EXPIRY = '7d'; // 7 dias para refresh token
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

      // Usar Knex query builder diretamente para evitar problemas de binding
      console.log('🔄 Usando Knex query builder...');

      // Buscar usuário básico primeiro
      console.log('🔍 Buscando usuário por email:', email);
      const userBasic = await db('users')
        .select('*')
        .where('email', email)
        .where('enabled', true)
        .first();
        
      if (!userBasic) {
        console.log(`❌ Usuário não encontrado ou inativo: ${email}`);
        throw new Error('Credenciais inválidas');
      }
      
      console.log('✅ Usuário básico encontrado:', { id: userBasic.id, email: userBasic.email });
      
      // Determinar role baseado nos campos booleanos (mapeamento para RBAC)
      let roleInfo = { name: 'Estudante', slug: 'STUDENT', id: 'student' };
      if (userBasic.is_admin) {
        roleInfo = { name: 'Administrador do Sistema', slug: 'SYSTEM_ADMIN', id: 'system_admin' };
      } else if (userBasic.is_teacher) {
        roleInfo = { name: 'Professor', slug: 'TEACHER', id: 'teacher' };
      } else if (userBasic.is_student) {
        roleInfo = { name: 'Estudante', slug: 'STUDENT', id: 'student' };
      }
      
      // Buscar instituição se existir institution_id
      let institutionName = null;
      if (userBasic.institution_id) {
        try {
          const institution = await db('institutions')
            .select('name')
            .where('id', userBasic.institution_id)
            .first();
          if (institution) {
            institutionName = institution.name;
          }
        } catch (error: any) {
          console.log(`⚠️ Erro ao buscar instituição: ${error.message}`);
        }
      }
      
      // Definir permissões baseadas no role RBAC
      let permissions: string[] = [];
      if (userBasic.is_admin) {
        permissions = [
          'system:admin',
          'users:create', 'users:read', 'users:update', 'users:delete',
          'institutions:create', 'institutions:read', 'institutions:update', 'institutions:delete',
          'courses:create', 'courses:read', 'courses:update', 'courses:delete',
          'content:create', 'content:read', 'content:update', 'content:delete',
          'analytics:read', 'system:settings', 'logs:read'
        ];
      } else if (userBasic.is_teacher) {
        permissions = [
          'courses:create', 'courses:read', 'courses:update',
          'content:create', 'content:read', 'content:update',
          'students:read', 'students:update',
          'assignments:create', 'assignments:read', 'assignments:update',
          'grades:create', 'grades:read', 'grades:update'
        ];
      } else if (userBasic.is_student) {
        permissions = [
          'courses:read',
          'content:read',
          'assignments:read', 'assignments:submit',
          'grades:read',
          'profile:read', 'profile:update'
        ];
      }
      
      const user = {
        ...userBasic,
        name: userBasic.full_name, // Mapear full_name para name
        role_name: roleInfo.name,
        role_slug: roleInfo.slug,
        institution_name: institutionName,
        permissions: JSON.stringify(permissions),
        is_active: userBasic.enabled, // Mapear enabled para is_active
        role_id: roleInfo.id
      };
      
      console.log('✅ Dados completos do usuário:', { 
        id: user.id, 
        email: user.email, 
        role: user.role_slug, 
        permissions: permissions.length 
      });

      if (!user) {
        console.log(`❌ Usuário não encontrado ou inativo: ${email}`);
        throw new Error('Credenciais inválidas');
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log(`❌ Senha inválida para: ${email}`);
        throw new Error('Credenciais inválidas');
      }

      // Processar permissões
      let userPermissions: string[] = [];
      try {
        const permissionsArray = JSON.parse(user.permissions);
        userPermissions = permissionsArray.filter((p: any) => p !== null);
      } catch (error) {
        console.warn('Erro ao processar permissões:', error);
        userPermissions = [];
      }

      // Gerar sessionId único
      const sessionId = uuidv4();

      // Gerar tokens JWT padrão
      const accessToken = this.generateAccessToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role_slug || user.role_name || 'STUDENT',
        permissions: permissions, // Usar as permissões RBAC corretas
        institutionId: user.institution_id,
        sessionId
      });

      const refreshToken = this.generateRefreshToken({
        userId: user.id,
        sessionId
      });

      // Preparar resposta do usuário
      const userResponse: UserWithRole = {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role_id: user.role_id,
        institution_id: user.institution_id,
        is_active: user.enabled,
        created_at: user.date_created,
        updated_at: user.last_updated,
        role_name: user.role_name || 'Estudante',
        role_slug: user.role_slug || 'STUDENT',
        permissions: userPermissions,
        institution_name: user.institution_name
      };

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ [${new Date().toISOString()}] Login bem-sucedido para: ${email} (${duration}ms)`);
      console.log(`📊 User role: ${userResponse.role_slug}, permissions: ${userPermissions.length}`);

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
      
      console.error(`❌ [${new Date().toISOString()}] Erro no login para: ${email} (${duration}ms)`, error.message);
      throw error;
    }
  }

  /**
   * Gerar Access Token JWT padrão
   */
  private static generateAccessToken(payload: {
    userId: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
    institutionId: string;
    sessionId: string;
  }): string {
    const tokenPayload = {
      ...payload,
      type: 'access',
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(tokenPayload, JWT_SECRET, { 
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      algorithm: 'HS256'
    });
  }

  /**
   * Gerar Refresh Token JWT padrão
   */
  private static generateRefreshToken(payload: {
    userId: string;
    sessionId: string;
  }): string {
    const tokenPayload = {
      ...payload,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(tokenPayload, REFRESH_SECRET, { 
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
      algorithm: 'HS256'
    });
  }

  /**
   * Validar Access Token
   */
  static async validateAccessToken(token: string): Promise<AccessTokenPayload | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
      
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
      console.error('Erro ao validar access token:', error);
      return null;
    }
  }

  /**
   * Validar Refresh Token
   */
  static async validateRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
    try {
      const decoded = jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
      
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
      console.error('Erro ao validar refresh token:', error);
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

      // Buscar dados atualizados do usuário
      const user = await db('users')
        .select('*')
        .where('id', decoded.userId)
        .where('enabled', true)
        .first();

      if (!user) {
        return null;
      }

      // Determinar role e permissões baseado nos campos booleanos (RBAC)
      let roleSlug = 'STUDENT';
      let permissions: string[] = [
        'courses:read',
        'content:read',
        'assignments:read', 'assignments:submit',
        'grades:read',
        'profile:read', 'profile:update'
      ];
      
      if (user.is_admin) {
        roleSlug = 'SYSTEM_ADMIN';
        permissions = [
          'system:admin',
          'users:create', 'users:read', 'users:update', 'users:delete',
          'institutions:create', 'institutions:read', 'institutions:update', 'institutions:delete',
          'courses:create', 'courses:read', 'courses:update', 'courses:delete',
          'content:create', 'content:read', 'content:update', 'content:delete',
          'analytics:read', 'system:settings', 'logs:read'
        ];
      } else if (user.is_teacher) {
        roleSlug = 'TEACHER';
        permissions = [
          'courses:create', 'courses:read', 'courses:update',
          'content:create', 'content:read', 'content:update',
          'students:read', 'students:update',
          'assignments:create', 'assignments:read', 'assignments:update',
          'grades:create', 'grades:read', 'grades:update'
        ];
      }

      const newAccessToken = this.generateAccessToken({
        userId: user.id,
        email: user.email,
        name: user.full_name,
        role: roleSlug,
        permissions,
        institutionId: user.institution_id,
        sessionId: decoded.sessionId
      });

      return {
        token: newAccessToken,
        expiresIn: 3600
      };

    } catch (error) {
      console.error('Erro ao renovar access token:', error);
      return null;
    }
  }

  static async getUserById(userId: string): Promise<UserWithRole | null> {
    try {
      const user = await db('users')
        .select('*')
        .where('id', userId)
        .where('enabled', true)
        .first();

      if (!user) {
        return null;
      }

      // Determinar role e permissões baseado nos campos booleanos (RBAC)
      let roleInfo = { name: 'Estudante', slug: 'STUDENT', id: 'student' };
      let permissions: string[] = [
        'courses:read',
        'content:read',
        'assignments:read', 'assignments:submit',
        'grades:read',
        'profile:read', 'profile:update'
      ];
      
      if (user.is_admin) {
        roleInfo = { name: 'Administrador do Sistema', slug: 'SYSTEM_ADMIN', id: 'system_admin' };
        permissions = [
          'system:admin',
          'users:create', 'users:read', 'users:update', 'users:delete',
          'institutions:create', 'institutions:read', 'institutions:update', 'institutions:delete',
          'courses:create', 'courses:read', 'courses:update', 'courses:delete',
          'content:create', 'content:read', 'content:update', 'content:delete',
          'analytics:read', 'system:settings', 'logs:read'
        ];
      } else if (user.is_teacher) {
        roleInfo = { name: 'Professor', slug: 'TEACHER', id: 'teacher' };
        permissions = [
          'courses:create', 'courses:read', 'courses:update',
          'content:create', 'content:read', 'content:update',
          'students:read', 'students:update',
          'assignments:create', 'assignments:read', 'assignments:update',
          'grades:create', 'grades:read', 'grades:update'
        ];
      }

      // Buscar instituição se existir
      let institutionName = null;
      if (user.institution_id) {
        try {
          const institution = await db('institutions')
            .select('name')
            .where('id', user.institution_id)
            .first();
          if (institution) {
            institutionName = institution.name;
          }
        } catch (error: any) {
          console.log(`⚠️ Erro ao buscar instituição: ${error.message}`);
        }
      }

      return {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role_id: roleInfo.id,
        institution_id: user.institution_id,
        is_active: user.enabled,
        created_at: user.date_created,
        updated_at: user.last_updated,
        role_name: roleInfo.name,
        role_slug: roleInfo.slug,
        permissions,
        institution_name: institutionName
      };

    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      return null;
    }
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const user = await db('users')
        .select('is_admin', 'is_teacher', 'is_student')
        .where('id', userId)
        .where('enabled', true)
        .first();

      if (!user) {
        return false;
      }

      // Verificar permissões baseado no sistema RBAC
      let userPermissions: string[] = [];
      
      if (user.is_admin) {
        userPermissions = [
          'system:admin',
          'users:create', 'users:read', 'users:update', 'users:delete',
          'institutions:create', 'institutions:read', 'institutions:update', 'institutions:delete',
          'courses:create', 'courses:read', 'courses:update', 'courses:delete',
          'content:create', 'content:read', 'content:update', 'content:delete',
          'analytics:read', 'system:settings', 'logs:read'
        ];
      } else if (user.is_teacher) {
        userPermissions = [
          'courses:create', 'courses:read', 'courses:update',
          'content:create', 'content:read', 'content:update',
          'students:read', 'students:update',
          'assignments:create', 'assignments:read', 'assignments:update',
          'grades:create', 'grades:read', 'grades:update'
        ];
      } else if (user.is_student) {
        userPermissions = [
          'courses:read',
          'content:read',
          'assignments:read', 'assignments:submit',
          'grades:read',
          'profile:read', 'profile:update'
        ];
      }

      return userPermissions.includes(permission);

    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  }
}