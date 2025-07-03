/**
 * SCRIPT DE TESTE PARA VERIFICAR AS CORREÇÕES DE AUTENTICAÇÃO
 */

const BASE_URL = 'https://portal.sabercon.com.br';

// Lista de endpoints para testar
const ENDPOINTS_TO_TEST = [
  { name: 'Users Stats', url: '/api/users/stats' },
  { name: 'AWS Connection Logs Stats', url: '/api/aws/connection-logs/stats' },
  { name: 'Dashboard Analytics', url: '/api/dashboard/analytics' },
  { name: 'Dashboard Engagement', url: '/api/dashboard/engagement' },
  { name: 'Dashboard System', url: '/api/dashboard/system' },
  { name: 'Auth Refresh', url: '/api/auth/refresh', method: 'POST' }
];

async function testEndpoint(endpoint) {
  try {
    console.log('📡 Testando: ' + endpoint.name);
    
    const method = endpoint.method || 'GET';
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-for-validation'
      }
    };
    
    if (method === 'POST') {
      options.body = JSON.stringify({});
    }
    
    const response = await fetch(BASE_URL + endpoint.url, options);
    
    console.log('✅ ' + endpoint.name + ': ' + response.status + ' ' + response.statusText);
    
    if (response.status === 401) {
      console.log('   ❌ Ainda retornando 401 - precisa de mais ajustes');
    } else if (response.status === 200 || response.status === 403) {
      console.log('   ✅ Autenticação funcionando (200/403 esperado)');
    }
    
  } catch (error) {
    console.log('❌ ' + endpoint.name + ': Erro - ' + error.message);
  }
}

async function runTests() {
  console.log('🧪 TESTANDO CORREÇÕES DE AUTENTICAÇÃO\n');
  console.log('Iniciando testes dos endpoints...\n');
  
  for (const endpoint of ENDPOINTS_TO_TEST) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay de 1s entre testes
  }
  
  console.log('\n🏁 Testes concluídos!');
  console.log('\n📝 PRÓXIMOS PASSOS:');
  console.log('1. Verificar se os endpoints não retornam mais 401');
  console.log('2. Testar com tokens reais no navegador');
  console.log('3. Verificar logs do servidor para erros');
}

runTests().catch(console.error); 