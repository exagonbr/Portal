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

// Helper function to parse cookies
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  
  return cookies;
}

// Middleware de autenticação simples
const simpleAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = '';
  
  // Try to get token from Authorization header
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Try to get token from cookies
    const cookies = parseCookies(req.headers.cookie || '');
    token = cookies.portal_token || cookies.auth_token || cookies.authToken || cookies.token || '';
  }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No authorization token provided'
    });
  }
  
  console.log('Token recebido:', token);
  
  // Para tokens base64 (fallback), decodificar e validar
  try {
    // Verificar se é um token base64 simples (admin:admin, gestor:gestor, etc.)
    if (token === 'YWRtaW46YWRtaW4=' || token === 'Z2VzdG9yOmdlc3Rvcg==' || token === 'cHJvZmVzc29yOnByb2Zlc3Nvcg==') {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [username, password] = decoded.split(':');
      
      req.user = { 
        userId: username, 
        role: username,
        email: `${username}@test.com`,
        name: username.charAt(0).toUpperCase() + username.slice(1)
      };
      return next();
    }
    
    // Para tokens mais complexos, tentar decodificar JSON
    if (token.length > 100) {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const tokenData = JSON.parse(decoded);
      
      if (tokenData.userId && tokenData.role) {
        req.user = { 
          userId: tokenData.userId, 
          role: tokenData.role,
          email: tokenData.email,
          name: tokenData.name
        };
        return next();
      }
    }
  } catch (e) {
    // Se falhar na decodificação, tentar como token simples
  }
  
  // Para teste, aceitar qualquer token que não seja vazio como válido
  req.user = { userId: 'user', role: 'user' };
  next();
};

// Rotas de Queue - endpoint /next removido (não necessário)

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

// Rota específica para escolas com dados mock
app.get('/api/schools', simpleAuth, (req, res) => {
  const schools = [
    {
      id: 'school_1',
      name: 'Escola Estadual Dom Pedro II',
      code: 'EEDP2',
      institution_id: 'inst_sabercon',
      type: 'PUBLIC',
      description: 'Escola pública de ensino fundamental e médio',
      phone: '(11) 3456-7890',
      email: 'contato@eedp2.edu.br',
      is_active: true,
      students_count: 450,
      teachers_count: 32,
      classes_count: 18,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2025-06-16T21:00:00Z'
    },
    {
      id: 'school_2',
      name: 'Colégio Particular Santa Clara',
      code: 'CPSC',
      institution_id: 'inst_sabercon',
      type: 'PRIVATE',
      description: 'Colégio particular de ensino integral',
      phone: '(11) 9876-5432',
      email: 'secretaria@santaclara.edu.br',
      is_active: true,
      students_count: 280,
      teachers_count: 25,
      classes_count: 12,
      created_at: '2024-02-01T10:00:00Z',
      updated_at: '2025-06-16T21:00:00Z'
    },
    {
      id: 'school_3',
      name: 'Centro de Educação Técnica',
      code: 'CET',
      institution_id: 'inst_ifsp',
      type: 'PUBLIC',
      description: 'Centro de educação técnica e profissionalizante',
      phone: '(19) 3234-5678',
      email: 'contato@cet.edu.br',
      is_active: true,
      students_count: 600,
      teachers_count: 45,
      classes_count: 24,
      created_at: '2024-03-01T10:00:00Z',
      updated_at: '2025-06-16T21:00:00Z'
    }
  ];

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedSchools = schools.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      items: paginatedSchools,
      pagination: {
        total: schools.length,
        page,
        limit,
        totalPages: Math.ceil(schools.length / limit)
      }
    }
  });
});

// Rota específica de notificações
app.post('/api/notifications/send', simpleAuth, (req, res) => {
  const {
    title,
    message,
    type = 'info',
    category = 'system',
    recipients = {},
    sendPush = true,
    sendEmail = false,
    priority = 'medium'
  } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      success: false,
      message: 'Title and message are required'
    });
  }

  // Simular o envio de notificações
  const pushSentCount = sendPush && recipients.userIds ? recipients.userIds.length : 0;
  const emailSentCount = sendEmail && recipients.emails ? recipients.emails.length : 0;

  res.json({
    success: true,
    message: 'Notification sent successfully',
    data: {
      pushSentCount,
      emailSentCount,
      totalRecipients: (recipients.userIds?.length || 0) + (recipients.emails?.length || 0)
    }
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
  console.log(`📋 Health check: https://portal.sabercon.com.br/health`);
  console.log(`🔗 API: https://portal.sabercon.com.br/api`);
  console.log('');
  console.log('🎯 Endpoints disponíveis:');
  console.log('  - GET /health');
  // - GET /api/queue/next (removido)
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