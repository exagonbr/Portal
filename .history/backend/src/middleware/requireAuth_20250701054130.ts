/**
 * Middleware de Autenticação Unificado
 * ÚNICO middleware JWT para todo o backend
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG, AccessTokenPayload } from '../config/jwt';
import { db } from '../database/connection';

// Interface estendida para Request com usuário autenticado
export interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
    institutionId?: string;
    sessionId: string;
  };
}

/**
 * Middleware principal de autenticação
 * Valida JWT e anexa usuário ao request
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Extrair token do header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token não fornecido',
        code: 'NO_TOKEN'
      });
      return;
    }

    const token = authHeader.substring(7).trim();

    // 2. Validar formato JWT (3 partes)
    if (token.split('.').length !== 3) {
      res.status(401).json({
        success: false,
        message: 'Formato de token inválido',
        code: 'INVALID_TOKEN_FORMAT'
      });
      return;
    }

    // 3. Verificar e decodificar token
    let payload: AccessTokenPayload;
    
    try {
      payload = jwt.verify(token, JWT_CONFIG.JWT_SECRET, {
        algorithms: [JWT_CONFIG.ALGORITHM],
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE
      }) as AccessTokenPayload;
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          message: 'Token expirado',
          code: 'TOKEN_EXPIRED'
        });
        return;
      }
      
      res.status(401).json({
        success: false,
        message: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
      return;
    }

    // 4. Validar tipo de token
    if (payload.type !== 'access') {
      res.status(401).json({
        success: false,
        message: 'Tipo de token incorreto',
        code: 'WRONG_TOKEN_TYPE'
      });
      return;
    }

    // 5. Verificar se usuário ainda existe e está ativo (opcional mas recomendado)
    const user = await db('users')
      .where({ id: payload.userId, enabled: true })
      .first();
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    // 6. Anexar usuário ao request
    (req as AuthRequest).user = {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      permissions: payload.permissions || [],
      institutionId: payload.institutionId,
      sessionId: payload.sessionId
    };

    // 7. Continuar para próximo middleware/rota
    next();
    
  } catch (error) {
    console.error('❌ Erro no middleware de autenticação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno na autenticação',
      code: 'AUTH_ERROR'
    });
  }
}

/**
 * Middleware para rotas que requerem roles específicas
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // SYSTEM_ADMIN tem acesso a tudo
    if (user.role === 'SYSTEM_ADMIN') {
      return next();
    }

    // Verificar se usuário tem uma das roles permitidas
    const normalizedRoles = allowedRoles.map(r => r.toUpperCase());
    const userRole = user.role.toUpperCase();
    
    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado - role insuficiente',
        code: 'INSUFFICIENT_ROLE',
        required: allowedRoles,
        current: user.role
      });
    }

    next();
  };
}

/**
 * Middleware para rotas que requerem permissões específicas
 */
export function requirePermission(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // SYSTEM_ADMIN tem todas as permissões
    if (user.role === 'SYSTEM_ADMIN') {
      return next();
    }

    // Verificar se usuário tem todas as permissões requeridas
    const hasAllPermissions = requiredPermissions.every(
      permission => user.permissions.includes(permission)
    );
    
    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado - permissões insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: requiredPermissions,
        current: user.permissions
      });
    }

    next();
  };
}

/**
 * Middleware opcional - não bloqueia se não houver token
 * Útil para rotas públicas que podem ter comportamento diferente para usuários autenticados
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Sem token, continuar sem usuário
      return next();
    }

    const token = authHeader.substring(7).trim();

    if (token.split('.').length !== 3) {
      // Token mal formado, continuar sem usuário
      return next();
    }

    try {
      const payload = jwt.verify(token, JWT_CONFIG.JWT_SECRET, {
        algorithms: [JWT_CONFIG.ALGORITHM],
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE
      }) as AccessTokenPayload;

      if (payload.type === 'access') {
        // Anexar usuário se token válido
        (req as AuthRequest).user = {
          id: payload.userId,
          email: payload.email,
          name: payload.name,
          role: payload.role,
          permissions: payload.permissions || [],
          institutionId: payload.institutionId,
          sessionId: payload.sessionId
        };
      }
    } catch {
      // Token inválido, continuar sem usuário
    }

    next();
  } catch (error) {
    // Qualquer erro, continuar sem usuário
    next();
  }
}
