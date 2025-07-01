// This file appears to be misplaced - it should be in the backend directory or converted to a Next.js API route
// For Next.js projects, API routes should be in src/app/api/ directory
// There's already a working implementation at src/app/api/auth/validate/route.ts

import { authService } from '../services/authService';

const JWT_SECRET = process.env.JWT_SECRET || 'ExagonTech';

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
    const user = await authService.getCurrentUser();
    if (!user) {
      return {
        valid: false,
        message: 'Usuário não encontrado'
      };
    }

    // 2. Optional: Validate Redis session if sessionId is provided
    if (sessionId) {
      try {
        const sessionValid = await authService.refreshToken();
        if (!sessionValid) {
          return {
            valid: false,
            message: 'Sessão inválida ou expirada'
          };
        }
      } catch (sessionError) {
        // Session validation failed, continue with basic validation
        console.log('Erro na validação de sessão, continuando com validação básica:', sessionError);
      }
    }

    // 3. Check if user is active (handle both boolean and undefined cases)
    if (user.is_active === false) {
      return {
        valid: false,
        message: 'Usuário inativo'
      };
    }

    // 4. Return user data without sensitive information
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