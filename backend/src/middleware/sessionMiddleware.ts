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