import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/typeorm.config';
import { JWT_CONFIG, AccessTokenPayload, RefreshTokenPayload } from '../config/jwt';
import { Role } from '../entities/Role';
import { User } from '../entities/User';

class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  public async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ 
      where: { email },
      relations: ['role']
    });

    if (!user || !user.is_active) {
      return { success: false, message: 'Credenciais inválidas ou usuário inativo.' };
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return { success: false, message: 'Credenciais inválidas.' };
    }

    if (!user.role) {
      return { success: false, message: 'Usuário não possui uma role associada.' };
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const accessToken = this.generateAccessToken(user, user.role, sessionId);
    const refreshToken = this.generateRefreshToken(user.id, sessionId);

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.name,
          permissions: Role.getDefaultPermissions(user.role.name),
          institutionId: user.institution_id,
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
        where: { id: decoded.id.toString() },
        relations: ['role']
      });

      if (!user || !user.is_active || !user.role) {
        return { success: false, message: 'Usuário não encontrado, inativo ou sem role.' };
      }

      const newAccessToken = this.generateAccessToken(user, user.role, decoded.sessionId);
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

  private generateAccessToken(user: User, role: Role, sessionId: string): string {
    const payload: AccessTokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: role.name,
      permissions: Role.getDefaultPermissions(role.name),
      institutionId: user.institution_id,
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
