import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { 
  corsUsersConfig, 
  isOriginAllowed, 
  getCorsConfigByType,
  allowedHeaders,
  exposedHeaders,
  allowedMethods
} from '../config/corsUsers.config';

/**
 * Configuração específica de CORS para APIs de usuários
 * Utiliza configuração centralizada para facilitar manutenção
 */

// Configuração de CORS geral para usuários
const usersCorsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const config = getCorsConfigByType('general');
    
    if (isOriginAllowed(origin, config.origins)) {
      console.log(`✅ [USERS-CORS] Origem permitida: ${origin || 'no-origin'}`);
      return callback(null, true);
    }
    
    console.warn(`❌ [USERS-CORS] Origem rejeitada: ${origin || 'no-origin'}`);
    return callback(new Error('Não permitido pelo CORS - Origem não autorizada'), false);
  },
  credentials: true,
  methods: allowedMethods,
  allowedHeaders: allowedHeaders,
  exposedHeaders: exposedHeaders,
  preflightContinue: false,
  optionsSuccessStatus: 200,
  maxAge: corsUsersConfig.maxAge
};

// Configuração de CORS para endpoints administrativos
const usersAdminCorsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const config = getCorsConfigByType('admin');
    
    if (isOriginAllowed(origin, config.origins)) {
      console.log(`✅ [USERS-ADMIN-CORS] Origem administrativa permitida: ${origin || 'no-origin'}`);
      return callback(null, true);
    }
    
    console.warn(`❌ [USERS-ADMIN-CORS] Origem administrativa rejeitada: ${origin || 'no-origin'}`);
    return callback(new Error('Acesso administrativo negado pelo CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    ...allowedHeaders,
    'X-Admin-Token',
    'X-Super-Admin-Key'
  ],
  exposedHeaders: exposedHeaders,
  preflightContinue: false,
  optionsSuccessStatus: 200,
  maxAge: corsUsersConfig.maxAge
};

// Configuração de CORS para endpoints públicos
const usersPublicCorsOptions: cors.CorsOptions = {
  origin: '*',
  credentials: false,
  methods: ['GET', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Accept',
    'Origin',
    'X-Requested-With',
    'Cache-Control'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Response-Time'
  ],
  optionsSuccessStatus: 200,
  maxAge: corsUsersConfig.maxAge
};

/**
 * Middleware principal de CORS para usuários com logging detalhado
 */
export const usersCorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const method = req.method;
  const path = req.path;
  const userAgent = req.headers['user-agent'];
  
  console.log(`🔒 [USERS-CORS] ${method} ${path} from origin: ${origin || 'no-origin'}`);
  console.log(`🔒 [USERS-CORS] User-Agent: ${userAgent?.substring(0, 100) || 'unknown'}`);
  
  cors(usersCorsOptions)(req, res, (err: any) => {
    if (err) {
      return next(err);
    }
    
    // Headers adicionais de segurança para APIs de usuários
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-API-Version', '1.0');
    res.setHeader('X-Service', 'users-api');
    
    return next();
  });
};

export const corsErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err && err.message && err.message.includes('CORS')) {
    const isAdmin = err.message.includes('administrativo');
    console.log(`❌ [CORS-ERROR] ${err.message} for origin: ${req.headers.origin}`);
    
    const code = isAdmin ? 'CORS_ADMIN_ACCESS_DENIED' : 'CORS_ORIGIN_NOT_ALLOWED';
    const error = isAdmin ? 'Origem não autorizada para operações administrativas' : 'Origem não autorizada para acessar APIs de usuários';

    return res.status(403).json({
      success: false,
      message: err.message,
      error,
      code
    });
  }
  
  return next(err);
};

/**
 * Middleware de CORS para endpoints públicos de usuários
 */
export const usersPublicCorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const method = req.method;
  const path = req.path;
  
  console.log(`🌐 [USERS-PUBLIC-CORS] ${method} ${path} from origin: ${origin || 'no-origin'}`);
  
  cors(usersPublicCorsOptions)(req, res, (err: any) => {
    if (err) {
      return next(err);
    }
    
    res.setHeader('X-Public-API', 'true');
    return next();
  });
};

/**
 * Middleware de CORS restritivo para operações administrativas
 */
export const usersAdminCorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const method = req.method;
  const path = req.path;
  
  console.log(`🛡️ [USERS-ADMIN-CORS] ${method} ${path} from origin: ${origin || 'no-origin'}`);
  
  cors(usersAdminCorsOptions)(req, res, (err: any) => {
    if (err) {
      return next(err);
    }
    
    // Headers de segurança extras para operações administrativas
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Admin-API', 'true');
    res.setHeader('X-Security-Level', 'high');
    
    return next();
  });
};

/**
 * Middleware de CORS para operações de autenticação
 */
export const usersAuthCorsMiddleware = cors({
  origin: (origin, callback) => {
    const config = getCorsConfigByType('general');
    
    if (isOriginAllowed(origin, config.origins)) {
      return callback(null, true);
    }
    
    return callback(new Error('Origem não autorizada para autenticação'), false);
  },
  credentials: true,
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token'
  ],
  optionsSuccessStatus: 200,
  maxAge: corsUsersConfig.maxAge
});

export default usersCorsMiddleware;