import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt';

// Extend Express Request interface to include user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId?: string;
      email?: string;
      role?: string;
      permissions?: string[];
    };
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    // Validate JWT token using centralized JWT_CONFIG
    const decoded = jwt.verify(token, JWT_CONFIG.JWT_SECRET) as any;

    if (!decoded || (typeof decoded !== 'object')) {
      return res.status(403).json({
        success: false,
        message: 'Token inválido'
      });
    }

    // Attach user info from token payload to request object
    req.user = {
      userId: decoded.userId || decoded.sub,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || []
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }
};
