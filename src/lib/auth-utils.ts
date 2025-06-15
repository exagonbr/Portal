import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import jwt from 'jsonwebtoken';

// Helper function to validate JWT token
export async function validateJWTToken(token: string) {
  try {
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
  } catch (error) {
    return null;
  }
}

// Helper function to get authentication from either NextAuth or JWT
export async function getAuthentication(request: NextRequest) {
  // First try NextAuth session
  const session = await getServerSession(authOptions);
  if (session) {
    return session;
  }

  // Then try JWT token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const jwtSession = await validateJWTToken(token);
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