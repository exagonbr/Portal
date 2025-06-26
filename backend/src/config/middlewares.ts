import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { responseTimeMiddleware } from '../middleware/logging';

/**
 * Configura todos os middlewares da aplicação
 */
export function setupMiddlewares(app: express.Application): void {
  // Middlewares de segurança - Simplificado
  app.use(helmet({
    contentSecurityPolicy: false, // Desabilitar CSP que pode causar problemas
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    originAgentCluster: false,
    referrerPolicy: false,
    strictTransportSecurity: false,
    xContentTypeOptions: false,
    xDnsPrefetchControl: false,
    xDownloadOptions: false,
    xFrameOptions: false,
    xPermittedCrossDomainPolicies: false,
    xPoweredBy: false,
    xXssProtection: false
  }));

  // CORS - Permitir origens específicas para suportar credenciais
  const allowedOrigins = [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://127.0.0.1:3000',
    'https://127.0.0.1:3000',
    'http://localhost:3001',
    'https://localhost:3001',
    process.env.FRONTEND_URL,
    process.env.NEXT_PUBLIC_API_URL
  ].filter(Boolean);

  app.use(cors({
    origin: function (origin, callback) {
      // Permitir requisições sem origin (ex: mobile apps, Postman)
      if (!origin) return callback(null, true);
      
      // Permitir origens específicas
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Para desenvolvimento, permitir localhost em qualquer porta
      if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
        return callback(null, true);
      }
      
      // Rejeitar outras origens
      callback(new Error('Não permitido pelo CORS'));
    },
    credentials: true, // Permitir credenciais
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods',
      'Accept',
      'Origin',
      'Cookie'
    ],
    exposedHeaders: [
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods',
      'Set-Cookie'
    ]
  }));

  // Middleware adicional para garantir cabeçalhos CORS adequados
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Se a origem está na lista permitida ou é desenvolvimento
    if (origin && (allowedOrigins.includes(origin) || 
        (process.env.NODE_ENV === 'development' && origin.includes('localhost')))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cookie');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    return next();
  });

  // Compressão
  app.use(compression());

  // Response time tracking
  app.use(responseTimeMiddleware);

  // Logging simplificado
  app.use(morgan('combined'));

  // Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Content Security Policy adicional
  app.use(function (req, res, next) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://images.unsplash.com; script-src 'self' https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/ 'sha256-INJfZVfoUd61ITRFLf63g+S/NJAfswGDl15oK0iXgYM='; style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css; frame-src 'self' https://www.youtube.com https://youtube.com;"
    );
    next();
  });
} 