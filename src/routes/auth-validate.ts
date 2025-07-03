// This file appears to be misplaced - it should be in the backend directory or converted to a Next.js API route
// For Next.js projects, API routes should be in src/app/api/ directory
// There's already a working implementation at src/app/api/auth/validate/route.ts

import { getCurrentUser } from '../services/authService';




const JWT_SECRET = 'SaberconPortal2025_SuperSecretKey_ProductionReady_XYZ789';

interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  permissions?: string[];
  exp?: number;
  iat?: number;
}

/**
 * Validate session function - can be used by Next.js API routes or other services
 * This is a utility function that can be imported and used in proper API routes
 */
export async function validateSession(token: string, sessionId?: string) {
  try {
    if (!token) {
      return {
        valid: false,
        message: 'Token não fornecido'
      };
    }

    // Note: JWT validation should be done on the backend
    // This function now focuses on user validation and session management
    
    // 1. Get user from database using the auth service
    const user = await getCurrentUser();


    if (!user) {
      return {
        valid: false,
        message: 'Usuário não encontrado'
      };
    }

// 2. Optional: Validate session if sessionId is provided (custom implementation needed)
    if (sessionId) {
      console.log('Session validation not implemented for sessionId:', sessionId);
    }

    // Return user data without sensitive information
    const userResponse = {
      id: user.id,

      name: user.name,
      email: user.email,
      role: user.role,
      institution_id: user.institution_id,
      institution_name: user.institution?.name,
      endereco: user.endereco,
      telefone: user.telefone,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      permissions: user.permissions || []
    };

    return {
      valid: true,
      user: userResponse
    };

  } catch (error) {
    console.log('Erro ao validar sessão:', error);
    return {
      valid: false,
      message: 'Erro interno do servidor'
    };
  }
}

// Export a default object for compatibility
export default {
  validateSession
};
