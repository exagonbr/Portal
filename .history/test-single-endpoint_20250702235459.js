const fetch = require('node-fetch');

// Token válido gerado anteriormente
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzVlNGIyZjRiYzRiYzRiYzRiYzRiYzRiIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsIm5hbWUiOiJBZG1pbmlzdHJhZG9yIGRlIFRlc3RlIiwicm9sZSI6IlNZU1RFTV9BRE1JTiIsInBlcm1pc3Npb25zIjpbXSwiaW5zdGl0dXRpb25JZCI6bnVsbCwic2Vzc2lvbklkIjoidGVzdC1zZXNzaW9uLTE3NTE1MTExMDkwOTYiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzUxNTExMTA5LCJleHAiOjE3NTE1MTQ3MDl9.q1HP67t7Nc5CXE7t_g496FUty9KMWesFOBX4Rl_dZh0';

async function testEndpoint(endpoint) {
  console.log(`\n🔍 Testando ${endpoint}...`);
  
  try {
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Sucesso! Resposta:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Erro:', error);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

// Testar apenas um endpoint por vez
async function runTest() {
  console.log('🚀 Teste de endpoint único\n');
  
  // Testar cada endpoint individualmente
  await testEndpoint('/api/dashboard/system');
  
  console.log('\n✅ Teste concluído!');
}

runTest().catch(console.error);