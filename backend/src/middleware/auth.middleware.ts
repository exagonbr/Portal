import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database/connection';
import { AuthTokenPayload } from '../types/express';

// Helper function to check if a string is valid base64
function isValidBase64(str: string): boolean {
  try {
    // Check if the string has valid base64 characters
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(str)) {
      return false;
    }
    // Try to decode and encode back to see if it's valid
    const decoded = Buffer.from(str, 'base64').toString('utf-8');
    const encoded = Buffer.from(decoded, 'utf-8').toString('base64');
    return encoded === str;
  } catch {
    return false;
  }
}

// Helper function to check if a string contains valid JSON
function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

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

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      res.status(401).json({ error: 'No authentication token provided' });
      return;
    }

    // Early validation: check if token is not empty and has reasonable length
    if (!token || token.length < 10) {
      res.status(401).json({ error: 'Token too short or empty' });
      return;
    }

    // Check for obviously malformed tokens
    if (token.includes('') || token.includes('\0') || token.includes('\x00')) {
      res.status(401).json({ error: 'Token contains invalid characters' });
      return;
    }

    let decoded: AuthTokenPayload;

    try {
      // First, try to verify as a real JWT
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'ExagonTech') as AuthTokenPayload;
    } catch (jwtError) {
      // If JWT verification fails, try to decode as base64 (fallback tokens)
      try {
        // Validate base64 format before attempting to decode
        if (!isValidBase64(token)) {
          res.status(401).json({ error: 'Token is not valid base64 format' });
          return;
        }

        const base64Decoded = Buffer.from(token, 'base64').toString('utf-8');
        
        // Check if decoded content is valid JSON
        if (!isValidJSON(base64Decoded)) {
          res.status(401).json({ error: 'Decoded token is not valid JSON' });
          return;
        }

        const fallbackData = JSON.parse(base64Decoded);
        
        // Convert fallback data to AuthTokenPayload format
        if (fallbackData.userId && fallbackData.email && fallbackData.role) {
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
        } else {
          res.status(401).json({ error: 'Invalid fallback token structure' });
          return;
        }
      } catch (fallbackError) {
        const jwtErrorMsg = jwtError instanceof Error ? jwtError.message : String(jwtError);
        const fallbackErrorMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        
        console.warn('Token validation failed:', { 
          jwtError: jwtErrorMsg, 
          fallbackError: fallbackErrorMsg,
          tokenPreview: token.substring(0, 20) + '...'
        });
        
        res.status(401).json({ error: 'Invalid authentication token' });
        return;
      }
    }

    // For fallback tokens, we trust the decoded data without database lookup
    // since they're used for mock/demo purposes
    if (decoded.userId === 'admin' || decoded.userId === 'gestor' || decoded.userId === 'professor') {
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        permissions: decoded.permissions,
        institutionId: decoded.institutionId,
        sessionId: decoded.sessionId,
        iat: decoded.iat,
        exp: decoded.exp
      };
      next();
      return;
    }

    // For real JWT tokens, get user from database
    const user = await db('users')
      .where({ id: decoded.userId, is_active: true })
      .select('id', 'email', 'name', 'role_id', 'institution_id', 'school_id', 'is_active', 'created_at', 'updated_at')
      .first();

    if (!user) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }

    // Add user to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      permissions: decoded.permissions,
      institutionId: decoded.institutionId,
      sessionId: decoded.sessionId,
      iat: decoded.iat,
      exp: decoded.exp
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};
