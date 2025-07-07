import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt';

// Helper function to check if a string is valid base64
function isValidBase64(str: string): boolean {
  // Must be a non-empty string with valid base64 characters (+ optional padding)
  if (typeof str !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(str)) {
    return false;
  }
  try {
    // Just decode it; no strict re-encode check needed
    Buffer.from(str, 'base64').toString('utf-8');
    return true;
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

// Cache para evitar validações repetidas
const tokenValidationCache = new Map<string, { valid: boolean; user?: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minuto

// Limpar cache periodicamente
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    tokenValidationCache.forEach((value, key) => {
      if (now - value.timestamp > CACHE_TTL) {
        tokenValidationCache.delete(key);
      }
    });
  }, CACHE_TTL);
}

// Helper function to validate JWT token
export async function validateJWTToken(token: string) {
  // Check for null/undefined strings first
  if (token === 'null' || token === 'undefined' || token === 'false' || token === 'true') {
    return null;
  }

  // Early validation: check if token is not empty and has reasonable length
  if (!token || token.length < 10) {
    return null;
  }

  // Check for obviously malformed tokens
  if (token.includes('\0') || token.includes('\x00')) {
    return null;
  }

  // Check for common invalid token patterns
  if (token.startsWith('Bearer ') || token.includes(' ')) {
    return null;
  }

  // Check cache first
  const cacheKey = token.substring(0, 50);
  const cached = tokenValidationCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    if (cached.valid && cached.user) {
      return { user: cached.user };
    } else {
      return null;
    }
  }

  // Use the JWT secret from JWT_CONFIG
  const jwtSecret = JWT_CONFIG.JWT_SECRET;

  try {
    // Check if it's a JWT token (3 parts)
    const parts = token.split('.');
    const isJwtToken = parts.length === 3;
    
    if (isJwtToken) {
      // Try JWT validation
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      const user = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        institution_id: decoded.institutionId,
        permissions: decoded.permissions || []
      };
      
      // Cache successful validation
      tokenValidationCache.set(cacheKey, {
        valid: true,
        user,
        timestamp: Date.now()
      });
      
      return { user };
    } else {
      // Try fallback base64 decoding for non-JWT tokens
      
      if (!isValidBase64(token)) {
        tokenValidationCache.set(cacheKey, {
          valid: false,
          timestamp: Date.now()
        });
        return null;
      }

      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      
      if (!isValidJSON(decoded)) {
        tokenValidationCache.set(cacheKey, {
          valid: false,
          timestamp: Date.now()
        });
        return null;
      }

      const obj = JSON.parse(decoded);
      
      // Check if it's a valid fallback token structure
      if (!obj.userId || !obj.email || !obj.role) {
        tokenValidationCache.set(cacheKey, {
          valid: false,
          timestamp: Date.now()
        });
        return null;
      }
      
      // Check if token is expired
      if (obj.exp && obj.exp < Math.floor(Date.now() / 1000)) {
        tokenValidationCache.set(cacheKey, {
          valid: false,
          timestamp: Date.now()
        });
        return null;
      }
      
      const user = {
        id: obj.userId,
        email: obj.email,
        name: obj.name || obj.userId,
        role: obj.role,
        institution_id: obj.institutionId,
        permissions: obj.permissions || []
      };
      
      // Cache successful validation
      tokenValidationCache.set(cacheKey, {
        valid: true,
        user,
        timestamp: Date.now()
      });
      
      return { user };
    }
  } catch (error) {
    // Cache failed validation
    tokenValidationCache.set(cacheKey, {
      valid: false,
      timestamp: Date.now()
    });
    
    return null;
  }
}

// FUNÇÃO MELHORADA getAuthentication
export async function getAuthentication(request: NextRequest) {
  // 1. Tentar Authorization header primeiro
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    
    if (token && token !== 'null' && token !== 'undefined') {
      const jwtSession = await validateJWTToken(token);
      if (jwtSession) {
        return jwtSession;
      }
    }
  }

  // 2. Tentar cookies como fallback
  const authToken = request.cookies.get('auth_token')?.value;
  
  if (authToken && authToken !== 'null' && authToken !== 'undefined') {
    const jwtSession = await validateJWTToken(authToken);
    if (jwtSession) {
      return jwtSession;
    }
  }

  return null;
}

// Helper function to check if user has required role
export function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

// Helper function to check if user has required permission
export function hasRequiredPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission);
} 
