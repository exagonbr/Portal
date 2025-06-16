import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SessionService } from '../services/SessionService';
import { AuthTokenPayload } from '../types/express';

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

    const secret = process.env.JWT_SECRET || 'ExagonTech';
        const decoded = jwt.verify(token, secret) as any;
    
    if (typeof decoded === 'string' || !isValidAuthTokenPayload(decoded)) {
      return res.status(401).json({
        success: false,
        message: 'Payload do token inválido'
      });
    }

    // Cria objeto user tipado
    const userAuth: AuthTokenPayload = {
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

    // Validar sessão se sessionId presente
    if (userAuth.sessionId) {
      const sessionValid = await SessionService.validateSession(userAuth.sessionId);
      if (!sessionValid) {
        // Se a sessão não existe mas o JWT é válido, criar uma nova sessão
        console.log('⚠️ Sessão não encontrada, criando nova sessão para compatibilidade');
        try {
          const { sessionId: newSessionId } = await SessionService.createSession(
            {
              id: userAuth.userId,
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
          console.error('Erro ao criar sessão de compatibilidade:', sessionError);
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

    const secret = process.env.JWT_SECRET || 'ExagonTech';
        const decoded = jwt.verify(token, secret) as any;
    
    if (typeof decoded === 'string' || !isValidAuthTokenPayload(decoded)) {
      return res.status(401).json({
        success: false,
        message: 'Payload do token inválido'
      });
    }
    
    const userAuth: AuthTokenPayload = {
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
    const secret = process.env.JWT_SECRET || 'ExagonTech';
            const decoded = jwt.verify(token, secret);
        
        if (typeof decoded !== 'string' && isValidAuthTokenPayload(decoded)) {
          const userAuth: AuthTokenPayload = {
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

    const secret = process.env.JWT_SECRET || 'ExagonTech';
    const decoded = jwt.verify(token, secret) as any;
    
    if (typeof decoded === 'string' || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    // Criar objeto user mínimo sem validações complexas
    req.user = {
      userId: decoded.userId,
      email: decoded.email || '',
      name: decoded.name || '',
      role: decoded.role || 'user',
      permissions: decoded.permissions || [],
      institutionId: decoded.institutionId,
      sessionId: decoded.sessionId,
      iat: decoded.iat,
      exp: decoded.exp
    };
    
    next();
  } catch (error) {
    console.error('Erro na validação JWT simples:', error);
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado'
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
    console.error('Erro no middleware inteligente:', error);
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
      console.error('Erro no middleware de role inteligente:', error);
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
      console.error(`⚠️ Timeout ou erro no middleware para ${req.path}:`, error);
      // Fallback: usar validação simples
      return validateJWTSimple(req, res, next);
    }
  };
}; 