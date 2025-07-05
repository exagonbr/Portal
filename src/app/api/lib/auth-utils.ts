import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

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

// Helper function to validate JWT token
export async function validateJWTToken(token: string) {
  // Early validation: check if token is not empty and has reasonable length
  if (!token || token.length < 10) {
    console.warn('Token is empty or too short');
    return null;
  }

  // Check for obviously malformed tokens (containing special characters that shouldn't be there)
  if (token.includes('\0') || token.includes('\x00')) {
    console.warn('Token contains invalid characters');
    return null;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.log('JWT_SECRET not configured');
    return null;
  }

  // Detect if this is a real JWT (three segments) vs fallback token
  const parts = token.split('.');
  const isJwtToken = parts.length === 3;

  if (isJwtToken) {
    // Handle real JWT tokens
    try {
      const decoded = jwt.verify(token, secret) as any;
      
      if (typeof decoded !== 'object' || !decoded.userId) {
        console.warn('JWT payload missing required fields');
        return null;
      }

      return {
        user: {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
          institution_id: decoded.institutionId,
          permissions: decoded.permissions || []
        }
      };
    } catch (jwtError) {
      // Provide specific error logging for JWT failures
      const errorMsg = jwtError instanceof Error ? jwtError.message : String(jwtError);
      console.warn('JWT validation failed:', errorMsg);
      return null;
    }
  } else {
    // Handle fallback base64 tokens (only in development)
    if (process.env.NODE_ENV === 'production') {
      console.warn('Simple base64 tokens not allowed in production');
      return null;
    }

    try {
      // Validate base64 format before attempting to decode
      if (!isValidBase64(token)) {
        console.warn('Token is not valid base64 format');
        return null;
      }

      const base64Decoded = Buffer.from(token, 'base64').toString('utf-8');
      
      // Check if decoded content is valid JSON
      if (!isValidJSON(base64Decoded)) {
        console.warn('Decoded base64 token is not valid JSON');
        return null;
      }

      const fallbackData = JSON.parse(base64Decoded);
      
      // Check if it's a valid fallback token structure
      if (fallbackData.userId && fallbackData.email && fallbackData.role) {
        // Verify if token is not expired
        if (fallbackData.exp && fallbackData.exp < Math.floor(Date.now() / 1000)) {
          console.log('Fallback token expired');
          return null;
        }
        
        return {
          user: {
            id: fallbackData.userId,
            email: fallbackData.email,
            name: fallbackData.name,
            role: fallbackData.role,
            institution_id: fallbackData.institutionId,
            permissions: fallbackData.permissions || []
          }
        };
      } else {
        console.warn('Fallback token missing required fields');
        return null;
      }
    } catch (base64Error) {
      const errorMsg = base64Error instanceof Error ? base64Error.message : String(base64Error);
      console.warn('Base64 token validation failed:', errorMsg);
      return null;
    }
  }
}

// Helper function to get authentication from JWT or cookies
export async function getAuthentication(request: NextRequest) {
  let token = '';

  // Try JWT token from Authorization header first
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Try X-Auth-Token header as fallback
  if (!token) {
    token = request.headers.get('X-Auth-Token') || request.headers.get('x-auth-token') || '';
  }

  // Try token from cookies as fallback
  if (!token) {
    token = request.cookies.get('auth_token')?.value || 
            request.cookies.get('token')?.value ||
            request.cookies.get('authToken')?.value || '';
  }

  if (!token) {
    console.warn('🚫 Token de autorização não fornecido');
    return null;
  }

  const jwtSession = await validateJWTToken(token);
  if (jwtSession) {
    console.log('✅ Autenticação bem-sucedida para:', jwtSession.user.email);
    return jwtSession;
  }

  console.warn('🚫 Token inválido fornecido');
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
