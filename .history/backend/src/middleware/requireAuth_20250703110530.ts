import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG, AccessTokenPayload } from '../config/jwt';
import db from '../config/database';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const requireAuth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided or invalid format.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = JWT_CONFIG.SECRET;

    if (!secret) {
      console.error('JWT_SECRET is not configured in environment variables.');
      return res.status(500).json({ success: false, message: 'Internal server error: JWT secret not configured.' });
    }
    
    const decoded = jwt.verify(token, secret) as unknown as AccessTokenPayload;

    if (decoded.type && decoded.type !== 'access') {
      return res.status(403).json({ success: false, message: 'Invalid token type. Access token required.' });
    }

    const user = await db('users')
      .where({ id: parseInt(decoded.id), is_active: true })
      .first();

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or inactive.' });
    }

    req.user = user;
    next();
    return;

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
  }
};
