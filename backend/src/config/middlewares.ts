import express from 'express';
import cors from 'cors';
import {
  corsUsersConfig,
  isOriginAllowed,
  allowedHeaders,
  exposedHeaders,
  allowedMethods,
} from './corsUsers.config';
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

  // Configuração de CORS utilizando a configuração centralizada e dinâmica
  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // A lista de origens permitidas é gerenciada no arquivo de configuração
      const allowedList = corsUsersConfig.allowedOrigins;

      if (isOriginAllowed(origin, allowedList)) {
        callback(null, true);
      } else {
        // Log para debug de origens bloqueadas
        if (origin) {
          console.warn(`CORS: Bloqueada a origem: ${origin}`);
        }
        callback(new Error('Origem não permitida pela política de CORS.'));
      }
    },
    credentials: true, // Essencial para autenticação baseada em cookies/tokens
    methods: allowedMethods,
    allowedHeaders: allowedHeaders,
    exposedHeaders: exposedHeaders,
    maxAge: corsUsersConfig.maxAge,
    optionsSuccessStatus: 204, // Resposta padrão para preflight (No Content)
    preflightContinue: false,
  };

  // Aplica o middleware de CORS com as opções dinâmicas
  app.use(cors(corsOptions));

  // Garante que as requisições OPTIONS (preflight) sejam tratadas corretamente em todas as rotas
  app.options('*', cors(corsOptions));

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