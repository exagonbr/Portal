#!/usr/bin/env node

/**
 * Script para testar configurações de CORS
 * Verifica se todas as origens são permitidas
 */

const http = require('http');
const https = require('https');

const BACKEND_URL = process.env.BACKEND_URL || 'https://portal.sabercon.com.br/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://portal.sabercon.com.br';

console.log('🧪 Testando configurações de CORS...\n');

// Função para fazer requisição HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://test-origin.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
        ...options.headers
      }
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

// Teste 1: Backend OPTIONS
async function testBackendCors() {
  console.log('1. 🔧 Testando CORS do Backend...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/health`);
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin'] || 'NÃO DEFINIDO'}`);
    console.log(`   Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods'] || 'NÃO DEFINIDO'}`);
    console.log(`   Access-Control-Allow-Headers: ${response.headers['access-control-allow-headers'] || 'NÃO DEFINIDO'}`);
    console.log(`   Access-Control-Allow-Credentials: ${response.headers['access-control-allow-credentials'] || 'NÃO DEFINIDO'}`);
    
    if (response.headers['access-control-allow-origin'] === '*') {
      console.log('   ✅ CORS configurado para permitir todas as origens');
    } else {
      console.log('   ⚠️  CORS não está permitindo todas as origens');
    }
    
  } catch (error) {
    console.log(`   ❌ Erro ao testar backend: ${error.message}`);
  }
  
  console.log('');
}

// Teste 2: Frontend OPTIONS
async function testFrontendCors() {
  console.log('2. 🌐 Testando CORS do Frontend...');
  
  try {
    const response = await makeRequest(`${FRONTEND_URL}/api/test`);
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin'] || 'NÃO DEFINIDO'}`);
    console.log(`   Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods'] || 'NÃO DEFINIDO'}`);
    console.log(`   Access-Control-Allow-Headers: ${response.headers['access-control-allow-headers'] || 'NÃO DEFINIDO'}`);
    
    if (response.headers['access-control-allow-origin'] === '*') {
      console.log('   ✅ CORS configurado para permitir todas as origens');
    } else {
      console.log('   ⚠️  CORS não está permitindo todas as origens');
    }
    
  } catch (error) {
    console.log(`   ❌ Erro ao testar frontend: ${error.message}`);
  }
  
  console.log('');
}

// Teste 3: Diferentes origens
async function testDifferentOrigins() {
  console.log('3. 🌍 Testando diferentes origens...');
  
  const testOrigins = [
    'https://portal.sabercon.com.br',
    'https://portal.sabercon.com.br',
    'http://127.0.0.1:3000',
    'https://portal.sabercon.com.br',
    'https://example.com',
    'https://test.com'
  ];
  
  for (const origin of testOrigins) {
    try {
      const response = await makeRequest(`${BACKEND_URL}/api/health`, {
        headers: { 'Origin': origin }
      });
      
      const allowedOrigin = response.headers['access-control-allow-origin'];
      if (allowedOrigin === '*' || allowedOrigin === origin) {
        console.log(`   ✅ ${origin} - PERMITIDO`);
      } else {
        console.log(`   ❌ ${origin} - BLOQUEADO (${allowedOrigin})`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${origin} - ERRO: ${error.message}`);
    }
  }
  
  console.log('');
}

// Teste 4: Métodos HTTP
async function testHttpMethods() {
  console.log('4. 🔨 Testando métodos HTTP...');
  
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
  
  for (const method of methods) {
    try {
      const response = await makeRequest(`${BACKEND_URL}/api/health`, {
        headers: { 'Access-Control-Request-Method': method }
      });
      
      const allowedMethods = response.headers['access-control-allow-methods'] || '';
      if (allowedMethods.includes(method)) {
        console.log(`   ✅ ${method} - PERMITIDO`);
      } else {
        console.log(`   ❌ ${method} - BLOQUEADO`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${method} - ERRO: ${error.message}`);
    }
  }
  
  console.log('');
}

// Teste 5: Headers importantes
async function testHeaders() {
  console.log('5. 📋 Testando headers importantes...');
  
  const headers = [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'Cache-Control',
    'Cookie'
  ];
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/health`, {
      headers: { 'Access-Control-Request-Headers': headers.join(', ') }
    });
    
    const allowedHeaders = response.headers['access-control-allow-headers'] || '';
    
    for (const header of headers) {
      if (allowedHeaders.toLowerCase().includes(header.toLowerCase())) {
        console.log(`   ✅ ${header} - PERMITIDO`);
      } else {
        console.log(`   ❌ ${header} - BLOQUEADO`);
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Erro ao testar headers: ${error.message}`);
  }
  
  console.log('');
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes de CORS...\n');
  
  await testBackendCors();
  await testFrontendCors();
  await testDifferentOrigins();
  await testHttpMethods();
  await testHeaders();
  
  console.log('✅ Testes de CORS concluídos!\n');
  
  console.log('📋 Resumo das configurações recomendadas:');
  console.log('   - Access-Control-Allow-Origin: *');
  console.log('   - Access-Control-Allow-Credentials: false');
  console.log('   - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
  console.log('   - Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token, etc.');
  console.log('   - Access-Control-Max-Age: 86400');
  console.log('');
  
  console.log('🦊 Para resolver NS_BINDING_ABORT no Firefox:');
  console.log('   - Remover AbortController em requisições Firefox');
  console.log('   - Usar fetch com configurações mais conservadoras');
  console.log('   - Interceptar e tratar erros NS_BINDING_ABORTED');
  console.log('   - Configurar mode: "cors" e credentials: "omit"');
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testBackendCors,
  testFrontendCors,
  testDifferentOrigins,
  testHttpMethods,
  testHeaders,
  runAllTests
}; 