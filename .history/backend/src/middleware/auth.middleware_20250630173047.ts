import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database/connection';
import { AuthTokenPayload } from '../types/express';

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

// Cache para evitar validações repetidas do mesmo token
const tokenValidationCache = new Map<string, { valid: boolean; decoded?: AuthTokenPayload; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minuto

// Limpar cache periodicamente
setInterval(() => {
  const now = Date.now();
  tokenValidationCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_TTL) {
      tokenValidationCache.delete(key);
    }
  });
}, CACHE_TTL);

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('🔐 Iniciando processo de autenticação...');
    
    // Get token from header or cookies
    const authHeader = req.header('Authorization');
    let token = '';
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
      console.log('🔐 Authorization header: Presente');
      console.log('🔐 Authorization header completo:', authHeader.substring(0, 50) + '...');
      console.log('🔐 Token extraído do header:', {
        length: token.length,
        preview: token.substring(0, 20) + '...',
        isNull: token === 'null',
        isEmpty: !token
      });
    }
    
    // If no token in header, try to get from cookies
    if (!token) {
      const cookieHeader = req.headers.cookie || '';
      const cookies = parseCookies(cookieHeader);
      token = cookies.auth_token || cookies.authToken || cookies.token || '';
      
      if (token) {
        console.log('🔐 Token dos cookies: Encontrado');
        console.log('🔐 Token dos cookies detalhes:', {
          length: token.length,
          preview: token.substring(0, 20) + '...',
          isNull: token === 'null'
        });
      }
    }

    if (!token) {
      console.log('❌ Nenhum token encontrado');
      res.status(401).json({ error: 'No authentication token provided' });
      return;
    }

    // Check for null/undefined strings
    if (token === 'null' || token === 'undefined' || token === 'false' || token === 'true') {
      console.log('❌ Token é string de null/undefined');
      res.status(401).json({ error: 'Invalid token format' });
      return;
    }

    // Early validation: check if token is not empty and has reasonable length
    if (token.length < 10) {
      console.log('❌ Token muito curto:', token.length);
      res.status(401).json({ error: 'Token too short or empty' });
      return;
    }

    // Check for obviously malformed tokens
    if (token.includes('\0') || token.includes('\x00') || token.includes(' ')) {
      console.log('❌ Token contém caracteres inválidos');
      res.status(401).json({ error: 'Token contains invalid characters' });
      return;
    }

    // Check cache first
    const cacheKey = token.substring(0, 50); // Use first 50 chars as cache key
    const cached = tokenValidationCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      if (cached.valid && cached.decoded) {
        req.user = cached.decoded;
        console.log('✅ Token validado via cache');
        next();
        return;
      } else {
        console.log('❌ Token inválido (cache)');
        res.status(401).json({ error: 'Invalid authentication token' });
        return;
      }
    }

    console.log('🔑 Iniciando validação de token:', {
      hasToken: true,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + '...',
      tokenType: 'string',
      isNullString: false
    });

    let decoded: AuthTokenPayload;

    // Try only the primary JWT secret - no multiple attempts
    const jwtSecret = process.env.JWT_SECRET || 'ExagonTech';
    
    try {
      console.log('🔑 Tentando validação JWT com secret principal...');
      decoded = jwt.verify(token, jwtSecret) as AuthTokenPayload;
      console.log('✅ JWT validado com sucesso');
      
      // Cache successful validation
      tokenValidationCache.set(cacheKey, {
        valid: true,
        decoded,
        timestamp: Date.now()
      });
      
    } catch (jwtError) {
      console.log('⚠️ JWT verification failed, tentando fallback:', jwtError instanceof Error ? jwtError.message : String(jwtError));
      
      // Try fallback base64 decoding only once
      try {
        // Validate base64 format before attempting to decode
        if (!isValidBase64(token)) {
          console.log('❌ Token não é base64 válido');
          // Cache failed validation
          tokenValidationCache.set(cacheKey, {
            valid: false,
            timestamp: Date.now()
          });
          res.status(401).json({ error: 'Token is not valid base64 format' });
          return;
        }

        const base64Decoded = Buffer.from(token, 'base64').toString('utf-8');
        
        // Check if decoded content is valid JSON
        if (!isValidJSON(base64Decoded)) {
          console.log('❌ Token base64 decodificado não é JSON válido');
          // Cache failed validation
          tokenValidationCache.set(cacheKey, {
            valid: false,
            timestamp: Date.now()
          });
          res.status(401).json({ error: 'Decoded token is not valid JSON' });
          return;
        }

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
          
          console.log('✅ Token fallback validado com sucesso');
          
          // Cache successful validation
          tokenValidationCache.set(cacheKey, {
            valid: true,
            decoded,
            timestamp: Date.now()
          });
          
        } else {
          console.log('❌ Estrutura de token fallback inválida');
          // Cache failed validation
          tokenValidationCache.set(cacheKey, {
            valid: false,
            timestamp: Date.now()
          });
          res.status(401).json({ error: 'Invalid fallback token structure' });
          return;
        }
      } catch (fallbackError) {
        const jwtErrorMsg = jwtError instanceof Error ? jwtError.message : String(jwtError);
        const fallbackErrorMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        
        console.log('Token validation failed:', { 
          jwtError: jwtErrorMsg, 
          fallbackError: fallbackErrorMsg,
          tokenPreview: token.substring(0, 20) + '...'
        });
        
        // Cache failed validation
        tokenValidationCache.set(cacheKey, {
          valid: false,
          timestamp: Date.now()
        });
        
        res.status(401).json({ error: 'Invalid authentication token' });
        return;
      }
    }

    // For fallback tokens, we trust the decoded data without database lookup
    // since they're used for mock/demo purposes
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
      console.log('✅ Usuário autenticado (fallback):', decoded.email);
      next();
      return;
    }

    // For real JWT tokens, get user from database
    try {
      const user = await db('users')
        .where({ id: decoded.userId, is_active: true })
        .select('id', 'email', 'full_name', 'role_id', 'institution_id', 'is_active', 'created_at', 'updated_at')
        .first();

      if (!user) {
        console.log('❌ Usuário não encontrado no banco de dados');
        res.status(401).json({ error: 'User not found or inactive' });
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
      
      console.log('✅ Usuário autenticado (BD):', decoded.email);
      next();
    } catch (dbError) {
      console.error('Erro ao consultar banco de dados:', dbError);
      res.status(500).json({ error: 'Database error during authentication' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};
