import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { responseTimeMiddleware } from '../middleware/logging';
import passport from 'passport';
import { setupPassport } from './passport';

/**
 * Configura todos os middlewares da aplicação
 */
export function setupMiddlewares(app: express.Application): void {
  // Passport
  setupPassport();
  app.use(passport.initialize());
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

  // CORS - PERMITIR TODAS AS ORIGENS (*) - CONFIGURAÇÃO MAIS PERMISSIVA
  app.use(cors({
    origin: '*', // Permitir TODAS as origens
    credentials: false, // Deve ser false com origin: '*'
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
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
      'Pragma',
      'User-Agent',
      'Referer',
      'Host',
      'Connection',
      'Accept-Encoding',
      'Accept-Language'
    ],
    exposedHeaders: [
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods',
      'Allow',
      'Set-Cookie',
      'X-Response-Time',
      'X-Total-Count',
      'X-Page-Count'
    ],
    preflightContinue: false,
    optionsSuccessStatus: 200 // Mudado de 204 para 200 para melhor compatibilidade
  }));

  // Middleware adicional para GARANTIR cabeçalhos CORS em TODAS as respostas
  app.use((req, res, next) => {
    // SEMPRE permitir todas as origens
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cookie, X-CSRF-Token, Cache-Control, Pragma, Accept, Origin, User-Agent, Referer');
    res.setHeader('Access-Control-Allow-Credentials', 'false'); // Deve ser false com origin: '*'
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight por 24h
    res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie, X-Response-Time, X-Total-Count, X-Page-Count');
    res.setHeader('Allow', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD'); // HEADER ALLOW ADICIONADO
    
    // Para requisições OPTIONS (preflight), responder imediatamente
    if (req.method === 'OPTIONS') {
      res.setHeader('Content-Length', '0');
      res.setHeader('Allow', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD'); // GARANTIR ALLOW NO OPTIONS
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

  // Parsing com limites maiores
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Content Security Policy muito permissivo para evitar conflitos
  app.use(function (req, res, next) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' *; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' *; " +
      "style-src 'self' 'unsafe-inline' *; " +
      "img-src 'self' data: blob: *; " +
      "font-src 'self' data: *; " +
      "connect-src 'self' *; " +
      "media-src 'self' *; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self' *;"
    );
    next();
  });

  // Middleware adicional para debug de CORS
  app.use((req, res, next) => {
    console.log(`🌐 CORS Request: ${req.method} ${req.url} from ${req.headers.origin || 'unknown'}`);
    next();
  });
} 