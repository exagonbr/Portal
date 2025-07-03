import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database';
import { JWT_CONFIG, AccessTokenPayload, RefreshTokenPayload } from '../config/jwt';
import { user as User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Tipagem para o usuário obtido do banco de dados
interface UserWithRole extends User {
  role: string;
  permissions: string[];
}

/**
 * Gera um Access Token.
 * @param user - O objeto do usuário.
 * @param sessionId - O ID da sessão.
 * @returns O access token JWT.
 */
export function generateAccessToken(user: UserWithRole, sessionId: string): string {
  const payload: AccessTokenPayload = {
    id: user.id,
    email: user.email,
    name: user.full_name || '',
    role: user.role,
    permissions: user.permissions || [],
    institutionId?: user.institution_id || undefined,
    sessionId,
    type: 'access',
  };

  return jwt.sign(payload, JWT_CONFIG.SECRET!, {
    expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
    algorithm: JWT_CONFIG.ALGORITHM,
    issuer: JWT_CONFIG.ISSUER,
    audience: JWT_CONFIG.AUDIENCE,
  });
}

/**
 * Gera um Refresh Token.
 * @param userId - O ID do usuário.
 * @param sessionId - O ID da sessão.
 * @returns O refresh token JWT.
 */
export function generateRefreshToken(userId: string, sessionId: string): string {
  const payload: RefreshTokenPayload = {
    id: userId,
    sessionId,
    type: 'refresh',
  };

  return jwt.sign(payload, JWT_CONFIG.SECRET!, {
    expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
    algorithm: JWT_CONFIG.ALGORITHM,
    issuer: JWT_CONFIG.ISSUER,
    audience: JWT_CONFIG.AUDIENCE,
  });
}

/**
 * Extrai o usuário da requisição a partir do token de autorização.
 * @param req - O objeto da requisição Express.
 * @returns O usuário autenticado ou null.
 */
export async function getUserFromRequest(req: Request): Promise<UserWithRole | null> {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return null;

        const decoded = jwt.verify(token, JWT_CONFIG.SECRET!) as AccessTokenPayload;
        
        const user = await db('users')
            .leftJoin('roles', 'users.role_id', 'roles.id')
            .where('users.id', decoded.id)
            .select('users.*', 'roles.name as role')
            .first();

        if (!user) return null;

        // Mock de permissões - substitua pela sua lógica real
        const permissions = ['read:data', 'write:data'];

        return { ...user, permissions };
    } catch (error) {
        console.log('Error getting user from request:', error);
        return null;
    }
}

/**
 * Gera um ID de sessão único.
 * @returns Um ID de sessão UUID v4.
 */
export function generateSessionId(): string {
  return uuidv4();
}
