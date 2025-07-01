import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/typeorm.config';
import { JWT_CONFIG, AccessTokenPayload, RefreshTokenPayload } from '../config/jwt';
import { Role, UserRole } from '../entities/Role';
import { Users } from '../entities/Users';

class AuthService {
  private userRepository = AppDataSource.getRepository(Users);
  private roleRepository = AppDataSource.getRepository(Role);

  public async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ 
      where: { email },
      relations: ['role']
    });

    if (!user || !user.enabled) {
      return { success: false, message: 'Credenciais inválidas ou usuário inativo.' };
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return { success: false, message: 'Credenciais inválidas.' };
    }

    // Verificar se o usuário tem uma role válida ou pode ter uma atribuída
    if (!user.hasValidRole()) {
      return { success: false, message: 'Usuário não possui uma role associada.' };
    }

    // Se não tem role mas tem flags, atribuir role automaticamente
    let userRole = user.role;
    if (!userRole) {
      const determinedRole = user.determineRoleFromFlags();
      userRole = await this.assignRoleToUser(user, determinedRole);
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const accessToken = this.generateAccessToken(user, userRole, sessionId);
    const refreshToken = this.generateRefreshToken(user.id.toString(), sessionId);

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: userRole.name,
          permissions: Role.getDefaultPermissions(userRole.name),
          institutionId: user.institutionId,
        },
      },
    };
  }

  public async refresh(refreshToken: string) {
    const secret = JWT_CONFIG.SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not configured.');
      return { success: false, message: 'Internal server error.' };
    }

    try {
      const decoded = jwt.verify(refreshToken, secret, {
        algorithms: [JWT_CONFIG.ALGORITHM],
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
      }) as unknown as RefreshTokenPayload;

      if (decoded.type !== 'refresh') {
        return { success: false, message: 'Token inválido para refresh.' };
      }

      const user = await this.userRepository.findOne({
        where: { id: parseInt(decoded.id) },
        relations: ['role']
      });

      if (!user || !user.enabled) {
        return { success: false, message: 'Usuário não encontrado ou inativo.' };
      }

      // Verificar se o usuário tem uma role válida ou pode ter uma atribuída
      if (!user.hasValidRole()) {
        return { success: false, message: 'Usuário não possui uma role associada.' };
      }

      // Se não tem role mas tem flags, atribuir role automaticamente
      let userRole = user.role;
      if (!userRole) {
        const determinedRole = user.determineRoleFromFlags();
        userRole = await this.assignRoleToUser(user, determinedRole);
      }

      const newAccessToken = this.generateAccessToken(user, userRole, decoded.sessionId);
      return {
        success: true,
        data: { accessToken: newAccessToken },
      };
    } catch (error) {
      return { success: false, message: 'Refresh token inválido ou expirado.' };
    }
  }

  public sendRefreshToken(res: Response, token: string): void {
    res.cookie('jid', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  public clearRefreshToken(res: Response): void {
    res.clearCookie('jid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
    });
  }

  private async assignRoleToUser(user: Users, roleName: UserRole): Promise<Role> {
    const roleEntity = await this.roleRepository.findOne({ where: { name: roleName } });
    if (!roleEntity) {
      throw new Error(`Role ${roleName} não encontrada no sistema.`);
    }
    
    user.role = roleEntity;
    user.roleId = roleEntity.id;
    await this.userRepository.save(user);
    
    return roleEntity;
  }

  private generateAccessToken(user: Users, role: Role, sessionId: string): string {
    const payload: AccessTokenPayload = {
      id: user.id.toString(),
      email: user.email,
      name: user.fullName,
      role: role.name,
      permissions: Role.getDefaultPermissions(role.name),
      institutionId: user.institutionId?.toString(),
      sessionId,
      type: 'access',
    };

    const secret = JWT_CONFIG.SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured.');
    }
    return jwt.sign(payload, secret, {
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
      algorithm: JWT_CONFIG.ALGORITHM as jwt.Algorithm,
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE,
    });
  }

  private generateRefreshToken(userId: string, sessionId: string): string {
    const payload: RefreshTokenPayload = {
      id: userId,
      sessionId,
      type: 'refresh',
    };

    const secret = JWT_CONFIG.SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured.');
    }
    return jwt.sign(payload, secret, {
      expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
      algorithm: JWT_CONFIG.ALGORITHM as jwt.Algorithm,
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE,
    });
  }
}

export default new AuthService();
