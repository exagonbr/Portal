const jwt = require('jsonwebtoken');
require('dotenv').config();

// Gerar token JWT
const secret = process.env.JWT_SECRET || 'fallback-secret';
const token = jwt.sign({
  userId: 1,
  id: 1,
  email: 'admin@test.com',
  role: 'admin',
  name: 'Admin Test',
  permissions: ['admin'],
  institutionId: 1,
  sessionId: 'test-session'
}, secret, { expiresIn: '1h' });

console.log('🔑 Token JWT gerado:', token);

// Testar API
const testAPI = async () => {
  try {
    const response = await fetch('https://portal.sabercon.com.br/api/certificates?page=1&limit=10', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log('📊 Status:', response.status);
    console.log('📋 Resposta:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
};

testAPI();