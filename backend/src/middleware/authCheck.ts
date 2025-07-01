import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      authenticated?: boolean;
      userId?: string;
    }
  }
}

/**
 * Middleware to check if the request has a valid access token.
 * Sets req.authenticated to true if valid, false otherwise.
 */
export function authCheckMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.authenticated = false;
    return next();
  }

  const secret = JWT_CONFIG.SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not configured.');
    req.authenticated = false;
    return next();
  }

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: [JWT_CONFIG.ALGORITHM],
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE,
    }) as any;

    // Set authentication status and user info
    req.authenticated = true;
    req.userId = payload.id;
  } catch (error) {
    req.authenticated = false;
  }

  next();
}
