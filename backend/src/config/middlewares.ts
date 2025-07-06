import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { responseTimeMiddleware } from '../middleware/logging';
import passport from 'passport';
import { setupPassport } from './passport';
import { authCheckMiddleware } from '../middleware/authCheck';
import { activityTrackingMiddleware, errorTrackingMiddleware } from '../middleware/activityTracking';

/**
* Configura todos os middlewares da aplicação
*/
export function setupMiddlewares(app: express.Application): void {
// Cookie parser
app.use(cookieParser());

// Auth check
app.use(authCheckMiddleware);

// Passport
setupPassport();
app.use(passport.initialize());

// Segurança com Helmet (configurações básicas)
app.use(helmet());

// CORS permissivo - PERMITE TODAS AS ORIGENS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173', // Vite
  'https://portal.sabercon.com.br',
  process.env.FRONTEND_URL || ''
].filter(Boolean);

app.use(cors({
  origin: '*', // PERMITE TODAS AS ORIGENS para rotas públicas como login
  credentials: false, // Deve ser false quando origin é '*'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'X-CSRF-Token',
    'Cache-Control',
    'Pragma',
    'Cookie',
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
    'Set-Cookie'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Compressão
app.use(compression());

// Logging
app.use(morgan('dev'));
app.use(responseTimeMiddleware);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Activity Tracking - IMPORTANTE: Deve vir após body parsers e auth
app.use(activityTrackingMiddleware);

// Error tracking - Deve ser um dos últimos middlewares
app.use(errorTrackingMiddleware);
}
