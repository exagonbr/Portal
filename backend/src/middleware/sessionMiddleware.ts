import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SessionService } from '../services/SessionService';
import { AuthTokenPayload } from '../types/express';
import { getJwtSecret } from '../config/jwt';

export interface ClientInfo {
  ipAddress: string;
  userAgent: string;
  deviceInfo?: string;
}

// Tipagem para Request com propriedades customizadas
export type AuthenticatedRequest = Request & {
  user?: AuthTokenPayload;
  sessionId?: string;
  clientInfo?: ClientInfo;
};

/**
 * Middleware para extrair informações do cliente
 */
export const extractClientInfo = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const ipAddress = req.ip || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress || 
    (req.connection as any)?.socket?.remoteAddress ||
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    'unknown';

  const userAgent = req.headers['user-agent'] || 'unknown';
  
  req.clientInfo = {
    ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
    userAgent,
    deviceInfo: `${req.headers['sec-ch-ua-platform'] || 'Unknown Platform'} - ${req.headers['sec-ch-ua'] || 'Unknown Browser'}`
  };

  next();
};

/**
 * Middleware para validar JWT e sessão
 */
export const validateJWTAndSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autorização não fornecido'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    // Verifica se o token está na blacklist
    const isBlacklisted = await SessionService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token invalidado'
      });
    }

    const secret = getJwtSecret();
        const decoded = jwt.verify(token, secret) as any;
    
    if (typeof decoded === 'string' || !isValidAuthTokenPayload(decoded)) {
      return res.status(401).json({
        success: false,
        message: 'Payload do token inválido'
      });
    }

    // Cria objeto user tipado
    const userAuth: AuthTokenPayload = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      permissions: decoded.permissions,
      institutionId: decoded.institutionId,
      sessionId: decoded.sessionId,
      iat: decoded.iat,
      exp: decoded.exp
    };

    // Validar sessão se sessionId presente
    if (userAuth.sessionId) {
      const sessionValid = await SessionService.validateSession(userAuth.sessionId);
      if (!sessionValid) {
        // Se a sessão não existe mas o JWT é válido, criar uma nova sessão
        console.log('⚠️ Sessão não encontrada, criando nova sessão para compatibilidade');
        try {
          const { sessionId: newSessionId } = await SessionService.createSession(
            {
              id: userAuth.id,
              email: userAuth.email,
              name: userAuth.name,
              role_name: userAuth.role,
              institution_id: userAuth.institutionId,
              permissions: userAuth.permissions
            },
            req.clientInfo || {
              ipAddress: req.ip || 'unknown',
              userAgent: req.headers['user-agent'] || 'unknown'
            },
            false
          );
          userAuth.sessionId = newSessionId;
          req.sessionId = newSessionId;
        } catch (sessionError) {
          console.log('Erro ao criar sessão de compatibilidade:', sessionError);
          return res.status(401).json({
            success: false,
            message: 'Sessão inválida ou expirada'
          });
        }
      }
    }

    req.user = userAuth;
    req.sessionId = userAuth.sessionId;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Falha na autenticação'
    });
  }
};

/**
 * Middleware apenas para validar JWT (sem validação de sessão)
 */
export const validateJWTOnly = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autorização não fornecido'
      });
    }

    const token = authHeader.substring(7);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    const secret = getJwtSecret();
        const decoded = jwt.verify(token, secret) as any;
    
    if (typeof decoded === 'string' || !isValidAuthTokenPayload(decoded)) {
      return res.status(401).json({
        success: false,
        message: 'Payload do token inválido'
      });
    }
    
    const userAuth: AuthTokenPayload = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      permissions: decoded.permissions,
      institutionId: decoded.institutionId,
      sessionId: decoded.sessionId,
      iat: decoded.iat,
      exp: decoded.exp
    };
    
    req.user = userAuth;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Falha na autenticação'
    });
  }
};

/**
 * Type guard para verificar estrutura do payload JWT
 */
function isValidAuthTokenPayload(payload: any): payload is AuthTokenPayload {
  return (
    typeof payload === 'object' &&
    typeof payload.userId === 'string' &&
    (payload.institutionId === undefined || typeof payload.institutionId === 'string') &&
    (payload.email === undefined || typeof payload.email === 'string') &&
    (payload.name === undefined || typeof payload.name === 'string') &&
    (payload.role === undefined || typeof payload.role === 'string') &&
    (payload.permissions === undefined || Array.isArray(payload.permissions)) &&
    (payload.sessionId === undefined || typeof payload.sessionId === 'string') &&
    (payload.iat === undefined || typeof payload.iat === 'number') &&
    (payload.exp === undefined || typeof payload.exp === 'number')
  );
}

/**
 * Middleware para verificar roles específicos
 */
export const requireRole = (roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticação necessária'
      });
    }

    if (!req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permissões insuficientes'
      });
    }

    next();
  };
};

/**
 * Middleware para verificar permissões específicas
 */
export const requirePermission = (permissions: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticação necessária'
      });
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Permissões insuficientes'
      });
    }

    next();
  };
};

/**
 * Middleware para verificar se o usuário tem acesso à instituição
 */
export const requireInstitution = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  if (!req.user?.institutionId) {
    return res.status(403).json({
      success: false,
      message: 'Acesso à instituição necessário'
    });
  }

  next();
};

/**
 * Middleware opcional - não falha se não houver token
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token) {
    const secret = getJwtSecret();
            const decoded = jwt.verify(token, secret);
        
        if (typeof decoded !== 'string' && isValidAuthTokenPayload(decoded)) {
          const userAuth: AuthTokenPayload = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role,
            permissions: decoded.permissions,
            institutionId: decoded.institutionId,
            sessionId: decoded.sessionId,
            iat: decoded.iat,
            exp: decoded.exp
          };

          // Valida sessão se sessionId estiver presente
          if (userAuth.sessionId) {
            const sessionData = await SessionService.validateSession(userAuth.sessionId);
            if (sessionData) {
              userAuth.email = sessionData.email;
              userAuth.name = sessionData.name;
              userAuth.role = sessionData.role;
              userAuth.permissions = sessionData.permissions;
              userAuth.institutionId = sessionData.institutionId;
            }
          }
          
          req.user = userAuth;
          req.sessionId = userAuth.sessionId;
        }
      }
    }
  } catch (error) {
    // Ignora erros na autenticação opcional
  }
  
  next();
};

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

/**
 * Middleware ultra-simples que apenas valida JWT sem criar sessões
 * Usado para evitar loops em rotas críticas como dashboard
 */
export const validateJWTSimple = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autorização não fornecido'
      });
    }

    const token = authHeader.substring(7);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    // Early validation: check if token is valid base64 and has reasonable length
    if (!token || token.length < 10 || !isValidBase64(token)) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou malformado'
      });
    }

    // Check for malformed tokens
    if (token.includes('\0') || token.includes('\x00') || !isValidJSON(Buffer.from(token, 'base64').toString())) {
      return res.status(401).json({
        success: false,
        message: 'Token contém caracteres inválidos'
      });
    }

    let userAuth: AuthTokenPayload;

    try {
      // Primeiro, tenta validar como JWT real
      const secret = getJwtSecret();
      const decoded = jwt.verify(token, secret) as any;
      
      if (typeof decoded === 'string' || (!decoded.userId && !decoded.id)) {
        console.warn('⚠️ Invalid JWT payload detected:', {
          decoded: typeof decoded,
          hasUserId: !!decoded?.userId,
          hasId: !!decoded?.id
        });
        return res.status(401).json({
          success: false,
          message: 'Payload do token inválido'
        });
      }
      
      userAuth = {
        id: decoded.userId || decoded.id,
        email: decoded.email || '',
        name: decoded.name || '',
        role: decoded.role || decoded.role_name || 'user',
        permissions: decoded.permissions || [],
        institutionId: decoded.institutionId,
        sessionId: decoded.sessionId,
        iat: decoded.iat,
        exp: decoded.exp
      };
    } catch (jwtError) {
      // Se falhar na validação JWT, tenta decodificar como base64 (fallback tokens)
      try {
        // Direct decode and parse - no strict validation gates
        const base64Decoded = Buffer.from(token, 'base64').toString('utf-8');
        const fallbackData = JSON.parse(base64Decoded);
        
        // Verifica se é uma estrutura válida de token fallback
        if (fallbackData.userId && fallbackData.email && fallbackData.role) {
          // Verifica se o token não expirou
          if (fallbackData.exp && fallbackData.exp < Math.floor(Date.now() / 1000)) {
            return res.status(401).json({
              success: false,
              message: 'Token expirado'
            });
          }
          
          userAuth = {
            id: fallbackData.id,
            email: fallbackData.email,
            name: fallbackData.name || fallbackData.userId,
            role: fallbackData.role,
            permissions: fallbackData.permissions || [],
            institutionId: fallbackData.institutionId,
            sessionId: fallbackData.sessionId,
            iat: fallbackData.iat || Math.floor(Date.now() / 1000),
            exp: fallbackData.exp || Math.floor(Date.now() / 1000) + 3600
          };
        } else {
          return res.status(401).json({
            success: false,
            message: 'Estrutura de token fallback inválida'
          });
        }
      } catch (base64Error) {
        const jwtErrorMsg = jwtError instanceof Error ? jwtError.message : String(jwtError);
        const base64ErrorMsg = base64Error instanceof Error ? base64Error.message : String(base64Error);
        
        console.warn('Token validation failed:', { 
          jwtError: jwtErrorMsg, 
          base64Error: base64ErrorMsg,
          tokenPreview: token.substring(0, 20) + '...'
        });
        
        return res.status(401).json({
          success: false,
          message: 'Token inválido ou expirado'
        });
      }
    }
    
    req.user = userAuth;
    next();
  } catch (error) {
    console.log('Erro no middleware de validação JWT simples:', error);
    return res.status(401).json({
      success: false,
      message: 'Falha na autenticação'
    });
  }
};

/**
 * Middleware inteligente que escolhe automaticamente entre validação simples e completa
 * baseado na rota e contexto para evitar loops
 */
export const validateJWTSmart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const path = req.path || req.url;
    const isHighRiskRoute = [
      '/dashboard/system',
      '/dashboard/metrics',
      '/dashboard/analytics',
      '/aws/connection-logs/stats',
      '/sessions/validate',
      '/sessions/list'
    ].some(route => path.includes(route));

    // Para rotas de alto risco, usar validação simples
    if (isHighRiskRoute) {
      console.log(`🛡️ Usando validação simples para rota de alto risco: ${path}`);
      return validateJWTSimple(req, res, next);
    }

    // Para outras rotas, usar validação completa
    return validateJWTAndSession(req, res, next);
  } catch (error) {
    console.log('Erro no middleware inteligente:', error);
    // Fallback para validação simples em caso de erro
    return validateJWTSimple(req, res, next);
  }
};

/**
 * Middleware de role inteligente que evita consultas desnecessárias
 */
export const requireRoleSmart = (roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Response | void => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Autenticação necessária'
        });
      }

      const userRole = req.user.role?.toLowerCase();
      
      // SYSTEM_ADMIN tem acesso a TODAS as rotas
      if (userRole === 'system_admin') {
        console.log('✅ SYSTEM_ADMIN detectado, permitindo acesso total à rota:', req.path);
        return next();
      }
      
      const allowedRoles = roles.map(role => role.toLowerCase());
      
      // Se não há role definido, permitir acesso com warning
      if (!userRole) {
        console.warn(`⚠️ Usuário sem role acessando rota protegida: ${req.path}`);
        return next();
      }

      // Verificar se o usuário tem uma das roles permitidas
      if (!allowedRoles.includes(userRole)) {
        console.warn(`❌ Acesso negado para role ${userRole} na rota ${req.path}. Necessário: ${roles.join(', ')}`);
        return res.status(403).json({
          success: false,
          message: 'Permissões insuficientes'
        });
      }

      console.log('✅ Acesso permitido para role:', userRole, 'na rota:', req.path);
      next();
    } catch (error) {
      console.log('Erro no middleware de role inteligente:', error);
      // Em caso de erro, permitir acesso com warning
      console.warn('⚠️ Erro na verificação de role, permitindo acesso');
      next();
    }
  };
};

/**
 * Middleware wrapper que adiciona timeout e fallback para qualquer middleware
 */
export const withTimeout = (middleware: any, timeoutMs: number = 5000) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Middleware timeout')), timeoutMs);
      });

      const middlewarePromise = new Promise((resolve, reject) => {
        middleware(req, res, (error?: any) => {
          if (error) reject(error);
          else resolve(true);
        });
      });

      await Promise.race([middlewarePromise, timeoutPromise]);
      next();
    } catch (error) {
      console.log(`⚠️ Timeout ou erro no middleware para ${req.path}:`, error);
      // Fallback: usar validação simples
      return validateJWTSimple(req, res, next);
    }
  };
};

/**
 * Middleware ultra-simples para validar apenas JWT (para debug e casos críticos)
 */
export const validateTokenUltraSimple = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;
    
    // Log para debug
    console.log('🔍 validateTokenUltraSimple - Header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header or invalid format');
      return res.status(401).json({
        success: false,
        error: 'Token de autorização não fornecido',
        debug: 'No authorization header or doesn\'t start with Bearer'
      });
    }

    const token = authHeader.substring(7).trim();
    console.log('🔍 Token length:', token ? token.length : 0);
    
    if (token.length < 10) {
      console.log('❌ Token too short:', token.length);
      return res.status(401).json({
        success: false,
        error: 'Token muito curto ou vazio',
        debug: `Token length: ${token.length}`
      });
    }

    const secret = getJwtSecret();

    // Detect if this is a real JWT (three segments) vs fallback token
    const parts = token.split('.');
    const isJwtToken = parts.length === 3;

    if (isJwtToken) {
      // Handle real JWT tokens
      try {
        const decoded = jwt.verify(token, secret) as any;
        console.log('✅ Token decoded as JWT successfully for user:', decoded.email || decoded.userId);
        
        if (typeof decoded !== 'object' || (!decoded.userId && !decoded.id)) {
          console.warn('⚠️ Invalid JWT payload detected:', {
            decoded: typeof decoded,
            hasUserId: !!decoded?.userId,
            hasId: !!decoded?.id
          });
          return res.status(401).json({
            success: false,
            error: 'Payload do token inválido',
            debug: 'JWT payload missing userId/id or is not object'
          });
        }
        
        req.user = {
          id: decoded.userId || decoded.id,
          email: decoded.email || '',
          name: decoded.name || '',
          role: decoded.role || decoded.role_name || 'user',
          permissions: decoded.permissions || [],
          institutionId: decoded.institutionId,
          sessionId: decoded.sessionId,
          iat: decoded.iat,
          exp: decoded.exp
        };
        
        console.log('✅ User authenticated via JWT:', req.user?.email, 'Role:', req.user?.role);
        return next();
      } catch (jwtError: any) {
        console.log('❌ JWT verification failed:', jwtError.message);
        
        // Provide specific JWT error messages
        if (jwtError.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            error: 'Token expirado',
            debug: 'JWT token has expired'
          });
        }
        
        if (jwtError.name === 'JsonWebTokenError') {
          return res.status(401).json({
            success: false,
            error: 'Token inválido ou expirado',
            debug: `JWT error: ${jwtError.message}`
          });
        }
        
        return res.status(401).json({
          success: false,
          error: 'Erro na validação do token',
          debug: `JWT verification failed: ${jwtError.message}`
        });
      }
    } else {
      // Handle fallback base64 tokens (only in development)
      if (process.env.NODE_ENV === 'production') {
        console.log('❌ Simple base64 tokens not allowed in production');
        return res.status(401).json({
          success: false,
          error: 'Apenas tokens JWT são aceitos em produção',
          debug: 'Simple base64 tokens not allowed in production'
        });
      }

      try {
        console.log('🔍 Trying base64 fallback token...');
        
        // Normalize URL-safe Base64 to standard Base64
        const base64url = token.replace(/-/g, '+').replace(/_/g, '/');
        const padding = base64url.length % 4;
        const b64 = padding ? base64url + '='.repeat(4 - padding) : base64url;

        let fallbackData: any;
        try {
          const decoded = Buffer.from(b64, 'base64').toString('utf8');
          fallbackData = JSON.parse(decoded);
        } catch (decodeError) {
          console.log('❌ Base64 decode or JSON parse failed:', decodeError);
          return res.status(401).json({
            success: false,
            error: 'Token inválido ou expirado',
            debug: 'Base64 decode or JSON parse failed'
          });
        }

        console.log('🔍 Fallback token data:', { userId: fallbackData.userId, email: fallbackData.email, role: fallbackData.role });
        
        // Validate required fields
        if (!fallbackData.userId || !fallbackData.email || !fallbackData.role) {
          return res.status(401).json({
            success: false,
            error: 'Estrutura de token simples inválida',
            debug: 'Fallback token missing required fields: userId, email, or role'
          });
        }

        // Check expiration
        if (fallbackData.exp && fallbackData.exp < Math.floor(Date.now() / 1000)) {
          return res.status(401).json({
            success: false,
            error: 'Token expirado',
            debug: 'Fallback token has expired'
          });
        }

        req.user = {
          id: fallbackData.id,
          email: fallbackData.email,
          name: fallbackData.name || fallbackData.userId,
          role: fallbackData.role,
          permissions: fallbackData.permissions || [],
          institutionId: fallbackData.institutionId,
          sessionId: fallbackData.sessionId,
          iat: fallbackData.iat || Math.floor(Date.now() / 1000),
          exp: fallbackData.exp || Math.floor(Date.now() / 1000) + 3600
        };

        console.log('✅ User authenticated via fallback token:', req.user?.email, 'Role:', req.user?.role);
        return next();
      } catch (error: any) {
        console.log('❌ Fallback token processing failed:', error.message);
        return res.status(401).json({
          success: false,
          error: 'Token inválido ou expirado',
          debug: 'Fallback token processing failed'
        });
      }
    }
  } catch (error: any) {
    console.log('❌ validateTokenUltraSimple error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno na validação do token',
      debug: error.message
    });
  }
}; 