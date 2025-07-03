import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/AuthService';
import { AuthTokenPayload } from '../types/express';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    const decoded = await AuthService.validateToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const user = req.user as AuthTokenPayload;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!user.role || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Você não tem permissão para acessar este recurso.'
      });
    }

    next();
  };
};

export const authorizePermissions = (...requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const user = req.user as AuthTokenPayload;
    
    if (!user || !user.permissions) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado ou sem permissões definidas no token'
      });
    }

    try {
      const hasAllPermissions = requiredPermissions.every(permission =>
        user.permissions!.includes(permission)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem as permissões necessárias para acessar este recurso.'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar permissões'
      });
    }
  };
};

// Middleware opcional para verificar se o usuário pertence a uma instituição específica
export const authorizeInstitution = (req: Request, res: Response, next: NextFunction): Response | void => {
  const user = req.user as AuthTokenPayload;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado'
    });
  }

  const requestedInstitutionId = req.params.institutionId || req.body.institution_id;
  
  if (requestedInstitutionId && user.institutionId !== requestedInstitutionId) {
    // Exceção para administradores do sistema
    if (!user.role || user.role !== 'SYSTEM_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar recursos de outra instituição.'
      });
    }
  }

  next();
};

// Middleware para verificar se o usuário pode acessar seus próprios recursos
export const authorizeOwner = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const user = req.user as AuthTokenPayload;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const requestedUserId = req.params[userIdParam];
    
    if (requestedUserId && user.userId !== requestedUserId) {
      // Exceção para administradores
      if (!user.role || !['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Você só pode acessar seus próprios recursos.'
        });
      }
    }

    next();
  };
};