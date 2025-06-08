const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Iniciando Portal Sabercon Backend (Versão Simplificada)...');

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
  ]
}));

// Compressão
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    message: 'Backend funcionando corretamente'
  });
});

// Middleware de autenticação simples
const simpleAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No authorization token provided'
    });
  }
  
  // Para teste, aceitar qualquer token que comece com 'Bearer '
  req.user = { userId: 'test-user', role: 'admin' };
  next();
};

// Rotas de Queue
app.get('/api/queue/next', simpleAuth, (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'No jobs available'
  });
});

app.get('/api/queue/stats', simpleAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      total: 0
    }
  });
});

// Rotas de Cache
app.get('/api/cache/get', simpleAuth, (req, res) => {
  const { key } = req.query;
  
  if (!key) {
    return res.status(400).json({
      success: false,
      message: 'Cache key is required'
    });
  }

  res.status(404).json({
    success: false,
    message: 'Cache key not found',
    exists: false
  });
});

app.post('/api/cache/set', simpleAuth, (req, res) => {
  const { key } = req.body;
  
  if (!key) {
    return res.status(400).json({
      success: false,
      message: 'Cache key is required'
    });
  }

  res.json({
    success: true,
    message: 'Value cached successfully'
  });
});

// Rotas de Usuários
app.get('/api/users', simpleAuth, (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Usuário Teste',
        email: 'teste@exemplo.com',
        role: 'admin'
      }
    ],
    total: 1
  });
});

app.get('/api/users/me', simpleAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user.userId,
      name: 'Usuário Teste',
      email: 'teste@exemplo.com',
      role: req.user.role
    }
  });
});

// Rotas de Instituições
app.get('/api/institutions', simpleAuth, (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Instituição Teste',
        code: 'INST001',
        type: 'UNIVERSITY',
        is_active: true
      }
    ],
    total: 1
  });
});

// Outras rotas da API retornam dados vazios mas válidos
const apiRoutes = [
  '/api/courses',
  '/api/modules',
  '/api/lessons',
  '/api/books',
  '/api/videos',
  '/api/roles',
  '/api/permissions',
  '/api/notifications',
  '/api/dashboard',
  '/api/settings'
];

apiRoutes.forEach(route => {
  app.get(route, simpleAuth, (req, res) => {
    res.json({
      success: true,
      data: [],
      total: 0,
      message: `${route} endpoint funcionando`
    });
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';
  
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log('');
  console.log('🎯 Endpoints disponíveis:');
  console.log('  - GET /health');
  console.log('  - GET /api/queue/next');
  console.log('  - GET /api/cache/get');
  console.log('  - GET /api/users');
  console.log('  - GET /api/institution');
  console.log('  - E muitos outros...');
  console.log('');
  console.log('🔑 Para testar com autenticação, use:');
  console.log('  Authorization: Bearer qualquer-token');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recebido, encerrando servidor...');
  process.exit(0);
}); 