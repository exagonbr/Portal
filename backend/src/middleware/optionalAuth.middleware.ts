import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database/connection';
import { AuthTokenPayload } from '../types/express';

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

/**
 * Middleware de autenticação opcional - não bloqueia se não houver token
 * Útil para endpoints que podem ser acessados publicamente ou com autenticação
 */
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from header or cookies
    let token = req.header('Authorization')?.replace('Bearer ', '') || '';
    
    // If no token in header, try to get from cookies
    if (!token) {
      const cookieHeader = req.headers.cookie || '';
      const cookies = parseCookies(cookieHeader);
      token = cookies.auth_token || cookies.authToken || cookies.token || '';
    }

    // Se não há token, continua sem autenticação
    if (!token) {
      next();
      return;
    }

    let decoded: AuthTokenPayload;

    try {
      // First, try to verify as a real JWT
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'ExagonTech') as AuthTokenPayload;
    } catch (jwtError) {
      // If JWT verification fails, try to decode as base64 (fallback tokens)
      try {
        const base64Decoded = Buffer.from(token, 'base64').toString('utf-8');
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
          throw new Error('Invalid fallback token structure');
        }
      } catch (fallbackError) {
        // Se falha na decodificação, continua sem autenticação
        const errorMessage = fallbackError instanceof Error ? fallbackError.message : 'Erro desconhecido';
        console.warn('Token inválido, continuando sem autenticação:', errorMessage);
        next();
        return;
      }
    }

    // For fallback tokens, we trust the decoded data without database lookup
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
      // Se usuário não encontrado, continua sem autenticação
      console.warn('Usuário não encontrado, continuando sem autenticação');
      next();
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
    // Em caso de erro, continua sem autenticação
    console.warn('Erro no middleware de autenticação opcional:', error);
    next();
  }
};