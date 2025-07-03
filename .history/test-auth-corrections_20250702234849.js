const fetch = require('node-fetch');

// Configuração
const API_URL = 'http://localhost:3000';
const endpoints = [
  '/api/dashboard/system',
  '/api/dashboard/analytics',
  '/api/dashboard/engagement',
  '/api/aws/connection-logs/stats',
  '/api/users/stats'
];

// Token de teste (substitua com um token válido)
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzU0YjJmNGJjNGJjNGJjNGJjNGJjNGIiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJyb2xlIjoiU1lTVEVNX0FETUlOIiwiaW5zdGl0dXRpb25JZCI6bnVsbCwicGVybWlzc2lvbnMiOltdLCJpYXQiOjE3MzU4NzY4MDAsImV4cCI6MTczNTk2MzIwMH0.test';

async function testEndpoint(endpoint) {
  console.log(`\n🔍 Testando ${endpoint}...`);
  
  try {
    // Teste sem autenticação (deve retornar 401)
    console.log('  1️⃣ Teste sem autenticação:');
    const responseNoAuth = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log(`     Status: ${responseNoAuth.status} ${responseNoAuth.statusText}`);
    
    // Teste com autenticação
    console.log('  2️⃣ Teste com autenticação:');
    const responseWithAuth = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    console.log(`     Status: ${responseWithAuth.status} ${responseWithAuth.statusText}`);
    
    if (responseWithAuth.ok) {
      const data = await responseWithAuth.json();
      console.log(`     ✅ Sucesso! Dados recebidos:`, Object.keys(data).slice(0, 3).join(', '), '...');
    } else {
      const error = await responseWithAuth.text();
      console.log(`     ❌ Erro:`, error.substring(0, 100));
    }
    
    // Teste com token inválido
    console.log('  3️⃣ Teste com token inválido:');
    const responseInvalidToken = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      }
    });
    console.log(`     Status: ${responseInvalidToken.status} ${responseInvalidToken.statusText}`);
    
  } catch (error) {
    console.error(`  ❌ Erro ao testar endpoint:`, error.message);
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes de autenticação nos endpoints...');
  console.log('================================================');
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
  
  console.log('\n✅ Testes concluídos!');
  console.log('\n📝 Resumo:');
  console.log('- Endpoints sem autenticação devem retornar 401');
  console.log('- Endpoints com token válido devem retornar 200 ou 403 (dependendo das permissões)');
  console.log('- Endpoints com token inválido devem retornar 401');
}

// Executar testes
runTests().catch(console.error);