import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import { getJwtSecret } from '../config/jwt';

const JWT_SECRET = getJwtSecret();

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

interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  user: Omit<User, 'password'> & {
    role: string;
    permissions: string[];
  };
  message?: string;
}

interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  institutionId: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export class AuthService {
  /**
   * Hash de senha com salt seguro
   */
  static async hashPassword(password: string): Promise<string> {
    if (!password || password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }
    
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * Comparação segura de senhas
   */
  static async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    if (!password || !hashedPassword) {
      return false;
    }
    
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Geração de token JWT com payload padronizado
   */
  static async generateAccessToken(user: Partial<User>, roleName: string, permissions: string[]): Promise<string> {
    const payload: TokenPayload = {
      userId: user.id!,
      email: user.email!,
      name: user.name!,
      role: roleName,
      permissions,
      institutionId: user.institution_id!,
      type: 'access'
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  }

  /**
   * Geração de refresh token
   */
  static async generateRefreshToken(user: Partial<User>): Promise<string> {
    const payload: TokenPayload = {
      userId: user.id!,
      email: user.email!,
      name: user.name!,
      role: '', // Não incluir role no refresh token por segurança
      permissions: [],
      institutionId: user.institution_id!,
      type: 'refresh'
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  /**
   * Validação de token JWT
   */
  static async validateToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      
      // Verificar se o usuário ainda existe e está ativo
      const user = await db('users')
        .where({ id: decoded.userId, is_active: true })
        .first();
        
      if (!user) {
        return null;
      }
      
      return decoded;
    } catch (error) {
      console.log('Erro ao validar token:', error);
      return null;
    }
  }

  /**
   * Buscar role e permissões do usuário
   */
  static async getRoleAndPermissions(roleId: string | null): Promise<{ roleName: string; permissions: string[] }> {
    if (!roleId) {
      return { roleName: 'STUDENT', permissions: [] };
    }

    try {
      const role = await db('roles').where('id', roleId).first();
      if (!role) {
        return { roleName: 'STUDENT', permissions: [] };
      }

      const rolePermissions = await db('role_permissions')
        .join('permissions', 'role_permissions.permission_id', 'permissions.id')
        .where('role_permissions.role_id', role.id)
        .select('permissions.name');

      const permissions = rolePermissions.map(p => p.name);
      return { roleName: role.name, permissions };
    } catch (error) {
      console.log('Erro ao buscar role e permissões:', error);
      return { roleName: 'STUDENT', permissions: [] };
    }
  }

  /**
   * Validação de usuário por email
   */
  static async validateUser(email: string, password?: string): Promise<User> {
    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }

    const user = await db('users')
      .where({ email, is_active: true })
      .first();
      
    if (!user) {
      throw new Error('Usuário não encontrado ou inativo');
    }

    if (password) {
      const isValidPassword = await this.comparePasswords(password, user.password);
      if (!isValidPassword) {
        throw new Error('Credenciais inválidas');
      }
    }

    return user;
  }

  /**
   * Login do usuário
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Validações básicas
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }

      // Validar usuário e senha
      const user = await this.validateUser(email, password);

      // Buscar role e permissões
      const { roleName, permissions } = await this.getRoleAndPermissions(user.role_id);

      // Gerar tokens
      const accessToken = await this.generateAccessToken(user, roleName, permissions);
      const refreshToken = await this.generateRefreshToken(user);

      // Preparar resposta do usuário (sem senha)
      const { password: _, ...userWithoutPassword } = user;
      const userResponse = {
        ...userWithoutPassword,
        role: roleName,
        permissions
      };

      return {
        success: true,
        token: accessToken,
        refreshToken,
        user: userResponse,
        message: 'Login realizado com sucesso'
      };
    } catch (error) {
      console.log('Erro no login:', error);
      throw new Error(error instanceof Error ? error.message : 'Erro interno no login');
    }
  }

  /**
   * Registro de novo usuário
   */
  static async register(userData: {
    name: string;
    email: string;
    password: string;
    role_id?: string;
    institution_id?: string;
  }): Promise<AuthResponse> {
    try {
      // Validações básicas
      if (!userData.name || !userData.email || !userData.password) {
        throw new Error('Nome, email e senha são obrigatórios');
      }

      if (userData.password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
      }

      // Verificar se usuário já existe
      const existingUser = await db('users')
        .where('email', userData.email)
        .first();

      if (existingUser) {
        throw new Error('Usuário já existe com este email');
      }

      // Hash da senha
      const hashedPassword = await this.hashPassword(userData.password);

      // Buscar role padrão se não fornecida
      let roleId = userData.role_id;
      if (!roleId) {
        const defaultRole = await db('roles')
          .where('name', 'STUDENT')
          .first();
        roleId = defaultRole?.id;
      }

      // Buscar instituição padrão se não fornecida
      let institutionId = userData.institution_id;
      if (!institutionId) {
        const defaultInstitution = await db('institution')
          .where('is_active', true)
          .first();
        institutionId = defaultInstitution?.id;
      }

      // Criar novo usuário
      const [user] = await db('users')
        .insert({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role_id: roleId,
          institution_id: institutionId,
          is_active: true
        })
        .returning('*');

      // Buscar role e permissões
      const { roleName, permissions } = await this.getRoleAndPermissions(user.role_id);

      // Gerar tokens
      const accessToken = await this.generateAccessToken(user, roleName, permissions);
      const refreshToken = await this.generateRefreshToken(user);

      // Preparar resposta do usuário (sem senha)
      const { password: _, ...userWithoutPassword } = user;
      const userResponse = {
        ...userWithoutPassword,
        role: roleName,
        permissions
      };

      return {
        success: true,
        token: accessToken,
        refreshToken,
        user: userResponse,
        message: 'Usuário registrado com sucesso'
      };
    } catch (error) {
      console.log('Erro no registro:', error);
      throw new Error(error instanceof Error ? error.message : 'Erro interno no registro');
    }
  }

  /**
   * Buscar usuário por ID
   */
  static async getUserById(userId: string): Promise<(Omit<User, 'password'> & { role: string; permissions: string[] }) | null> {
    try {
      if (!userId) {
        return null;
      }

      const user = await db('users')
        .where({ id: userId, is_active: true })
        .first();

      if (!user) {
        return null;
      }

      // Buscar role e permissões
      const { roleName, permissions } = await this.getRoleAndPermissions(user.role_id);

      // Preparar resposta do usuário (sem senha)
      const { password: _, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        role: roleName,
        permissions
      };
    } catch (error) {
      console.log('Erro ao buscar usuário por ID:', error);
      return null;
    }
  }

  /**
   * Refresh do token de acesso
   */
  static async refreshAccessToken(refreshToken: string): Promise<{ token: string; user: any } | null> {
    try {
      const decoded = await this.validateToken(refreshToken);
      
      if (!decoded || decoded.type !== 'refresh') {
        return null;
      }

      // Buscar usuário atualizado
      const user = await this.getUserById(decoded.userId);
      if (!user) {
        return null;
      }

      // Gerar novo access token
      const newAccessToken = await this.generateAccessToken(user, user.role, user.permissions);

      return {
        token: newAccessToken,
        user
      };
    } catch (error) {
      console.log('Erro ao renovar token:', error);
      return null;
    }
  }

  /**
   * Logout (invalidar tokens)
   */
  static async logout(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Em uma implementação completa, você manteria uma blacklist de tokens
      // ou usaria Redis para invalidar tokens específicos
      
      // Por enquanto, apenas log da ação
      console.log(`Usuário ${userId} fez logout`);
      
      return {
        success: true,
        message: 'Logout realizado com sucesso'
      };
    } catch (error) {
      console.log('Erro no logout:', error);
      return {
        success: false,
        message: 'Erro interno no logout'
      };
    }
  }

  /**
   * Verificar se usuário tem permissão específica
   */
  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      return user?.permissions.includes(permission) || false;
    } catch (error) {
      console.log('Erro ao verificar permissão:', error);
      return false;
    }
  }

  /**
   * Verificar se usuário tem role específica
   */
  static async hasRole(userId: string, role: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      return user?.role === role || false;
    } catch (error) {
      console.log('Erro ao verificar role:', error);
      return false;
    }
  }
}
