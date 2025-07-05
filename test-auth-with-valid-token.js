/**
 * SCRIPT DE TESTE COM TOKEN JWT VÁLIDO
 */

const jwt = require('jsonwebtoken');

const BASE_URL = 'https://portal.sabercon.com.br';
const JWT_SECRET = 'SaberconPortal2025_SuperSecretKey_ProductionReady_XYZ789';

// Gerar um token JWT válido para teste
function generateTestToken() {
  const payload = {
    userId: 'test-user-123',
    email: 'admin@test.com',
    name: 'Admin Test',
    role: 'SYSTEM_ADMIN',
    permissions: ['ALL'],
    institutionId: 'test-institution',
    sessionId: 'test-session-123',
    type: 'access',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hora
  };

  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    issuer: 'portal.sabercon.com.br',
    audience: 'portal.sabercon.com.br'
  });
}

// Lista de endpoints para testar
const ENDPOINTS_TO_TEST = [
  { name: 'Users Stats', url: '/api/users/stats' },
  { name: 'AWS Connection Logs Stats', url: '/api/aws/connection-logs/stats' },
  { name: 'Dashboard Analytics', url: '/api/dashboard/analytics' },
  { name: 'Dashboard Engagement', url: '/api/dashboard/engagement' },
  { name: 'Dashboard System', url: '/api/dashboard/system' }
];

async function testEndpoint(endpoint, token) {
  try {
    console.log('📡 Testando: ' + endpoint.name);
    
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    };
    
    const response = await fetch(BASE_URL + endpoint.url, options);
    
    console.log('✅ ' + endpoint.name + ': ' + response.status + ' ' + response.statusText);
    
    if (response.status === 401) {
      console.log('   ❌ Ainda retornando 401 - problema na validação do token');
      
      // Tentar ver a resposta para debug
      try {
        const responseText = await response.text();
        console.log('   📄 Resposta:', responseText.substring(0, 200) + '...');
      } catch (e) {
        console.log('   📄 Não foi possível ler a resposta');
      }
    } else if (response.status === 200) {
      console.log('   ✅ Autenticação funcionando corretamente!');
    } else if (response.status === 403) {
      console.log('   ⚠️ Autenticado mas sem permissão (403) - normal para alguns roles');
    } else {
      console.log('   ⚠️ Status inesperado: ' + response.status);
    }
    
  } catch (error) {
    console.log('❌ ' + endpoint.name + ': Erro - ' + error.message);
  }
}

async function testAuthRefresh() {
  try {
    console.log('📡 Testando: Auth Refresh (sem token - deve funcionar)');
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    };
    
    const response = await fetch(BASE_URL + '/api/auth/refresh', options);
    
    console.log('✅ Auth Refresh: ' + response.status + ' ' + response.statusText);
    
    if (response.status === 401) {
      console.log('   ✅ 401 esperado - não há refresh token nos cookies');
    } else {
      console.log('   ⚠️ Status inesperado: ' + response.status);
    }
    
  } catch (error) {
    console.log('❌ Auth Refresh: Erro - ' + error.message);
  }
}

async function runTests() {
  console.log('🧪 TESTANDO COM TOKEN JWT VÁLIDO\n');
  
  // Gerar token válido
  const testToken = generateTestToken();
  console.log('🔑 Token gerado:', testToken.substring(0, 50) + '...\n');
  
  console.log('Iniciando testes dos endpoints...\n');
  
  for (const endpoint of ENDPOINTS_TO_TEST) {
    await testEndpoint(endpoint, testToken);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay de 1s entre testes
  }
  
  // Testar refresh separadamente
  await testAuthRefresh();
  
  console.log('\n🏁 Testes concluídos!');
  console.log('\n📝 ANÁLISE:');
  console.log('- Se ainda houver 401s, o problema está na validação do token');
  console.log('- Se houver 200s, a autenticação está funcionando');
  console.log('- Se houver 403s, a autenticação funciona mas falta permissão');
}

runTests().catch(console.error); 