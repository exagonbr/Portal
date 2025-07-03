/**
 * Teste completo de todos os endpoints que estavam retornando 401
 */

const BASE_URL = 'http://localhost:3000';
const VALID_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsIm5hbWUiOiJBZG1pbiBUZXN0Iiwicm9sZSI6IlNZU1RFTV9BRE1JTiIsInBlcm1pc3Npb25zIjpbIlJFQURfU1lTVEVNIiwiV1JJVEVfU1lTVEVNIl0sImluc3RpdHV0aW9uSWQiOiJ0ZXN0LWluc3RpdHV0aW9uIiwic2Vzc2lvbklkIjoidGVzdC1zZXNzaW9uLTEyMyIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NTE1MDk5OTYsImV4cCI6MTc1MTUxMzU5NiwiYXVkIjoicG9ydGFsLnNhYmVyY29uLmNvbS5iciIsImlzcyI6InBvcnRhbC5zYWJlcmNvbi5jb20uYnIifQ.wuOcbCfiN5lkOi_T4x_mXK3evlvXaZ_DkyV2IU5ePns';

async function testAllFailingEndpoints() {
  console.log('🔍 Testando todos os endpoints que estavam falhando...\n');
  
  // Endpoints que estavam retornando 401 nos logs
  const failingEndpoints = [
    '/api/dashboard/system',
    '/api/aws/connection-logs/stats',
    '/api/users/stats',
    '/api/dashboard/analytics',
    '/api/dashboard/engagement'
  ];
  
  console.log('📋 Testando com token JWT válido...');
  console.log('🔑 Token: ' + VALID_TOKEN.substring(0, 50) + '...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const endpoint of failingEndpoints) {
    try {
      console.log(`🔍 Testando: ${endpoint}`);
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${VALID_TOKEN}`,
          'Origin': 'http://localhost:3000'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`   ✅ Status ${response.status} - Sucesso!`);
        console.log(`   📊 Dados: ${data.success ? 'Válidos' : 'Inválidos'}`);
        successCount++;
      } else {
        console.log(`   ❌ Status ${response.status} - Falha!`);
        console.log(`   💬 Mensagem: ${data.message || 'Erro desconhecido'}`);
        failCount++;
      }
      
    } catch (error) {
      console.log(`   💥 Erro de rede: ${error.message}`);
      failCount++;
    }
    
    console.log(''); // Linha em branco
  }
  
  console.log('📊 RESUMO DOS TESTES:');
  console.log(`✅ Sucessos: ${successCount}/${failingEndpoints.length}`);
  console.log(`❌ Falhas: ${failCount}/${failingEndpoints.length}`);
  console.log(`📈 Taxa de sucesso: ${Math.round((successCount / failingEndpoints.length) * 100)}%`);
  
  if (successCount === failingEndpoints.length) {
    console.log('\n🎉 TODOS OS ENDPOINTS ESTÃO FUNCIONANDO!');
    console.log('✅ Problema de autenticação 401 resolvido!');
  } else {
    console.log('\n⚠️ Ainda há endpoints com problemas.');
    console.log('🔧 Verifique os logs acima para mais detalhes.');
  }
}

testAllFailingEndpoints();