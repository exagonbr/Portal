import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
// import testDatabaseConnection from "./config/database";
import { testRedisConnection } from './config/redis';
import { requestDeduplication } from './middleware/requestDeduplication';
import { 
  responseTimeMiddleware, 
  slowRequestLogger, 
  errorLogger, 
  duplicateRequestLogger,
  devLogFormat,
  prodLogFormat 
} from './middleware/logging';
import apiRoutes from './routes';
import { CacheWarmupService } from './services/CacheWarmupService';
import { Logger } from './utils/Logger';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const logger = new Logger('ServerStartup');

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors({
  origin: '*',
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Credentials',
    'Accept',
    'Origin'
  ],
  exposedHeaders: [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Credentials'
  ]
}));

// Compressão
app.use(compression());

// Response time tracking
app.use(responseTimeMiddleware);

// Logging
const logFormat = process.env.NODE_ENV === 'production' ? prodLogFormat : devLogFormat;
app.use(morgan(logFormat));

// Slow request detection
app.use(slowRequestLogger(2000)); // Log requests taking more than 2 seconds

// Duplicate request detection
app.use(duplicateRequestLogger());

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (_, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Swagger UI at /backend/docs
app.use('/backend/docs', swaggerUi.serve);
app.get('/backend/docs', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Portal Sabercon API Documentation',
  customfavIcon: '/favicon.ico',
}));

// Redirect /backend to /backend/docs
app.get('/backend', (_, res) => {
  res.redirect('/backend/docs');
});

// Mount API Routes with deduplication
app.use('/api', requestDeduplication, apiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    path: req.originalUrl
  });
});

app.use(function (req, res, next) {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://images.unsplash.com; script-src 'self' https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/ 'sha256-INJfZVfoUd61ITRFLf63g+S/NJAfswGDl15oK0iXgYM='; style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css; frame-src 'self' https://www.youtube.com https://youtube.com;"
  );
  next();
});

// Error handler
app.use(errorLogger);
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';
  
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Função para inicializar o servidor
async function startServer() {
  try {
    logger.info('🚀 Iniciando Portal Sabercon Backend...');
    
    // Testa conexões
    logger.info('📊 Testando conexões...');
    
    // const dbConnected = await testDatabaseConnection();
    // if (!dbConnected) {
    //   throw new Error('Falha na conexão com PostgreSQL');
    // }
    
    const redisConnected = await testRedisConnection();
    if (!redisConnected) {
      logger.warn('⚠️  Redis não conectado - algumas funcionalidades podem não funcionar');
    } else {
      // Se o Redis estiver conectado, executa o warmup do cache
      logger.info('🔥 Iniciando warmup do cache...');
      try {
        await CacheWarmupService.warmupCache();
        logger.info('✅ Warmup do cache concluído com sucesso');
      } catch (warmupError) {
        logger.error(`❌ Erro durante o warmup do cache: ${warmupError.message}`, null, warmupError);
      }
    }
    
    // Inicia o servidor
    app.listen(PORT, () => {
      logger.info(`✅ Servidor rodando na porta ${PORT}`);
      logger.info(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📋 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔗 API: http://localhost:${PORT}/api`);
    });
    
  } catch (error) {
    logger.error(`❌ Erro ao iniciar servidor: ${error.message}`, null, error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM recebido, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🛑 SIGINT recebido, encerrando servidor...');
  process.exit(0);
});

// Inicia o servidor
if (require.main === module) {
  startServer();
}

export default app;