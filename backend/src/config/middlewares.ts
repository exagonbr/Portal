import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import passport from 'passport';
import { responseTimeMiddleware } from '../middleware/logging';
import { setupPassport } from './passport';
import { authCheckMiddleware } from '../middleware/authCheck';

/**
 * Configura todos os middlewares da aplicação
 */
export function setupMiddlewares(app: express.Application): void {
  // Habilita o proxy para obter o IP real do usuário
  app.set('trust proxy', 1);

  // Middlewares de segurança essenciais
  app.use(helmet());

  // Configuração de CORS
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
  
  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Permite requisições sem 'origin' (ex: Postman, apps mobile)
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  };
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions)); // Lida com pre-flight requests

  // Cookie parser
  app.use(cookieParser());

  // Compressão de respostas
  app.use(compression());

  // Logging de requisições HTTP
  app.use(morgan('dev'));

  // Parsing de JSON e URL-encoded bodies
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Inicialização do Passport
  setupPassport();
  app.use(passport.initialize());

  // Middleware para verificar autenticação em todas as rotas
  app.use(authCheckMiddleware);

  // Middleware de log de tempo de resposta
  app.use(responseTimeMiddleware);
}
