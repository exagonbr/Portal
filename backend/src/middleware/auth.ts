import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';

interface JWTPayload extends JwtPayload {
  userId: string;
  role?: string;
  institutionId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const validateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    const secret = process.env.JWT_SECRET || 'default-secret-key-for-development';
    const decoded = jwt.verify(token, secret);
    
    if (typeof decoded === 'string' || !isJWTPayload(decoded)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload'
      });
    }
    
    // Se o role não estiver no token, buscar no banco de dados
    if (!decoded.role && decoded.userId) {
      try {
        const userRepository = new UserRepository();
        const user = await userRepository.getUserWithRoleAndInstitution(decoded.userId);
        
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }
        
        // Mapear nomes de roles para slugs
        const roleMapping: { [key: string]: string } = {
          'Administrador': 'admin',
          'Professor': 'teacher',
          'Estudante': 'student',
          'Aluno': 'student',
          'Gerente': 'manager'
        };
        
        const roleName = user.role_name || 'user';
        decoded.role = roleMapping[roleName] || roleName.toLowerCase();
      } catch (dbError) {
        console.error('Error fetching user role:', dbError);
        return res.status(401).json({
          success: false,
          message: 'Authentication failed'
        });
      }
    }
    
    req.user = decoded as JWTPayload & { role: string };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Type guard to verify JWT payload structure
function isJWTPayload(payload: any): payload is JWTPayload {
  return (
    typeof payload === 'object' &&
    typeof payload.userId === 'string' &&
    typeof payload.institutionId === 'string'
  );
}

export const requireRole = (roles: string[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const requireInstitution = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (!req.user?.institutionId) {
    return res.status(403).json({
      success: false,
      message: 'Institution access required'
    });
  }

  next();
};
