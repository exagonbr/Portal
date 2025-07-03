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

// Testar API do frontend (Next.js)
const testFrontendAPI = async () => {
  try {
    console.log('\n🧪 Testando API do Frontend (Next.js)...');
    const response = await fetch('https://portal.sabercon.com.br/api/certificates?page=1&limit=10', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log('📊 Status Frontend:', response.status);
    console.log('📋 Resposta Frontend:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Erro Frontend:', error.message);
  }
};

testFrontendAPI();