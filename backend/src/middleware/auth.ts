import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { AuthTokenPayload } from '../types/express';
import { RoleRepository } from '../repositories/RoleRepository';

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

    // Early validation: check if token is not empty and has reasonable length
    if (!token || token.length < 10) {
      return res.status(401).json({
        success: false,
        message: 'Token muito curto ou vazio'
      });
    }

    // Check for obviously malformed tokens
    if (token.includes('\0') || token.includes('\x00')) {
      return res.status(401).json({
        success: false,
        message: 'Token contém caracteres inválidos'
      });
    }

    let userAuth: AuthTokenPayload;

    try {
      // Primeiro, tenta validar como JWT real
      const secret = process.env.JWT_SECRET || 'ExagonTech';
      const decoded = jwt.verify(token, secret) as any;
      
      if (typeof decoded === 'string' || !decoded.userId) {
        throw new Error('Invalid JWT payload');
      }
      
      userAuth = {
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
    } catch (jwtError) {
      // Se falhar na validação JWT, tenta decodificar como base64 (fallback tokens)
      try {
        // Validate base64 format before attempting to decode
        if (!isValidBase64(token)) {
          return res.status(401).json({
            success: false,
            message: 'Token não está em formato base64 válido'
          });
        }

        const base64Decoded = Buffer.from(token, 'base64').toString('utf-8');
        
        // Check if decoded content is valid JSON
        if (!isValidJSON(base64Decoded)) {
          return res.status(401).json({
            success: false,
            message: 'Token decodificado não é JSON válido'
          });
        }

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
    console.error('Erro no middleware de validação JWT:', error);
    return res.status(401).json({
      success: false,
      message: 'Falha na autenticação'
    });
  }
};
