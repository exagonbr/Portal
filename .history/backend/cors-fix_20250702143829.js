const express = require('express');
const cors = require('cors');
const app = express();

// Configuração de CORS mais permissiva para resolver o erro
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir todas as origens em desenvolvimento
    console.log('🌐 Origem da requisição:', origin || 'sem origem');
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-CSRF-Token',
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
    'Access-Control-Allow-Credentials'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

// Aplicar CORS
app.use(cors(corsOptions));

// Middleware adicional para garantir headers CORS em todas as respostas
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Definir headers CORS manualmente para garantir compatibilidade
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept, Origin, Cache-Control, X-CSRF-Token');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Responder imediatamente a requisições OPTIONS
  if (req.method === 'OPTIONS') {
    console.log('✅ Respondendo a requisição OPTIONS (preflight)');
    return res.status(200).end();
  }
  
  console.log(`📝 ${req.method} ${req.url} - Origem: ${origin || 'não informada'}`);
  next();
});

// Middleware para parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de teste para login
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Tentativa de login recebida');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  // Simular resposta de login
  res.json({
    success: true,
    message: 'CORS funcionando! Login simulado.',
    data: {
      token: 'test-token-123',
      user: { id: 1, name: 'Usuário Teste' }
    }
  });
});

// Rota de teste geral
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS está funcionando!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

// Rota para verificar status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    cors: 'configurado',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('🚀 Servidor de teste CORS iniciado!');
  console.log(`📡 Rodando em: http://localhost:${PORT}`);
  console.log('');
  console.log('📋 Rotas disponíveis:');
  console.log(`   GET  http://localhost:${PORT}/api/test`);
  console.log(`   GET  http://localhost:${PORT}/api/status`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log('');
  console.log('🧪 Para testar CORS, faça uma requisição de outro domínio/porta');
  console.log('');
});

// Tratamento de erros
app.use((error, req, res, next) => {
  console.error('❌ Erro:', error.message);
  res.status(500).json({
    success: false,
    error: error.message,
    cors: 'ativo'
  });
}); 