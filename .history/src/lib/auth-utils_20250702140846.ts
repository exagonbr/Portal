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

  // Check cache first
  const cacheKey = token.substring(0, 50);
  const cached = tokenValidationCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    if (cached.valid && cached.user) {
      console.log('✅ Token validado via cache');
      return { user: cached.user };
    } else {
      console.log('❌ Token inválido (cache)');
      return null;
    }
  }

  // Use only the primary JWT secret from JWT_CONFIG - no multiple attempts to avoid loops
  const jwtSecret = JWT_CONFIG.JWT_SECRET;

  try {
    console.log('🔑 Tentando validação JWT com secret principal...');
    
    // Check if it's a JWT token (3 parts)
    const parts = token.split('.');
    const isJwtToken = parts.length === 3;
    
    if (isJwtToken) {
      // Try JWT validation
      const decoded = jwt.verify(token, jwtSecret) as any;
      console.log('✅ JWT válido, usuário:', {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      });
      
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
      console.log('⚠️ Não é JWT, tentando fallback base64...');
      
      if (!isValidBase64(token)) {
        console.log('❌ Token não é base64 válido');
        // Cache failed validation
        tokenValidationCache.set(cacheKey, {
          valid: false,
          timestamp: Date.now()
        });
        return null;
      }

      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      
      if (!isValidJSON(decoded)) {
        console.log('❌ Token base64 decodificado não é JSON válido');
        // Cache failed validation
        tokenValidationCache.set(cacheKey, {
          valid: false,
          timestamp: Date.now()
        });
        return null;
      }

      const obj = JSON.parse(decoded);
      
      // Check if it's a valid fallback token structure
      if (!obj.userId || !obj.email || !obj.role) {
        console.warn('❌ Fallback token missing required fields');
        // Cache failed validation
        tokenValidationCache.set(cacheKey, {
          valid: false,
          timestamp: Date.now()
        });
        return null;
      }
      
      // Check if token is expired
      if (obj.exp && obj.exp < Math.floor(Date.now() / 1000)) {
        console.warn('❌ Fallback token expired');
        // Cache failed validation
        tokenValidationCache.set(cacheKey, {
          valid: false,
          timestamp: Date.now()
        });
        return null;
      }
      
      console.log('✅ Token fallback validado com sucesso');
      
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
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn('❌ Token validation failed:', { 
      error: errorMsg,
      tokenPreview: token.substring(0, 20) + '...'
    });
    
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
  console.log('🔐 Iniciando processo de autenticação...');
  
  // 1. Tentar Authorization header primeiro
  const authHeader = request.headers.get('authorization');
  console.log('🔐 Authorization header:', authHeader ? 'Presente' : 'Ausente');
  
  if (authHeader) {
    console.log('🔐 Authorization header completo:', authHeader.substring(0, 50) + '...');
    
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      console.log('🔐 Token extraído do header:', {
        length: token.length,
        preview: token.substring(0, 20) + '...',
        isNull: token === 'null',
        isEmpty: !token
      });
      
      if (token && token !== 'null' && token !== 'undefined') {
        const jwtSession = await validateJWTToken(token);
        if (jwtSession) {
          console.log('✅ Autenticação via Authorization header bem-sucedida');
          return jwtSession;
        }
        console.log('❌ Token do Authorization header inválido');
      }
    } else {
      console.log('❌ Authorization header não começa com "Bearer ":', authHeader.substring(0, 20));
    }
  }

  // 2. Tentar cookies como fallback
  const cookieTokens = [
    request.cookies.get('auth_token')?.value,
    request.cookies.get('token')?.value,
    request.cookies.get('authToken')?.value,
    request.cookies.get('accessToken')?.value
  ];
  
  console.log('🔐 Verificando cookies:', cookieTokens.map(t => t ? 'Encontrado' : 'Vazio'));
  
  for (const tokenFromCookie of cookieTokens) {
    if (tokenFromCookie && tokenFromCookie !== 'null' && tokenFromCookie !== 'undefined') {
      console.log('🔐 Testando token do cookie:', {
        length: tokenFromCookie.length,
        preview: tokenFromCookie.substring(0, 20) + '...'
      });
      
      const jwtSession = await validateJWTToken(tokenFromCookie);
      if (jwtSession) {
        console.log('✅ Autenticação via cookies bem-sucedida');
        return jwtSession;
      }
      console.log('❌ Token do cookie inválido');
    }
  }

  // 3. Tentar extrair do header Cookie manualmente
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    console.log('🔐 Analisando header Cookie manualmente...');
    
    const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        acc[name] = decodeURIComponent(value);
      }
      return acc;
    }, {});
    
    const manualTokens = [
      cookies.auth_token,
      cookies.token,
      cookies.authToken,
      cookies.accessToken
    ];
    
    for (const manualToken of manualTokens) {
      if (manualToken && manualToken !== 'null' && manualToken !== 'undefined' && manualToken.length > 10) {
        console.log('🔐 Testando token manual do cookie:', {
          length: manualToken.length,
          preview: manualToken.substring(0, 20) + '...'
        });
        
        const jwtSession = await validateJWTToken(manualToken);
        if (jwtSession) {
          console.log('✅ Autenticação via cookie manual bem-sucedida');
          return jwtSession;
        }
        console.log('❌ Token manual do cookie inválido');
      }
    }
  }

  console.log('❌ Nenhum token válido encontrado em nenhum método');
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
