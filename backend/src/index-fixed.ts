import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { testRedisConnection } from './config/redis';
import apiRoutes from './routes';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// MIDDLEWARE PRIORITÁRIO: Tratar OPTIONS (preflight) ANTES de qualquer outro middleware
app.use((req, res, next) => {
  // Definir headers CORS em TODAS as respostas
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cookie, X-CSRF-Token, Cache-Control, Pragma, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Responder imediatamente a requisições OPTIONS
  if (req.method === 'OPTIONS') {
    res.setHeader('Content-Length', '0');
    return res.status(204).end();
  }
  
  return next();
});

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

// CORS - Permitir todas as origens (*) - CONFIGURAÇÃO ABERTA
app.use(cors({
  origin: '*',
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
    'X-Response-Time',
    'Set-Cookie'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middleware adicional para garantir CORS em todas as respostas
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cookie, X-CSRF-Token, Cache-Control, Pragma, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    res.setHeader('Content-Length', '0');
    return res.status(204).end();
  }
  
  return next();
});

// Compressão
app.use(compression());

// Logging simples
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware simples para tempo de resposta
app.use((req, res, next) => {
  const start = Date.now();
  
  // Interceptar apenas uma vez
  const originalSend = res.send;
  let intercepted = false;
  
  res.send = function(body: any) {
    if (!intercepted) {
      intercepted = true;
      const duration = Date.now() - start;
      if (!res.headersSent) {
        res.setHeader('X-Response-Time', `${duration}ms`);
      }
      
      // Log requisições lentas
      if (duration > 2000) {
        console.warn(`🐌 Slow request: ${req.method} ${req.originalUrl} took ${duration}ms`);
      }
    }
    return originalSend.call(this, body);
  };
  
  next();
});

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
app.use('/backend/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Portal Sabercon API Documentation',
  customfavIcon: '/favicon.ico',
}));

// Redirect /backend to /backend/docs
app.get('/backend', (_, res) => {
  res.redirect('/backend/docs');
});

// Mount API Routes
app.use('/api', apiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    path: req.originalUrl
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 Error occurred:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';
  
  if (!res.headersSent) {
    res.status(status).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
});

// Função para inicializar o servidor
async function startServer() {
  try {
    console.log('🚀 Iniciando Portal Sabercon Backend...');
    
    // Testa conexões
    console.log('📊 Testando conexões...');
    
    const redisConnected = await testRedisConnection();
    if (!redisConnected) {
      console.warn('⚠️  Redis não conectado - algumas funcionalidades podem não funcionar');
    }
    
    // Inicia o servidor
    app.listen(PORT, () => {
      console.log(`✅ Servidor rodando na porta ${PORT}`);
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📋 Health check: https://portal.sabercon.com.br/health`);
      console.log(`🔗 API: https://portal.sabercon.com.br/api`);
      console.log(`📚 Docs: https://portal.sabercon.com.br/backend/docs`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recebido, encerrando servidor...');
  process.exit(0);
});

// Inicia o servidor
if (require.main === module) {
  startServer();
}

export default app; 