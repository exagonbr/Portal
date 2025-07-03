import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { JWT_CONFIG, AccessTokenPayload, RefreshTokenPayload } from '../config/jwt';
import { Role, UserRole } from '../entities/Role';
import { RoleRepository } from '../repositories/RoleRepository';

/**
 * 🔐 SERVIÇO DE AUTENTICAÇÃO UNIFICADO
 * 
 * ✅ Apenas tokens JWT reais (HS256)
 * ✅ Access token: 1 hora | Refresh token: 7 dias
 * ✅ Respostas padronizadas: { success: boolean, data/message }
 * ✅ Login/Refresh/Logout centralizados
 */
class AuthService {
  private userRepository: UserRepository;
  private roleRepository: RoleRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.roleRepository = new RoleRepository();
  }

  /**
   * 🎯 LOGIN - Validar credenciais e gerar tokens
   */
  public async login(email: string, password: string): Promise<{
    success: boolean;
    data?: {
      accessToken: string;
      refreshToken: string;
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
        permissions: string[];
        institutionId?: string;
      };
    };
    message?: string;
  }> {
    try {
      // 1. Buscar usuário por email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return {
          success: false,
          message: 'Credenciais inválidas'
        };
      }

      // 2. Verificar se usuário está ativo
      if (!user.is_active) {
        return {
          success: false,
          message: 'Usuário inativo'
        };
      }

      // 3. Validar senha (implementação básica - substituir por bcrypt em produção)
      if (user.password !== password) {
        return {
          success: false,
          message: 'Credenciais inválidas'
        };
      }

      // 4. Buscar role do usuário
      const role = await this.roleRepository.findById(user.role_id);
      if (!role) {
        return {
          success: false,
          message: 'Role do usuário não encontrada'
        };
      }

      // 5. Gerar tokens JWT
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const accessToken = this.generateAccessToken(user, role as any, sessionId);
      const refreshToken = this.generateRefreshToken(user.id, sessionId);

      // 6. Retornar dados de sucesso
      return {
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.full_name,
            role: role.name,
            permissions: (role as any).permissions || [],
            institutionId: user.institution_id
          }
        }
      };

    } catch (error) {
      console.error('❌ Erro no login:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * 🔄 REFRESH - Renovar access token usando refresh token
   */
  public async refresh(refreshToken: string): Promise<{
    success: boolean;
    data?: {
      accessToken: string;
      refreshToken: string;
    };
    message?: string;
  }> {
    try {
      // 1. Validar refresh token
      const decoded = jwt.verify(refreshToken, JWT_CONFIG.SECRET, {
        algorithms: [JWT_CONFIG.ALGORITHM]
      }) as RefreshTokenPayload;

      // 2. Verificar tipo de token
      if (decoded.type !== 'refresh') {
        return {
          success: false,
          message: 'Tipo de token incorreto'
        };
      }

      // 3. Buscar usuário
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.is_active) {
        return {
          success: false,
          message: 'Usuário não encontrado ou inativo'
        };
      }

      // 4. Buscar role
      const role = await this.roleRepository.findById(user.role_id);
      if (!role) {
        return {
          success: false,
          message: 'Role não encontrada'
        };
      }

      // 5. Gerar novos tokens
      const newAccessToken = this.generateAccessToken(user, role as any, decoded.sessionId);
      const newRefreshToken = this.generateRefreshToken(user.id, decoded.sessionId);

      return {
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      };

    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return {
          success: false,
          message: 'Refresh token expirado'
        };
      }
      
      if (error.name === 'JsonWebTokenError') {
        return {
          success: false,
          message: 'Refresh token inválido'
        };
      }

      console.error('❌ Erro no refresh:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * 🚪 LOGOUT - Invalidar tokens (implementação simples)
   */
  public async logout(accessToken: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Em uma implementação completa, aqui você adicionaria o token a uma blacklist
      // Por simplicidade, apenas retornamos sucesso
      console.log('🚪 Logout realizado para token:', accessToken.substring(0, 20) + '...');
      
      return {
        success: true,
        message: 'Logout realizado com sucesso'
      };
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * 🔑 GERAR ACCESS TOKEN
   */
  private generateAccessToken(user: User, role: Role, sessionId: string): string {
    const payload: AccessTokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.full_name,
      role: role.name,
      permissions: role.permissions || [],
      institutionId: user.institution_id,
      sessionId,
      type: 'access'
    };

    return jwt.sign(payload, JWT_CONFIG.SECRET, {
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN
    });
  }

  /**
   * 🔄 GERAR REFRESH TOKEN
   */
  private generateRefreshToken(userId: string, sessionId: string): string {
    const payload: RefreshTokenPayload = {
      userId,
      sessionId,
      type: 'refresh'
    };

    return jwt.sign(payload, JWT_CONFIG.SECRET, {
      expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN
    });
  }

  /**
   * ✅ VALIDAR ACCESS TOKEN
   */
  public async validateAccessToken(token: string): Promise<AccessTokenPayload | null> {
    try {
      const decoded = jwt.verify(token, JWT_CONFIG.SECRET, {
        algorithms: [JWT_CONFIG.ALGORITHM]
      }) as AccessTokenPayload;

      if (decoded.type !== 'access') {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * 👤 BUSCAR USUÁRIO POR ID
   */
  public async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  /**
   * 🛠️ CRIAR ROLES PADRÃO (para setup inicial)
   */
  public async createDefaultRoles(): Promise<void> {
    const defaultRoles = Object.values(UserRole);

    for (const roleName of defaultRoles) {
      const existingRole = await this.roleRepository.findOne({ name: roleName } as any);
      if (!existingRole) {
        await this.roleRepository.createRole({
          name: roleName,
          description: `Default ${roleName} role`,
          permissions: Role.getDefaultPermissions(roleName as UserRole),
        } as any);
      }
    }
  }

  /**
   * 👨‍💼 CRIAR USUÁRIO ADMIN PADRÃO (para setup inicial)
   */
  public async createDefaultAdminUser(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sabercon.com.br';
    const existingAdmin = await this.userRepository.findByEmail(adminEmail);

    if (!existingAdmin) {
      const adminRole = await this.roleRepository.findOne({ name: UserRole.SYSTEM_ADMIN } as any);

      if (adminRole) {
        await this.userRepository.createUser({
          email: adminEmail,
          password: process.env.ADMIN_PASSWORD || 'SaberconAdmin2025!',
          full_name: 'System Administrator',
          role_id: adminRole.id,
          institution_id: 'default-institution',
          is_active: true,
        });
        console.log('✅ Usuário admin padrão criado:', adminEmail);
      }
    }
  }
}

export default new AuthService();
