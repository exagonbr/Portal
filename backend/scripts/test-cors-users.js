#!/usr/bin/env node

/**
 * Script para testar a implementação de CORS das APIs de usuários
 * Execute com: node scripts/test-cors-users.js
 */

const axios = require('axios');
const colors = require('colors');

// Configurações do teste
const BASE_URL = process.env.API_BASE_URL || 'https://portal.sabercon.com.br/api';
const TEST_ORIGINS = [
  'https://portal.sabercon.com.br',
  'https://portal.sabercon.com.br',
  'https://admin.sabercon.com.br',
  'https://malicious-site.com', // Esta deve ser rejeitada
  null // Sem origin (mobile apps, Postman)
];

const TEST_ENDPOINTS = [
  { path: '/api/users/stats-test', method: 'GET', type: 'public' },
  { path: '/api/users/stats', method: 'GET', type: 'general' },
  { path: '/api/users/me', method: 'GET', type: 'general' },
  { path: '/api/users', method: 'GET', type: 'admin' },
  { path: '/api/users', method: 'POST', type: 'admin' }
];

/**
 * Testa uma requisição CORS
 */
async function testCorsRequest(origin, endpoint) {
  const headers = {};
  if (origin) {
    headers['Origin'] = origin;
  }

  try {
    console.log(`\n🧪 Testando: ${endpoint.method} ${endpoint.path}`);
    console.log(`   Origem: ${origin || 'sem-origin'}`);
    console.log(`   Tipo: ${endpoint.type}`);

    // Primeiro, teste preflight se necessário
    if (endpoint.method !== 'GET' && origin) {
      console.log('   → Testando preflight OPTIONS...');
      
      const preflightResponse = await axios({
        method: 'OPTIONS',
        url: `${BASE_URL}${endpoint.path}`,
        headers: {
          ...headers,
          'Access-Control-Request-Method': endpoint.method,
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        },
        validateStatus: () => true // Não lançar erro para status HTTP
      });

      console.log(`   → Preflight Status: ${preflightResponse.status}`);
      
      if (preflightResponse.status === 200) {
        console.log('   → ✅ Preflight aprovado'.green);
        console.log(`   → Allow-Origin: ${preflightResponse.headers['access-control-allow-origin']}`);
        console.log(`   → Allow-Methods: ${preflightResponse.headers['access-control-allow-methods']}`);
      } else {
        console.log('   → ❌ Preflight rejeitado'.red);
        return { success: false, reason: 'Preflight failed' };
      }
    }

    // Agora teste a requisição real
    console.log('   → Testando requisição real...');
    
    const response = await axios({
      method: endpoint.method,
      url: `${BASE_URL}${endpoint.path}`,
      headers: headers,
      data: endpoint.method === 'POST' ? { test: 'data' } : undefined,
      validateStatus: () => true // Não lançar erro para status HTTP
    });

    console.log(`   → Status: ${response.status}`);

    if (response.status === 200) {
      console.log('   → ✅ Requisição aprovada'.green);
      console.log(`   → Allow-Origin: ${response.headers['access-control-allow-origin']}`);
      console.log(`   → Allow-Credentials: ${response.headers['access-control-allow-credentials']}`);
      
      // Verificar headers de segurança
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'x-api-version',
        'x-service'
      ];
      
      securityHeaders.forEach(header => {
        if (response.headers[header]) {
          console.log(`   → ${header}: ${response.headers[header]}`);
        }
      });

      return { success: true, status: response.status, headers: response.headers };
    } else if (response.status === 403) {
      console.log('   → ❌ Requisição rejeitada por CORS'.red);
      if (response.data && response.data.code) {
        console.log(`   → Código: ${response.data.code}`);
        console.log(`   → Mensagem: ${response.data.message}`);
      }
      return { success: false, reason: 'CORS rejected', status: response.status };
    } else {
      console.log(`   → ⚠️ Status inesperado: ${response.status}`.yellow);
      return { success: false, reason: 'Unexpected status', status: response.status };
    }

  } catch (error) {
    console.log(`   → ❌ Erro na requisição: ${error.message}`.red);
    return { success: false, reason: error.message };
  }
}

/**
 * Executa todos os testes
 */
async function runAllTests() {
  console.log('🚀 Iniciando testes de CORS para APIs de usuários'.cyan.bold);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('=' * 60);

  const results = [];

  for (const origin of TEST_ORIGINS) {
    console.log(`\n🌐 Testando origem: ${origin || 'sem-origin'}`.blue.bold);
    console.log('-' * 50);

    for (const endpoint of TEST_ENDPOINTS) {
      const result = await testCorsRequest(origin, endpoint);
      results.push({
        origin: origin || 'no-origin',
        endpoint: `${endpoint.method} ${endpoint.path}`,
        type: endpoint.type,
        success: result.success,
        reason: result.reason,
        status: result.status
      });

      // Pequena pausa entre requisições
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES'.cyan.bold);
  console.log('=' * 60);

  const summary = {
    total: results.length,
    passed: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length
  };

  console.log(`Total de testes: ${summary.total}`);
  console.log(`✅ Aprovados: ${summary.passed}`.green);
  console.log(`❌ Falharam: ${summary.failed}`.red);
  console.log(`📈 Taxa de sucesso: ${((summary.passed / summary.total) * 100).toFixed(1)}%`);

  // Detalhes dos testes que falharam
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log('\n❌ TESTES QUE FALHARAM:'.red.bold);
    failed.forEach(test => {
      console.log(`   • ${test.endpoint} (${test.origin}) - ${test.reason}`);
    });
  }

  // Análise por tipo de endpoint
  console.log('\n📋 ANÁLISE POR TIPO DE ENDPOINT:'.cyan.bold);
  const byType = {};
  results.forEach(r => {
    if (!byType[r.type]) byType[r.type] = { total: 0, passed: 0 };
    byType[r.type].total++;
    if (r.success) byType[r.type].passed++;
  });

  Object.keys(byType).forEach(type => {
    const stats = byType[type];
    const rate = ((stats.passed / stats.total) * 100).toFixed(1);
    console.log(`   ${type}: ${stats.passed}/${stats.total} (${rate}%)`);
  });

  console.log('\n🏁 Testes concluídos!'.green.bold);
  
  // Exit code baseado nos resultados
  process.exit(summary.failed > 0 ? 1 : 0);
}

/**
 * Função principal
 */
async function main() {
  try {
    // Verificar se o servidor está rodando
    console.log('🔍 Verificando se o servidor está rodando...');
    await axios.get(`${BASE_URL}/health`);
    console.log('✅ Servidor está rodando!'.green);
    
    await runAllTests();
  } catch (error) {
    console.error('❌ Erro ao conectar com o servidor:'.red, error.message);
    console.error('💡 Certifique-se de que o backend está rodando em:', BASE_URL);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { testCorsRequest, runAllTests };