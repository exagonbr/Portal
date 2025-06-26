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

  // CORS - PERMITIR TODAS AS ORIGENS (*)
  app.use(cors({
    origin: '*', // Permitir todas as origens
    credentials: false, // Não pode usar credentials com origin: '*'
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
      'Cookie',
      'X-CSRF-Token',
      'Cache-Control',
      'Pragma'
    ],
    exposedHeaders: [
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods',
      'Set-Cookie',
      'X-Response-Time'
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));

  // Middleware adicional para garantir cabeçalhos CORS adequados em TODAS as respostas
  app.use((req, res, next) => {
    // Sempre permitir todas as origens
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cookie, X-CSRF-Token, Cache-Control, Pragma, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'false'); // Deve ser false com origin: '*'
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight por 24h
    
    // Para requisições OPTIONS (preflight), responder imediatamente
    if (req.method === 'OPTIONS') {
      res.setHeader('Content-Length', '0');
      return res.status(204).end();
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

  // Content Security Policy simplificado para evitar conflitos
  app.use(function (req, res, next) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' *; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; style-src 'self' 'unsafe-inline' *; img-src 'self' data: blob: *; font-src 'self' data: *; connect-src 'self' *; media-src 'self' *; object-src 'none'; base-uri 'self'; form-action 'self' *;"
    );
    next();
  });
} 