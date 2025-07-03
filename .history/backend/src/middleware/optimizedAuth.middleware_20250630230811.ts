import { Request, Response, NextFunction } from 'express';
import { OptimizedAuthService } from '../services/OptimizedAuthService';
import { AuthTokenPayload } from '../types/express';

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

/**
 * Middleware de autenticação otimizado com JWT padrão
 */
export const optimizedAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido',
        code: 'NO_TOKEN'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acesso inválido',
        code: 'INVALID_TOKEN_FORMAT'
      });
      return;
    }

    // Validar o access token
    const decoded = await OptimizedAuthService.validateAccessToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: 'Token de acesso expirado ou inválido',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }

    // Adicionar dados do usuário à requisição
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      permissions: decoded.permissions || [],
      institutionId: decoded.institutionId,
      sessionId: decoded.sessionId,
      iat: decoded.iat,
      exp: decoded.exp
    };

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(401).json({
      success: false,
      message: 'Falha na autenticação',
      code: 'AUTH_FAILED'
    });
  }
};

/**
 * Middleware de autenticação opcional (não bloqueia se não houver token)
 */
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Continua sem autenticação
      next();
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      // Continua sem autenticação
      next();
      return;
    }

    // Tentar validar o token
    const decoded = await OptimizedAuthService.validateAccessToken(token);

    if (decoded) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        permissions: decoded.permissions,
        institutionId: decoded.institutionId,
        sessionId: decoded.sessionId
      };
    }

    next();
  } catch (error) {
    // Em caso de erro, continua sem autenticação
    console.warn('Erro no middleware de autenticação opcional:', error);
    next();
  }
};

/**
 * Middleware para verificar permissões específicas
 */
export const requirePermission = (permission: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
      return;
    }

    const userPermissions = req.user.permissions || [];
    if (!userPermissions.includes(permission)) {
      res.status(403).json({
        success: false,
        message: 'Permissão insuficiente',
        code: 'INSUFFICIENT_PERMISSION',
        required: permission
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar roles específicos
 */
export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({
        success: false,
        message: 'Role insuficiente',
        code: 'INSUFFICIENT_ROLE',
        required: role,
        current: req.user.role
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar múltiplos roles
 */
export const requireAnyRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
      return;
    }

    if (!req.user.role || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Role insuficiente',
        code: 'INSUFFICIENT_ROLE',
        required: roles,
        current: req.user.role
      });
      return;
    }

    next();
  };
}; 