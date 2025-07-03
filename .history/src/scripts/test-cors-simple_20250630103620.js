#!/usr/bin/env node

const BASE_URL = 'https://portal.sabercon.com.br';

async function testCorsEndpoint(endpoint, method = 'OPTIONS', origin = null) {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (origin) {
      headers['Origin'] = origin;
    }

    const response = await fetch(url, {
      method,
      headers,
    });

    const corsHeaders = {
      allowOrigin: response.headers.get('Access-Control-Allow-Origin'),
      allowMethods: response.headers.get('Access-Control-Allow-Methods'),
      allowHeaders: response.headers.get('Access-Control-Allow-Headers'),
    };

    return {
      url,
      method,
      status: response.status,
      corsHeaders,
      success: response.status < 400 && !!corsHeaders.allowOrigin,
    };
  } catch (error) {
    return {
      url,
      method,
      status: 0,
      corsHeaders: {},
      success: false,
      error: error.message,
    };
  }
}

async function runTests() {
  console.log('🧪 Testando CORS para rota AWS que estava falhando...\n');
  console.log(`🔗 URL Base: ${BASE_URL}\n`);
  
  console.log('════════════════════════════════════════════════════════════');
  console.log('🧪 TESTE COMPLETO DE CORS - ROTAS AWS (APÓS CORREÇÕES)');
  console.log('════════════════════════════════════════════════════════════\n');

  // 1. Teste de preflight na rota problemática
  console.log('1. 🔍 Testando preflight (OPTIONS) em /api/aws/connection-logs/stats...');
  const preflightResult = await testCorsEndpoint('/api/aws/connection-logs/stats', 'OPTIONS');
  
  console.log(`   Status: ${preflightResult.status}`);
  console.log(`   Access-Control-Allow-Origin: ${preflightResult.corsHeaders.allowOrigin || 'NÃO DEFINIDO'}`);
  console.log(`   Access-Control-Allow-Methods: ${preflightResult.corsHeaders.allowMethods || 'NÃO DEFINIDO'}`);
  console.log(`   Access-Control-Allow-Headers: ${preflightResult.corsHeaders.allowHeaders || 'NÃO DEFINIDO'}`);
  
  if (preflightResult.success) {
    console.log('   ✅ PREFLIGHT FUNCIONANDO - Status 200 com headers CORS');
  } else {
    console.log(`   ❌ PREFLIGHT FALHOU - Status ${preflightResult.status}`);
  }
  console.log('');

  // 2. Teste com diferentes origens
  console.log('2. 🌍 Testando diferentes origens na rota AWS...');
  const origins = [
    'https://portal.sabercon.com.br',
    'http://localhost:3000',
    'https://localhost:3000',
    'https://example.com'
  ];

  for (const origin of origins) {
    const result = await testCorsEndpoint('/api/aws/connection-logs/stats', 'OPTIONS', origin);
    const status = result.corsHeaders.allowOrigin ? '✅' : '❌';
    const headerInfo = result.corsHeaders.allowOrigin ? 'PERMITIDO' : 'BLOQUEADO (sem header)';
    console.log(`   ${status} ${origin} - ${headerInfo}`);
  }
  console.log('');

  // 3. Teste de outras rotas AWS
  console.log('3. 🔧 Testando outras rotas AWS...');
  const awsRoutes = [
    '/api/aws/settings',
    '/api/aws/connection-logs',
    '/api/aws/test'
  ];

  for (const route of awsRoutes) {
    const result = await testCorsEndpoint(route, 'OPTIONS');
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${route} - Status ${result.status}`);
  }
  console.log('');

  // 4. Teste de requisição real (sem token)
  console.log('4. 🎯 Simulando requisição real (sem token válido)...');
  const realRequest = await testCorsEndpoint('/api/aws/connection-logs/stats', 'GET');
  console.log(`   Status: ${realRequest.status}`);
  console.log(`   Access-Control-Allow-Origin: ${realRequest.corsHeaders.allowOrigin || 'NÃO DEFINIDO'}`);
  
  if (realRequest.status === 401 && realRequest.corsHeaders.allowOrigin) {
    console.log('   ✅ Status 401 esperado COM headers CORS');
  } else if (realRequest.status === 200 && realRequest.corsHeaders.allowOrigin) {
    console.log('   ✅ Status 200 com headers CORS (funcionando)');
  } else {
    console.log(`   ℹ️  Status inesperado: ${realRequest.status}`);
  }
  console.log('');

  console.log('════════════════════════════════════════════════════════════');
  console.log('✅ Testes concluídos!\n');
  
  console.log('📋 Resumo esperado:');
  console.log('   - Todas as rotas devem responder ao OPTIONS');
  console.log('   - Headers Access-Control-Allow-Origin devem estar presentes');
  console.log('   - Origin * ou específica deve ser permitida');
  console.log('   - Status 200/204 para OPTIONS, 401 para GET sem auth');
  console.log('════════════════════════════════════════════════════════════');
}

// Executar testes
runTests().catch(console.error); 