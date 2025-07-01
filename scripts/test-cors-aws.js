#!/usr/bin/env node

/**
 * Script para testar CORS especificamente na rota AWS que estava falhando
 * Testa a rota: /api/aws/connection-logs/stats
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_URL || 'https://portal.sabercon.com.br';

console.log('🧪 Testando CORS para rota AWS que estava falhando...\n');
console.log(`🔗 URL Base: ${BASE_URL}\n`);

// Função para fazer requisição HTTP/HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'OPTIONS',
      headers: {
        'Origin': 'https://portal.sabercon.com.br',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
        ...options.headers
      },
      // Ignorar certificados SSL auto-assinados em desenvolvimento
      rejectUnauthorized: false
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data
        });
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Teste 1: Verificar preflight (OPTIONS) na rota específica
async function testAwsStatsPreflight() {
  console.log('1. 🔍 Testando preflight (OPTIONS) em /api/aws/connection-logs/stats...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/aws/connection-logs/stats`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://portal.sabercon.com.br',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin'] || 'NÃO DEFINIDO'}`);
    console.log(`   Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods'] || 'NÃO DEFINIDO'}`);
    console.log(`   Access-Control-Allow-Headers: ${response.headers['access-control-allow-headers'] || 'NÃO DEFINIDO'}`);
    
    if (response.status === 200 || response.status === 204) {
      if (response.headers['access-control-allow-origin']) {
        console.log('   ✅ PREFLIGHT OK - CORS configurado corretamente');
      } else {
        console.log('   ❌ PREFLIGHT FALHOU - Headers CORS ausentes');
      }
    } else {
      console.log(`   ❌ PREFLIGHT FALHOU - Status ${response.status}`);
    }
    
  } catch (error) {
    console.log(`   ❌ ERRO: ${error.message}`);
  }
  
  console.log('');
}

// Teste 2: Verificar diferentes origens
async function testDifferentOrigins() {
  console.log('2. 🌍 Testando diferentes origens na rota AWS...');
  
  const testOrigins = [
    'https://portal.sabercon.com.br',
    'https://portal.sabercon.com.br',
    'https://portal.sabercon.com.br',
    'https://example.com'
  ];
  
  for (const origin of testOrigins) {
    try {
      const response = await makeRequest(`${BASE_URL}/api/aws/connection-logs/stats`, {
        method: 'OPTIONS',
        headers: { 'Origin': origin }
      });
      
      const allowedOrigin = response.headers['access-control-allow-origin'];
      if (allowedOrigin === '*' || allowedOrigin === origin) {
        console.log(`   ✅ ${origin} - PERMITIDO (${allowedOrigin})`);
      } else {
        console.log(`   ❌ ${origin} - BLOQUEADO (${allowedOrigin || 'sem header'})`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${origin} - ERRO: ${error.message}`);
    }
  }
  
  console.log('');
}

// Teste 3: Verificar outras rotas AWS
async function testOtherAwsRoutes() {
  console.log('3. 🔧 Testando outras rotas AWS...');
  
  const awsRoutes = [
    '/api/aws/settings',
    '/api/aws/connection-logs',
    '/api/aws/test'
  ];
  
  for (const route of awsRoutes) {
    try {
      const response = await makeRequest(`${BASE_URL}${route}`, {
        method: 'OPTIONS',
        headers: { 'Origin': 'https://portal.sabercon.com.br' }
      });
      
      const allowedOrigin = response.headers['access-control-allow-origin'];
      if (response.status === 200 || response.status === 204) {
        if (allowedOrigin) {
          console.log(`   ✅ ${route} - CORS OK (${allowedOrigin})`);
        } else {
          console.log(`   ⚠️  ${route} - Status OK mas sem CORS headers`);
        }
      } else {
        console.log(`   ❌ ${route} - Status ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${route} - ERRO: ${error.message}`);
    }
  }
  
  console.log('');
}

// Teste 4: Simular requisição real com Authorization
async function testRealRequest() {
  console.log('4. 🎯 Simulando requisição real (sem token válido)...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/aws/connection-logs/stats`, {
      method: 'GET',
      headers: {
        'Origin': 'https://portal.sabercon.com.br',
        'Authorization': 'Bearer fake-token-for-testing',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin'] || 'NÃO DEFINIDO'}`);
    
    // Esperamos 401 (não autorizado) mas com headers CORS
    if (response.status === 401) {
      if (response.headers['access-control-allow-origin']) {
        console.log('   ✅ CORS funcionando - Recebeu 401 com headers CORS');
      } else {
        console.log('   ❌ CORS ausente - Recebeu 401 sem headers CORS');
      }
    } else {
      console.log(`   ℹ️  Status inesperado: ${response.status}`);
    }
    
  } catch (error) {
    console.log(`   ❌ ERRO: ${error.message}`);
  }
  
  console.log('');
}

// Executar todos os testes
async function runAllTests() {
  console.log('═'.repeat(60));
  console.log('🧪 TESTE COMPLETO DE CORS - ROTAS AWS');
  console.log('═'.repeat(60));
  console.log('');
  
  await testAwsStatsPreflight();
  await testDifferentOrigins();
  await testOtherAwsRoutes();
  await testRealRequest();
  
  console.log('═'.repeat(60));
  console.log('✅ Testes concluídos!');
  console.log('');
  console.log('📋 Resumo esperado:');
  console.log('   - Todas as rotas devem responder ao OPTIONS');
  console.log('   - Headers Access-Control-Allow-Origin devem estar presentes');
  console.log('   - Origin * ou específica deve ser permitida');
  console.log('   - Status 200/204 para OPTIONS, 401 para GET sem auth');
  console.log('═'.repeat(60));
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testAwsStatsPreflight,
  testDifferentOrigins,
  testOtherAwsRoutes,
  testRealRequest,
  runAllTests
}; 