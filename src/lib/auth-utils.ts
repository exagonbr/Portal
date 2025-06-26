import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

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

  try {
    // First, try to verify as a real JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ExagonTech') as any;
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
    // If JWT verification fails, try to decode as base64 (fallback tokens)
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
          console.error('Fallback token expired');
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
      // Only log the error if it's not due to invalid format (which we already checked)
      const jwtErrorMsg = jwtError instanceof Error ? jwtError.message : String(jwtError);
      const base64ErrorMsg = base64Error instanceof Error ? base64Error.message : String(base64Error);
      
      console.warn('Token validation failed:', { 
        jwtError: jwtErrorMsg, 
        base64Error: base64ErrorMsg,
        tokenPreview: token.substring(0, 20) + '...'
      });
    }
    
    return null;
  }
}

// Helper function to get authentication from JWT or cookies
export async function getAuthentication(request: NextRequest) {
  // Try JWT token from Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const jwtSession = await validateJWTToken(token);
    if (jwtSession) {
      return jwtSession;
    }
  }

  // Try token from cookies as fallback
  const tokenFromCookie = request.cookies.get('auth_token')?.value || 
                         request.cookies.get('token')?.value;
  
  if (tokenFromCookie) {
    const jwtSession = await validateJWTToken(tokenFromCookie);
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