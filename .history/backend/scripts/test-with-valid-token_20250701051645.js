const jwt = require('jsonwebtoken');
const http = require('http');

// Criar um token válido usando a mesma chave secreta do servidor
const JWT_SECRET = process.env.JWT_SECRET || 'ExagonTech';

const payload = {
  userId: 'admin', // Usar um dos IDs fallback que o middleware reconhece
  email: 'admin@test.com',
  name: 'Admin Test',
  role: 'SYSTEM_ADMIN',
  institutionId: 'test-institution-id',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hora
};

const token = jwt.sign(payload, JWT_SECRET);

console.log('🔑 Token gerado:', token.substring(0, 50) + '...');

const data = JSON.stringify({
  name: "Coleção Teste com Token Válido",
  synopsis: "Teste com token JWT válido",
  authors: "{\"Autor Teste\"}", // Formato PostgreSQL para array
  target_audience: "{\"Estudantes\"}", // Formato PostgreSQL para array  
  producer: "Editora Teste",
  release_date: "2024-01-01",
  contract_end_date: "2025-12-31"
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/collections/manage',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('📡 Enviando requisição para criar coleção...');

const req = http.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response body:', body);
    
    if (res.statusCode === 201) {
      console.log('✅ Coleção criada com sucesso!');
    } else if (res.statusCode === 401) {
      console.log('❌ Erro de autenticação');
    } else if (res.statusCode === 500) {
      console.log('❌ Erro interno do servidor');
    } else {
      console.log(`❓ Status inesperado: ${res.statusCode}`);
    }
    
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.log(`❌ Erro na requisição: ${e.message}`);
  process.exit(1);
});

req.write(data);
req.end(); 