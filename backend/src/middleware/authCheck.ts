import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt';


/**
 * Middleware to check if the request has a valid access token.
 * Sets req.authenticated to true if valid, false otherwise.
 */
export function authCheckMiddleware(req: Request, res: Response, next: NextFunction) {
  // Garantir que a resposta sempre será JSON
  res.setHeader('Content-Type', 'application/json');

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    (req as any).authenticated = false;
    return next();
  }

  const secret = JWT_CONFIG.SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not configured.');
    (req as any).authenticated = false;
    return next();
  }

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: [JWT_CONFIG.ALGORITHM],
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE,
    }) as any;

    // Set authentication status and user info
    (req as any).authenticated = true;
    (req as any).userId = payload.id;
  } catch (error) {
    (req as any).authenticated = false;
  }

  next();
}
