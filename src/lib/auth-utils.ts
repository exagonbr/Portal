import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { validateJWTWithMultipleSecrets } from '@/utils/jwt-validator';

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

// Helper function to validate JWT token
export async function validateJWTToken(token: string) {
  console.log('🔑 Iniciando validação de token:', {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'N/A',
    tokenType: typeof token,
    isNullString: token === 'null' || token === 'undefined'
  })

  // Check for null/undefined strings first
  if (token === 'null' || token === 'undefined' || token === 'false' || token === 'true') {
    console.warn('🚫 Token is a string representation of null/undefined/boolean:', token);
    return null;
  }

  // Early validation: check if token is not empty and has reasonable length
  if (!token || token.length < 10) {
    console.warn('🚫 Token is empty or too short:', { 
      length: token ? token.length : 0,
      actualValue: token,
      isEmpty: !token,
      isWhitespace: token && token.trim().length === 0
    });
    return null;
  }

  // Check for obviously malformed tokens (containing special characters that shouldn't be there)
  if (token.includes('\0') || token.includes('\x00')) {
    console.warn('🚫 Token contains invalid characters');
    return null;
  }

  // Check for common invalid token patterns
  if (token.startsWith('Bearer ') || token.includes(' ')) {
    console.warn('🚫 Token contains Bearer prefix or spaces - malformed');
    return null;
  }

  try {
    // Use the new JWT validator with multiple secrets
    const validation = validateJWTWithMultipleSecrets(token);
    
    if (!validation.success) {
      throw new Error(validation.error || 'JWT validation failed');
    }
    
    const decoded = validation.decoded;
    console.log('✅ JWT válido, usuário:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    })
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
    console.log('⚠️ JWT verification failed, tentando fallback:', jwtError instanceof Error ? jwtError.message : String(jwtError));
    // JWT failed – try a simple Base64→JSON decode for fallback tokens
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const obj = JSON.parse(decoded);
      
      // Check if it's a valid fallback token structure
      if (!obj.userId || !obj.email || !obj.role) {
        console.warn('Fallback token missing required fields');
        return null;
      }
      
      // Check if token is expired
      if (obj.exp && obj.exp < Math.floor(Date.now() / 1000)) {
        console.warn('Fallback token expired');
        return null;
      }
      
      return {
        user: {
          id: obj.userId,
          email: obj.email,
          name: obj.name || obj.userId,
          role: obj.role,
          institution_id: obj.institutionId,
          permissions: obj.permissions || []
        }
      };
    } catch (fallbackError) {
      const jwtErrorMsg = jwtError instanceof Error ? jwtError.message : String(jwtError);
      const fallbackErrorMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
      
      console.warn('Token validation failed:', { 
        jwtError: jwtErrorMsg, 
        fallbackError: fallbackErrorMsg,
        tokenPreview: token.substring(0, 20) + '...'
      });
      return null;
    }
  }
}

// Helper function to get authentication from JWT or cookies
export async function getAuthentication(request: NextRequest) {
  console.log('🔐 Iniciando processo de autenticação...')
  
  // Try JWT token from Authorization header first
  const authHeader = request.headers.get('authorization');
  console.log('🔐 Authorization header:', authHeader ? 'Presente' : 'Ausente')
  
  if (authHeader) {
    console.log('🔐 Authorization header completo:', authHeader.substring(0, 50) + '...')
    
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      console.log('🔐 Token extraído do header:', {
        length: token.length,
        preview: token.substring(0, 20) + '...',
        isNull: token === 'null',
        isEmpty: !token
      })
      
      const jwtSession = await validateJWTToken(token);
      if (jwtSession) {
        console.log('✅ Autenticação via Authorization header bem-sucedida')
        return jwtSession;
      }
      console.log('❌ Token do Authorization header inválido')
    } else {
      console.log('❌ Authorization header não começa com "Bearer ":', authHeader.substring(0, 20))
    }
  }

  // Try token from cookies as fallback
  const tokenFromCookie = request.cookies.get('auth_token')?.value ||
                         request.cookies.get('token')?.value;
  
  console.log('🔐 Token dos cookies:', tokenFromCookie ? 'Encontrado' : 'Não encontrado')
  
  if (tokenFromCookie) {
    console.log('🔐 Token dos cookies detalhes:', {
      length: tokenFromCookie.length,
      preview: tokenFromCookie.substring(0, 20) + '...',
      isNull: tokenFromCookie === 'null'
    })
    
    const jwtSession = await validateJWTToken(tokenFromCookie);
    if (jwtSession) {
      console.log('✅ Autenticação via cookies bem-sucedida')
      return jwtSession;
    }
    console.log('❌ Token dos cookies inválido')
  }

  console.log('❌ Nenhum token válido encontrado')
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