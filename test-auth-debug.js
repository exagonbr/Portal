/**
 * Script de teste para diagnosticar problemas de autenticação
 * Execute com: node test-auth-debug.js
 */

const BASE_URL = 'http://localhost:3000';

async function testAuthEndpoints() {
  console.log('🔍 Iniciando diagnóstico de autenticação...\n');
  
  try {
    // 1. Testar endpoint de diagnóstico
    console.log('1. Testando endpoint de diagnóstico...');
    const diagnosisResponse = await fetch(`${BASE_URL}/api/debug/auth-diagnosis`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      }
    });
    
    const diagnosisData = await diagnosisResponse.json();
    console.log('📊 Resultado do diagnóstico:', JSON.stringify(diagnosisData, null, 2));
    console.log('\n');
    
    // 2. Testar endpoints que estão falhando SEM autenticação
    const failingEndpoints = [
      '/api/dashboard/system',
      '/api/aws/connection-logs/stats',
      '/api/users/stats',
      '/api/dashboard/analytics',
      '/api/dashboard/engagement'
    ];
    
    console.log('2. Testando endpoints que estão falhando SEM autenticação...');
    for (const endpoint of failingEndpoints) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:3000'
          }
        });
        
        const data = await response.json();
        console.log(`📍 ${endpoint}: Status ${response.status}`);
        console.log(`   Resposta: ${JSON.stringify(data).substring(0, 100)}...`);
      } catch (error) {
        console.log(`❌ ${endpoint}: Erro - ${error.message}`);
      }
    }
    console.log('\n');
    
    // 3. Testar com token de exemplo (simulando frontend)
    console.log('3. Testando com token de exemplo...');
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwicm9sZSI6IlNZU1RFTV9BRE1JTiIsInBlcm1pc3Npb25zIjpbXSwiaW5zdGl0dXRpb25JZCI6InRlc3QtaW5zdGl0dXRpb24iLCJzZXNzaW9uSWQiOiJ0ZXN0LXNlc3Npb24iLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzM1ODYwMDAwLCJleHAiOjE3MzU4NjM2MDB9.invalid-signature';
    
    for (const endpoint of failingEndpoints.slice(0, 2)) { // Testar apenas 2 para não sobrecarregar
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testToken}`,
            'Origin': 'http://localhost:3000'
          }
        });
        
        const data = await response.json();
        console.log(`📍 ${endpoint} (com token): Status ${response.status}`);
        console.log(`   Resposta: ${JSON.stringify(data).substring(0, 100)}...`);
      } catch (error) {
        console.log(`❌ ${endpoint} (com token): Erro - ${error.message}`);
      }
    }
    
    console.log('\n✅ Diagnóstico concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error);
  }
}

// Executar o teste
testAuthEndpoints();