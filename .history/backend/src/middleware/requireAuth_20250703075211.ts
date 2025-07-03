import { Request, Response, NextFunction, RequestHandler } from 'express';
import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG, AccessTokenPayload } from '../config/jwt';
import db from '../config/database';

import { user } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const requireAuth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  const authHeader = authReq.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided or invalid format.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = JWT_CONFIG.SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not configured in environment variables.');
      res.status(500).json({ success: false, message: 'Internal server error: JWT secret not configured.' });
      return;
    }
    
    const decoded = jwt.verify(token, secret) as unknown as AccessTokenPayload;

    if (decoded.type && decoded.type !== 'access') {
      res.status(403).json({ success: false, message: 'Invalid token type. Access token required.' });
      return;
    }

    const user = await db('users')
      .where({ id: decoded.id, is_active: true })
      .first();

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found or inactive.' });
      return;
    }

    authReq.user = user;
    
    next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Token expired.' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: 'Invalid token.' });
      return;
    }
    console.error('Authentication error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
    return;
  }
};
