import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { AuthTokenPayload } from '../types/express';
import { RoleRepository } from '../repositories/RoleRepository';

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
    const decoded = jwt.verify(token, secret) as any;
    
    if (typeof decoded === 'string' || !isAuthTokenPayload(decoded)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload'
      });
    }
    
    // Se o role não estiver no token, buscar no banco de dados
    if (!decoded.role && decoded.userId) {
      try {
        const userRepository = new UserRepository();
        const roleRepository = new RoleRepository();
        const user = await userRepository.findByEmail(decoded.email!);
        
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
        
        const role = await roleRepository.findById(user.role_id);

        if (!role) {
          return res.status(401).json({
            success: false,
            message: 'Role not found'
          });
        }
        const roleName = role.name;
        decoded.role = roleMapping[roleName] || roleName.toLowerCase();
      } catch (dbError) {
        console.error('Error fetching user role:', dbError);
        return res.status(401).json({
          success: false,
          message: 'Authentication failed'
        });
      }
    }
    
    // Garantir que o role seja sempre definido
    if (!decoded.role) {
      decoded.role = 'user'; // Role padrão se não foi possível determinar
    }
    
    // Criar objeto com tipo garantido
    const authenticatedUser: AuthTokenPayload = {
      ...decoded,
      role: decoded.role! // Usar non-null assertion pois garantimos acima que existe
    };
    
    req.user = authenticatedUser;
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
function isAuthTokenPayload(payload: any): payload is AuthTokenPayload {
  return (
    typeof payload === 'object' &&
    typeof payload.userId === 'string' &&
    (payload.institutionId === undefined || typeof payload.institutionId === 'string') &&
    (payload.email === undefined || typeof payload.email === 'string') &&
    (payload.name === undefined || typeof payload.name === 'string') &&
    (payload.role === undefined || typeof payload.role === 'string') &&
    (payload.permissions === undefined || Array.isArray(payload.permissions)) &&
    (payload.sessionId === undefined || typeof payload.sessionId === 'string') &&
    (payload.iat === undefined || typeof payload.iat === 'number') &&
    (payload.exp === undefined || typeof payload.exp === 'number')
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
