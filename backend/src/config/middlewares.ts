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

// CORS permissivo para desenvolvimento
app.use(cors({
  origin: true, // Reflete a origem da requisição
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

// Compressão
app.use(compression());

// Logging
app.use(morgan('dev'));
app.use(responseTimeMiddleware);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
}
