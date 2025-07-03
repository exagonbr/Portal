const jwt = require('jsonwebtoken');

// Configuração - usando a chave do JWT_CONFIG
const JWT_SECRET = 'SaberconPortal2025_SuperSecretKey_ProductionReady_XYZ789';

// Criar um token válido para testes
function generateTestToken(role = 'SYSTEM_ADMIN') {
  const payload = {
    userId: '675e4b2f4bc4bc4bc4bc4bc4b',
    email: 'admin@example.com',
    name: 'Administrador de Teste',
    role: role,
    permissions: [],
    institutionId: role === 'SYSTEM_ADMIN' ? null : '675e4b2f4bc4bc4bc4bc4bc4c',
    sessionId: 'test-session-' + Date.now(),
    type: 'access',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hora
  };

  const token = jwt.sign(payload, JWT_SECRET);
  
  console.log('🔑 Token JWT gerado com sucesso!\n');
  console.log('Payload:', JSON.stringify(payload, null, 2));
  console.log('\nToken:');
  console.log(token);
  console.log('\nUse este token no script de teste ou nas requisições HTTP.');
  console.log('\nExemplo de uso:');
  console.log(`Authorization: Bearer ${token}`);
  
  return token;
}

// Gerar tokens para diferentes roles
console.log('=== GERANDO TOKENS DE TESTE ===\n');

console.log('1. Token SYSTEM_ADMIN:');
const adminToken = generateTestToken('SYSTEM_ADMIN');

console.log('\n\n2. Token INSTITUTION_MANAGER:');
const managerToken = generateTestToken('INSTITUTION_MANAGER');

console.log('\n\n3. Token TEACHER:');
const teacherToken = generateTestToken('TEACHER');

console.log('\n\n4. Token STUDENT:');
const studentToken = generateTestToken('STUDENT');

// Salvar o token admin em um arquivo para facilitar o uso
const fs = require('fs');
fs.writeFileSync('test-token.txt', adminToken);
console.log('\n\n✅ Token SYSTEM_ADMIN salvo em test-token.txt');