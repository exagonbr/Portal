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
        console.error('Error fetching user role:', dbError);
        return res.status(401).json({
          success: false,
          message: 'Authentication failed'
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
    const userRole = req.user.role?.toLowerCase();
    if (userRole === 'system_admin') {
      console.log('✅ SYSTEM_ADMIN detectado, permitindo acesso total à rota:', req.path);
      return next();
    }

    // Se não há role definido, permitir acesso com warning (compatibilidade)
    if (!req.user.role) {
      console.warn('⚠️ Usuário sem role acessando rota protegida:', req.path);
      return next();
    }

    // Verificar se o usuário tem uma das roles permitidas
    const allowedRoles = roles.map(role => role.toLowerCase());
    
    if (!allowedRoles.includes(userRole)) {
      console.warn(`❌ Acesso negado para role ${req.user.role} na rota ${req.path}. Necessário: ${roles.join(', ')}`);
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
  if (!req.user?.institutionId) {
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

      const userRole = req.user.role?.toLowerCase();
      
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
