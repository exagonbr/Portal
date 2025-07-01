#!/usr/bin/env node

const BASE_URL = 'https://portal.sabercon.com.br/api';

// Lista de APIs para testar
const APIs_TO_TEST = [
  {
    url: '/api/institutions?page=1&limit=10',
    method: 'GET',
    description: 'API de Instituições',
    requiresAuth: true
  },
  {
    url: '/api/dashboard/metrics/realtime',
    method: 'GET',
    description: 'Métricas em Tempo Real',
    requiresAuth: true
  },
  {
    url: '/api/dashboard/engagement',
    method: 'GET',
    description: 'Métricas de Engajamento',
    requiresAuth: true
  },
  {
    url: '/api/dashboard/analytics',
    method: 'GET',
    description: 'Analytics do Dashboard',
    requiresAuth: true
  },
  {
    url: '/api/users/stats',
    method: 'GET',
    description: 'Estatísticas de Usuários',
    requiresAuth: true
  },
  {
    url: '/api/dashboard/system',
    method: 'GET',
    description: 'Dashboard do Sistema',
    requiresAuth: true
  },
  {
    url: '/api/dashboard/summary',
    method: 'GET',
    description: 'Resumo do Dashboard',
    requiresAuth: true
  },
  {
    url: '/api/dashboard/health',
    method: 'GET',
    description: 'Status de Saúde do Sistema',
    requiresAuth: true
  }
];

// Token de teste (você pode substituir por um token válido)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LWFkbWluIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsIm5hbWUiOiJUZXN0IEFkbWluIiwicm9sZSI6IlNZU1RFTV9BRE1JTiIsImluc3RpdHV0aW9uSWQiOiJ0ZXN0LWluc3RpdHV0aW9uIiwiaWF0IjoxNjkwMDAwMDAwLCJleHAiOjE3MjAwMDAwMDB9.test-signature';

async function testAPI(api) {
  const url = `${BASE_URL}${api.url}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (api.requiresAuth) {
    headers['Authorization'] = `Bearer ${TEST_TOKEN}`;
  }
  
  try {
    console.log(`\n🧪 Testando: ${api.description}`);
    console.log(`📍 URL: ${url}`);
    
    const response = await fetch(url, {
      method: api.method,
      headers
    });
    
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      data = { message: responseText };
    }
    
    if (response.ok) {
      console.log(`✅ Status: ${response.status} - OK`);
      console.log(`📊 Dados: ${data.success ? 'Sucesso' : 'Resposta válida'}`);
      
      if (data.message) {
        console.log(`💬 Mensagem: ${data.message}`);
      }
      
      return { success: true, status: response.status, data };
    } else {
      console.log(`❌ Status: ${response.status} - ${response.statusText}`);
      console.log(`💬 Erro: ${data.message || 'Erro desconhecido'}`);
      
      return { success: false, status: response.status, error: data.message };
    }
  } catch (error) {
    console.log(`💥 Erro de conexão: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes das APIs corrigidas...\n');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const api of APIs_TO_TEST) {
    const result = await testAPI(api);
    results.push({
      api: api.description,
      url: api.url,
      ...result
    });
    
    // Pequena pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Resumo dos resultados
  console.log('\n' + '='.repeat(60));
  console.log('📋 RESUMO DOS TESTES');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✅ APIs funcionando: ${successful.length}/${results.length}`);
  console.log(`❌ APIs com problema: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n🎉 APIs FUNCIONANDO:');
    successful.forEach(result => {
      console.log(`  ✅ ${result.api} (${result.status || 'OK'})`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n🚨 APIs COM PROBLEMAS:');
    failed.forEach(result => {
      console.log(`  ❌ ${result.api} - ${result.error || 'Status ' + result.status}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Testes concluídos!');
  
  if (failed.length === 0) {
    console.log('🎊 Todas as APIs estão funcionando corretamente!');
  } else {
    console.log(`⚠️  Ainda há ${failed.length} API(s) com problema(s).`);
  }
}

// Executar testes
if (require.main === module) {
  runTests().catch(console.log);
}

module.exports = { testAPI, runTests }; 