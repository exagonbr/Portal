import { Request, Response, NextFunction } from 'express';
import cors from 'cors';

/**
 * Configuração específica de CORS para APIs de usuários
 * Permite configuração mais granular e segura para endpoints sensíveis
 */

// Lista de origens permitidas para APIs de usuários
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:8080',
  'https://portal.sabercon.com.br',
  'https://app.sabercon.com.br',
  'https://admin.sabercon.com.br',
  'https://admin.sabercon.com.br/api',
  // Adicione outras origens conforme necessário
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
];

// Configuração de CORS específica para usuários
const usersCorsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Permitir requisições sem origin (ex: mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    // Em desenvolvimento, permitir qualquer origem localhost
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Verificar se a origem está na lista permitida
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Rejeitar origem não permitida
    return callback(new Error('Não permitido pelo CORS - Origem não autorizada'), false);
  },
  credentials: true, // Permitir cookies e headers de autenticação
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-CSRF-Token',
    'X-User-Agent',
    'X-API-Key'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Response-Time',
    'Set-Cookie'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 200,
  maxAge: 86400 // Cache preflight por 24 horas
};

// Middleware de CORS para usuários com logging
export const usersCorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const method = req.method;
  const path = req.path;
  
  console.log(`🔒 [USERS-CORS] ${method} ${path} from origin: ${origin || 'no-origin'}`);
  
  // Aplicar CORS
  cors(usersCorsOptions)(req, res, (err) => {
    if (err) {
      console.error(`❌ [USERS-CORS] Erro CORS: ${err.message} para origem: ${origin}`);
      return res.status(403).json({
        success: false,
        message: 'Acesso negado pelo CORS',
        error: 'Origem não autorizada para acessar APIs de usuários'
      });
    }
    
    // Headers adicionais de segurança para APIs de usuários
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    console.log(`✅ [USERS-CORS] CORS aprovado para ${method} ${path}`);
    next();
  });
};

// Middleware de CORS mais permissivo para endpoints públicos de usuários
export const usersPublicCorsMiddleware = cors({
  origin: '*', // Permitir todas as origens para endpoints públicos
  credentials: false,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  optionsSuccessStatus: 200
});

// Middleware de CORS restritivo para operações administrativas
export const usersAdminCorsMiddleware = cors({
  origin: (origin, callback) => {
    // Apenas origens administrativas específicas
    const adminOrigins = [
      'https://admin.sabercon.com.br',
      'http://localhost:3000', // Para desenvolvimento
      ...(process.env.ADMIN_ORIGINS ? process.env.ADMIN_ORIGINS.split(',') : [])
    ];
    
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (origin && adminOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Acesso administrativo negado'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Admin-Token',
    'X-CSRF-Token'
  ],
  optionsSuccessStatus: 200
});

export default usersCorsMiddleware;