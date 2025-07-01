const express = require('express');

const app = express();
app.use(express.json());

// Middleware de log
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota de teste simples
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando' });
});

// Rota de teste para coleções
app.post('/api/collections/manage', (req, res) => {
  console.log('Recebida requisição para criar coleção:', req.body);
  
  try {
    // Simular criação de coleção sem TypeORM
    const collection = {
      id: 'test-' + Date.now(),
      name: req.body.name,
      synopsis: req.body.synopsis,
      authors: req.body.authors || [],
      target_audience: req.body.target_audience || [],
      created_at: new Date()
    };
    
    console.log('Coleção criada com sucesso:', collection);
    res.status(201).json({
      success: true,
      data: collection,
      message: 'Coleção criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar coleção:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

const PORT = 3001;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📋 Health check: https://portal.sabercon.com.br/health`);
  console.log(`🔗 API: https://portal.sabercon.com.br/api/collections/manage`);
});

// Tratamento de erros
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada não tratada:', reason);
}); 