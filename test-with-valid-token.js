/**
 * Teste com token JWT válido
 */

const BASE_URL = 'http://localhost:3000';
const VALID_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsIm5hbWUiOiJBZG1pbiBUZXN0Iiwicm9sZSI6IlNZU1RFTV9BRE1JTiIsInBlcm1pc3Npb25zIjpbIlJFQURfU1lTVEVNIiwiV1JJVEVfU1lTVEVNIl0sImluc3RpdHV0aW9uSWQiOiJ0ZXN0LWluc3RpdHV0aW9uIiwic2Vzc2lvbklkIjoidGVzdC1zZXNzaW9uLTEyMyIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NTE1MDk5OTYsImV4cCI6MTc1MTUxMzU5NiwiYXVkIjoicG9ydGFsLnNhYmVyY29uLmNvbS5iciIsImlzcyI6InBvcnRhbC5zYWJlcmNvbi5jb20uYnIifQ.wuOcbCfiN5lkOi_T4x_mXK3evlvXaZ_DkyV2IU5ePns';

async function testWithValidToken() {
  console.log('🔍 Testando com token JWT válido...\n');
  
  // 1. Testar diagnóstico com token
  console.log('1. Testando diagnóstico com token válido...');
  try {
    const response = await fetch(`${BASE_URL}/api/debug/auth-diagnosis`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VALID_TOKEN}`,
        'Origin': 'http://localhost:3000'
      }
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Autenticado: ${data.diagnosis?.authenticationResult?.authenticated}`);
    console.log(`Usuário: ${data.diagnosis?.authenticationResult?.user?.email}`);
    console.log(`Role: ${data.diagnosis?.authenticationResult?.user?.role}\n`);
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error.message);
  }
  
  // 2. Testar endpoints que estavam falhando
  const endpoints = [
    '/api/dashboard/system',
    '/api/dashboard/analytics',
    '/api/users/stats'
  ];
  
  console.log('2. Testando endpoints com token válido...');
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${VALID_TOKEN}`,
          'Origin': 'http://localhost:3000'
        }
      });
      
      const data = await response.json();
      console.log(`📍 ${endpoint}: Status ${response.status}`);
      
      if (response.ok) {
        console.log(`   ✅ Sucesso! Dados recebidos.`);
      } else {
        console.log(`   ❌ Falha: ${data.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Erro - ${error.message}`);
    }
  }
  
  console.log('\n✅ Teste concluído!');
}

testWithValidToken();