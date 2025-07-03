import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '../types/express';
import { validateTokenFormat, safeDecodeBase64Token, logTokenValidationError } from '../utils/tokenValidation';

/**
 * Middleware de autenticação melhorado com validação robusta de tokens
 */
export const authMiddlewareImproved = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header or cookies
    let token = req.header('Authorization')?.replace('Bearer ', '') || '';
    
    // If no token in header, try to get from cookies
    if (!token) {
      const cookieHeader = req.headers.cookie || '';
      const cookies = parseCookies(cookieHeader);
      token = cookies.auth_token || cookies.authToken || cookies.token || '';
    }

    if (!token) {
      res.status(401).json({ 
        success: false,
        error: 'No authentication token provided' 
      });
      return;
    }

    // Validate token format
    const formatValidation = validateTokenFormat(token);
    if (!formatValidation.isValid) {
      res.status(401).json({ 
        success: false,
        error: formatValidation.error 
      });
      return;
    }

    let decoded: AuthTokenPayload;

    try {
      // First, try to verify as a real JWT
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'ExagonTech') as AuthTokenPayload;
    } catch (jwtError) {
      // If JWT verification fails, try to decode as base64 (fallback tokens)
      const base64Result = safeDecodeBase64Token(token);
      
      if (!base64Result.success) {
        logTokenValidationError(jwtError, base64Result.error, token);
        res.status(401).json({ 
          success: false,
          error: 'Invalid authentication token' 
        });
        return;
      }

      const fallbackData = base64Result.data!;
      
      // Convert fallback data to AuthTokenPayload format
      decoded = {
        userId: fallbackData.userId,
        email: fallbackData.email,
        name: fallbackData.name,
        role: fallbackData.role,
        permissions: fallbackData.permissions || [],
        institutionId: fallbackData.institutionId,
        sessionId: fallbackData.sessionId || `session_${Date.now()}`,
        iat: fallbackData.iat || Math.floor(Date.now() / 1000),
        exp: fallbackData.exp || Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      };
    }

    // Add user to request object
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false,
      error: 'Authentication failed' 
    });
  }
};

/**
 * Middleware de autenticação opcional que não falha se não houver token
 */
export const optionalAuthMiddlewareImproved = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header or cookies
    let token = req.header('Authorization')?.replace('Bearer ', '') || '';
    
    // If no token in header, try to get from cookies
    if (!token) {
      const cookieHeader = req.headers.cookie || '';
      const cookies = parseCookies(cookieHeader);
      token = cookies.auth_token || cookies.authToken || cookies.token || '';
    }

    // If no token, continue without authentication
    if (!token) {
      next();
      return;
    }

    // Validate token format
    const formatValidation = validateTokenFormat(token);
    if (!formatValidation.isValid) {
      // For optional auth, just continue without setting user
      next();
      return;
    }

    let decoded: AuthTokenPayload;

    try {
      // First, try to verify as a real JWT
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'ExagonTech') as AuthTokenPayload;
    } catch (jwtError) {
      // If JWT verification fails, try to decode as base64 (fallback tokens)
      const base64Result = safeDecodeBase64Token(token);
      
      if (!base64Result.success) {
        // For optional auth, just continue without setting user
        next();
        return;
      }

      const fallbackData = base64Result.data!;
      
      // Convert fallback data to AuthTokenPayload format
      decoded = {
        id: fallbackData.userId,
        email: fallbackData.email,
        name: fallbackData.name,
        role: fallbackData.role,
        permissions: fallbackData.permissions || [],
        institutionId: fallbackData.institutionId,
        sessionId: fallbackData.sessionId || `session_${Date.now()}`,
        iat: fallbackData.iat || Math.floor(Date.now() / 1000),
        exp: fallbackData.exp || Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      };
    }

    // Add user to request object
    req.user = decoded;
    next();
  } catch (error) {
    // For optional auth, just continue without setting user
    console.warn('Optional auth middleware warning:', error);
    next();
  }
};

// Helper function to parse cookies from cookie header
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  
  return cookies;
} 