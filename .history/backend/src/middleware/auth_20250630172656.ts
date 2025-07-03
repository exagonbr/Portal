import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { AuthTokenPayload } from '../types/express';
import { RoleRepository } from '../repositories/RoleRepository';

export const validateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    const secret = process.env.JWT_SECRET || 'ExagonTech';
    const decoded = jwt.verify(token, secret) as any;
    
    if (typeof decoded === 'string' || !isAuthTokenPayload(decoded)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload'
      });
    }
    
    // Se o role não estiver no token, buscar no banco de dados
    if (!decoded.role && decoded.userId) {
      try {
        const userRepository = new UserRepository();
        const roleRepository = new RoleRepository();
        const user = await userRepository.findByEmail(decoded.email!);
        
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }
        
        // Mapear nomes de roles para slugs
        const roleMapping: { [key: string]: string } = {
          'Administrador': 'admin',
          'Professor': 'teacher',
          'Estudante': 'student',
          'Aluno': 'student',
          'Gerente': 'manager',
          'SYSTEM_ADMIN': 'SYSTEM_ADMIN',
          'INSTITUTION_MANAGER': 'INSTITUTION_MANAGER',
          'TEACHER': 'teacher',
          'STUDENT': 'student'
        };
        
        const role = await roleRepository.findById(user.role_id);

        if (!role) {
          return res.status(401).json({
            success: false,
            message: 'Role not found'
          });
        }
        const roleName = role.name;
        decoded.role = roleMapping[roleName] || roleName.toLowerCase();
      } catch (dbError) {
        console.error('Erro ao consultar banco de dados:', dbError);
        return res.status(500).json({
          success: false,
          error: 'Database error during authentication'
        });
      }
    }
    
    // Garantir que o role seja sempre definido
    if (!decoded.role) {
      decoded.role = 'user'; // Role padrão se não foi possível determinar
    }
    
    // Criar objeto com tipo garantido
    const authenticatedUser: AuthTokenPayload = {
      ...decoded,
      role: decoded.role! // Usar non-null assertion pois garantimos acima que existe
    };
    
    req.user = authenticatedUser;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Type guard to verify JWT payload structure
function isAuthTokenPayload(payload: any): payload is AuthTokenPayload {
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

export const requireRole = (roles: string[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // SYSTEM_ADMIN tem acesso a TODAS as rotas
    const userRole = (req.user as any).role?.toLowerCase();
    if (userRole === 'system_admin') {
      console.log('✅ SYSTEM_ADMIN detectado, permitindo acesso total à rota:', req.path);
      return next();
    }

    // Se não há role definido, permitir acesso com warning (compatibilidade)
    if (!(req.user as any).role) {
      console.warn('⚠️ Usuário sem role acessando rota protegida:', req.path);
      return next();
    }

    // Verificar se o usuário tem uma das roles permitidas
    const allowedRoles = roles.map(role => role.toLowerCase());
    
    if (!allowedRoles.includes(userRole)) {
      console.warn(`❌ Acesso negado para role ${(req.user as any).role} na rota ${req.path}. Necessário: ${roles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    console.log('✅ Acesso permitido para role:', userRole, 'na rota:', req.path);
    next();
  };
};

export const requireInstitution = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (!(req.user as any)?.institutionId) {
    return res.status(403).json({
      success: false,
      message: 'Institution access required'
    });
  }

  next();
};

/**
 * Middleware JWT inteligente que evita consultas desnecessárias ao banco
 */
export const validateJWTSmart = async (
  req: Request,
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
    
    if (typeof decoded === 'string' || !isAuthTokenPayload(decoded)) {
      return res.status(401).json({
        success: false,
        message: 'Payload do token inválido'
      });
    }
    
    // Se o role já está no token, usar diretamente (evita consulta BD)
    if (decoded.role) {
      req.user = {
        ...decoded,
        role: decoded.role
      };
      return next();
    }

    // Apenas buscar no BD se absolutamente necessário e com timeout
    if (decoded.userId && decoded.email) {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('DB query timeout')), 3000);
        });

        const dbQueryPromise = (async () => {
          const userRepository = new UserRepository();
          const roleRepository = new RoleRepository();
          const user = await userRepository.findByEmail(decoded.email!);
          
          if (!user) {
            throw new Error('Usuário não encontrado');
          }
          
          const role = await roleRepository.findById(user.role_id);
          return role?.name || 'user';
        })();

        const roleName = await Promise.race([dbQueryPromise, timeoutPromise]) as string;
        
        // Mapear nomes de roles para slugs
        const roleMapping: { [key: string]: string } = {
          'Administrador': 'admin',
          'Professor': 'teacher',
          'Estudante': 'student',
          'Aluno': 'student',
          'Gerente': 'manager',
          'SYSTEM_ADMIN': 'SYSTEM_ADMIN',
          'INSTITUTION_MANAGER': 'INSTITUTION_MANAGER',
          'TEACHER': 'teacher',
          'STUDENT': 'student'
        };
        
        decoded.role = roleMapping[roleName] || roleName.toLowerCase();
      } catch (dbError) {
        console.warn('⚠️ Erro ao buscar role do usuário, usando role padrão:', dbError);
        decoded.role = 'user'; // Role padrão
      }
    } else {
      decoded.role = 'user'; // Role padrão se não há informações suficientes
    }
    
    req.user = decoded;
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
 * Middleware de role inteligente com fallbacks
 */
export const requireRoleSmart = (roles: string[]) => {
  return (
    req: Request,
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

      const userRole = (req.user as any).role?.toLowerCase();
      
      // SYSTEM_ADMIN tem acesso a TODAS as rotas
      if (userRole === 'system_admin') {
        console.log('✅ SYSTEM_ADMIN detectado, permitindo acesso total à rota:', req.path);
        return next();
      }
      
      const allowedRoles = roles.map(role => role.toLowerCase());
      
      // Se não há role definido, permitir acesso com warning para compatibilidade
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
 * Middleware ultra-simples que apenas valida JWT sem consultas BD
 */
export const validateJWTSimple = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autorização não fornecido',
        debug: 'Authorization header missing or malformed'
      });
    }

    const token = authHeader.substring(7).trim();
    if (token.length < 10) {
      return res.status(401).json({
        success: false,
        error: 'Token muito curto ou vazio',
        debug: `Token length: ${token.length}`
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('⚠️  JWT_SECRET não definido');
      return res.status(500).json({
        success: false,
        error: 'Configuração de autenticação incorreta',
        debug: 'JWT_SECRET environment variable not set'
      });
    }

    // Detect if this is a real JWT (three segments) vs fallback token
    const parts = token.split('.');
    const isJwtToken = parts.length === 3;

    if (isJwtToken) {
      // Handle real JWT tokens
      try {
        const decoded = jwt.verify(token, secret) as any;
        
        if (typeof decoded !== 'object' || !decoded.userId) {
          return res.status(401).json({
            success: false,
            error: 'Payload de JWT inválido',
            debug: 'JWT payload missing required fields'
          });
        }

        // Attach validated user to request
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
        
        console.log('✅ JWT validation successful for user:', decoded.email || decoded.userId);
        return next();
      } catch (jwtError: any) {
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
        return res.status(401).json({
          success: false,
          error: 'Apenas tokens JWT são aceitos em produção',
          debug: 'Simple base64 tokens not allowed in production'
        });
      }

      try {
        // Normalize URL-safe Base64 to standard Base64
        const base64url = token.replace(/-/g, '+').replace(/_/g, '/');
        const padding = base64url.length % 4;
        const b64 = padding ? base64url + '='.repeat(4 - padding) : base64url;

        let fallbackData: any;
        try {
          const decoded = Buffer.from(b64, 'base64').toString('utf8');
          fallbackData = JSON.parse(decoded);
        } catch (decodeError) {
          return res.status(401).json({
            success: false,
            error: 'Token inválido ou expirado',
            debug: 'Base64 decode or JSON parse failed'
          });
        }

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

        // Attach fallback user to request
        req.user = {
          userId: fallbackData.userId,
          email: fallbackData.email,
          name: fallbackData.name || fallbackData.userId,
          role: fallbackData.role,
          permissions: fallbackData.permissions || [],
          institutionId: fallbackData.institutionId,
          sessionId: fallbackData.sessionId,
          iat: fallbackData.iat || Math.floor(Date.now() / 1000),
          exp: fallbackData.exp || Math.floor(Date.now() / 1000) + 3600
        };

        console.log('✅ Fallback token validation successful for user:', fallbackData.email);
        return next();
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'Token inválido ou expirado',
          debug: 'Fallback token processing failed'
        });
      }
    }
  } catch (error) {
    console.error('Erro no middleware de validação JWT:', error);
    return res.status(500).json({
      success: false,
      error: 'Falha na autenticação',
      debug: 'Internal authentication error'
    });
  }
};
