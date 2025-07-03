import { Request, Response, NextFunction } from 'express';

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

    // For now, we'll do a basic validation
    // In a real implementation, you would validate the JWT token here
    // and extract user information from it
    
    // Mock user data - in production this would come from token validation
    // Using the AuthTokenPayload structure from backend
    req.user = {
      userId: 'user-id',
      email: 'user@example.com',
      role: 'user'
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }
};