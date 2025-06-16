import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

// Helper function to validate JWT token
export async function validateJWTToken(token: string) {
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
      const base64Decoded = Buffer.from(token, 'base64').toString('utf-8');
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
      }
    } catch (base64Error) {
      console.error('Both JWT and base64 validation failed:', { jwtError: jwtError.message, base64Error: base64Error.message });
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