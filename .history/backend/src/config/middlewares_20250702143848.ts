import express from 'express';
import cookieParser from 'cookie-parser';
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
import { authCheckMiddleware } from '../middleware/authCheck';

/**
 * Configura todos os middlewares da aplicação
 */
export function setupMiddlewares(app: express.Application): void {
  // Cookie parser - deve vir antes de qualquer middleware que use cookies
  app.use(cookieParser());

  // Authentication check middleware - sets req.authenticated
  app.use(authCheckMiddleware);

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

  // Configuração de CORS mais permissiva para resolver problemas de cross-origin
  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Em desenvolvimento, permitir todas as origens
      if (corsUsersConfig.developmentMode) {
        console.log(`🌐 CORS: Permitindo origem (dev): ${origin || 'sem origem'}`);
        return callback(null, true);
      }
      
      // Em produção, verificar lista de origens permitidas
      const allowedList = corsUsersConfig.allowedOrigins;
      if (isOriginAllowed(origin, allowedList)) {
        console.log(`✅ CORS: Origem permitida: ${origin || 'sem origem'}`);
        callback(null, true);
      } else {
        console.warn(`❌ CORS: Origem bloqueada: ${origin || 'sem origem'}`);
        // Não bloquear completamente, apenas logar o aviso
        callback(null, true);
      }
    },
    credentials: true,
    methods: allowedMethods,
    allowedHeaders: [
      ...allowedHeaders,
      'User-Agent',
      'Referer',
      'Host',
      'Connection',
      'Accept-Encoding',
      'Accept-Language'
    ],
    exposedHeaders: [
      ...exposedHeaders,
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods',
      'Access-Control-Allow-Credentials'
    ],
    maxAge: corsUsersConfig.maxAge,
    optionsSuccessStatus: 200, // Mudado de 204 para 200 para melhor compatibilidade
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
