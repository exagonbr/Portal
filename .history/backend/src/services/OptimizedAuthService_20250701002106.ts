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
  role_name: string | undefined;
  uuid: string;
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
  id: string;
  uuid: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  institutionId: string;
  institutionName: string;
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

      // Consulta otimizada para buscar usuário, role e permissões de uma vez
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
          'r.id as role_id',
          'r.name as role_name',
          'i.name as institution_name',
          db.raw(`(
            SELECT json_agg(p.action)
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role_id = u.role_id
          ) as permissions`)
        )
        .leftJoin('roles as r', 'u.role_id', 'r.id')
        .leftJoin('institutions as i', 'u.institution_id', 'i.id')
        .where('u.email', email)
        .where('u.enabled', true)
        .first();

      if (!user) {
        console.log(`❌ Usuário não encontrado ou inativo: ${email}`);
        throw new Error('Credenciais inválidas');
      }

      // Garante que permissões seja um array
      const permissions = user.permissions || [];
      
      console.log('✅ Dados completos do usuário:', {
        id: user.id,
        email: user.email,
        role: user.role_name,
        permissions: permissions.length
      });

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log(`❌ Senha inválida para: ${email}`);
        throw new Error('Credenciais inválidas');
      }

      // As permissões agora vêm diretamente da consulta ao banco de dados

      // Gerar sessionId único
      const sessionId = uuidv4();

      // Gerar tokens JWT padrão
      const accessToken = this.generateAccessToken({
        userId: user.id,
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        name: user.name,
        role: user.role_name || 'STUDENT',
        role_slug: user.role_name?.toLowerCase() || 'student',
        permissions: permissions,
        institutionId: user.institution_id,
        institutionName: user.institution_name,
        sessionId
      });

      const refreshToken = this.generateRefreshToken({
        userId: user.id,
        sessionId
      });

      // Preparar resposta do usuário
      const userResponse: UserWithRole = {
        ...user,
        permissions: permissions,
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
      
      console.error(`❌ [${new Date().toISOString()}] Erro no login para: ${email} (${duration}ms)`, error.message);
      throw error;
    }
  }

  /**
   * Gerar Access Token JWT padrão
   */
  private static generateAccessToken(payload: {
    userId: string;
    id: string;
    uuid: string;
    email: string;
    name: string;
    role: string;
    role_slug: string;
    permissions: string[];
    institutionId: string;
    institutionName: string;
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
        role: user.role_name || 'STUDENT',
        role_slug: user.role_name?.toLowerCase() || 'student',
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
      console.error('Erro ao renovar access token:', error);
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
          'r.id as role_id',
          'r.name as role_name',
          'i.name as institution_name',
          db.raw(`(
            SELECT json_agg(p.action)
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role_id = u.role_id
          ) as permissions`)
        )
        .leftJoin('roles as r', 'u.role_id', 'r.id')
        .leftJoin('institutions as i', 'u.institution_id', 'i.id')
        .where('u.id', userId)
        .where('u.enabled', true)
        .first();

      if (!user) {
        return null;
      }

      // Garante que permissões seja um array, mesmo que o resultado seja null
      user.permissions = user.permissions || [];

      return user as UserWithRole;

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
      const user = await this.getUserById(userId);

      if (!user || !user.permissions) {
        return false;
      }

      return user.permissions.includes(permission);

    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  }
}