/**
 * Script para gerar um token JWT válido para testes
 */

const jwt = require('jsonwebtoken');

// Usar o mesmo secret que está no código
const JWT_SECRET = 'SaberconPortal2025_SuperSecretKey_ProductionReady_XYZ789';

// Payload do token
const payload = {
  userId: 'test-user-123',
  email: 'admin@test.com',
  name: 'Admin Test',
  role: 'SYSTEM_ADMIN',
  permissions: ['READ_SYSTEM', 'WRITE_SYSTEM'],
  institutionId: 'test-institution',
  sessionId: 'test-session-123',
  type: 'access',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hora
};

try {
  const token = jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    issuer: 'portal.sabercon.com.br',
    audience: 'portal.sabercon.com.br'
  });
  
  console.log('✅ Token JWT válido gerado:');
  console.log(token);
  console.log('\n📋 Payload:');
  console.log(JSON.stringify(payload, null, 2));
  
  // Verificar se o token é válido
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('\n✅ Token verificado com sucesso:');
  console.log(JSON.stringify(decoded, null, 2));
  
} catch (error) {
  console.error('❌ Erro ao gerar/verificar token:', error);
}