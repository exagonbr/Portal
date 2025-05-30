import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/AuthService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';

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
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
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
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    try {
      const user = await AuthService.getUserById(req.user.userId);
      
      if (!user || !user.role) {
        return res.status(403).json({
          success: false,
          message: 'Usuário ou role não encontrados'
        });
      }

      const hasAllPermissions = requiredPermissions.every(permission =>
        user.role.permissions.includes(permission)
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
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado'
    });
  }

  const requestedInstitutionId = req.params.institutionId || req.body.institution_id;
  
  if (requestedInstitutionId && req.user.institutionId !== requestedInstitutionId) {
    // Exceção para administradores do sistema
    if (!req.user.role || req.user.role !== 'SYSTEM_ADMIN') {
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
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const requestedUserId = req.params[userIdParam];
    
    if (requestedUserId && req.user.userId !== requestedUserId) {
      // Exceção para administradores
      if (!req.user.role || !['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Você só pode acessar seus próprios recursos.'
        });
      }
    }

    next();
  };
};