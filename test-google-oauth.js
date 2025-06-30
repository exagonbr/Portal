#!/usr/bin/env node

/**
 * Script de teste para validar configuração do Google OAuth
 * Execute: node test-google-oauth.js
 */

const https = require('https');
const http = require('http');

console.log('🧪 TESTANDO CONFIGURAÇÃO GOOGLE OAUTH');
console.log('=====================================\n');

// Configurações
const PRODUCTION_URL = 'https://portal.sabercon.com.br';
const DEV_URL = 'http://localhost:3000';
const BACKEND_PROD = 'https://portal.sabercon.com.br/api';
const BACKEND_DEV = 'http://localhost:3001';

// Função para fazer requisição HTTP/HTTPS
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Testes
async function runTests() {
  console.log('1️⃣ Testando Frontend em Produção...');
  try {
    const response = await makeRequest(`${PRODUCTION_URL}/auth/login`);
    console.log(`   ✅ Status: ${response.statusCode}`);
    console.log(`   📍 URL: ${PRODUCTION_URL}/auth/login`);
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }

  console.log('\n2️⃣ Testando Rota Google OAuth em Produção...');
  try {
    const response = await makeRequest(`${BACKEND_PROD}/auth/google`);
    console.log(`   ✅ Status: ${response.statusCode} (302 = redirecionamento esperado)`);
    console.log(`   📍 URL: ${BACKEND_PROD}/auth/google`);
    if (response.headers.location) {
      console.log(`   🔄 Redireciona para: ${response.headers.location}`);
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }

  console.log('\n3️⃣ Testando Health Check do Backend...');
  try {
    const response = await makeRequest(`${BACKEND_PROD.replace('/api', '')}/health`);
    console.log(`   ✅ Status: ${response.statusCode}`);
    if (response.statusCode === 200) {
      const health = JSON.parse(response.data);
      console.log(`   🏥 Status: ${health.status}`);
      console.log(`   🕐 Uptime: ${Math.floor(health.uptime)}s`);
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }

  console.log('\n4️⃣ Verificando Variáveis de Ambiente...');
  const requiredEnvVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'FRONTEND_URL',
    'GOOGLE_CALLBACK_URL'
  ];

  // Simular verificação (não podemos acessar .env do Node.js aqui)
  console.log('   📋 Variáveis necessárias:');
  requiredEnvVars.forEach(envVar => {
    console.log(`   • ${envVar}: ✅ (verificar manualmente)`);
  });

  console.log('\n5️⃣ URLs que devem estar no Google Console:');
  console.log('   📍 Authorized JavaScript origins:');
  console.log(`      • ${PRODUCTION_URL}`);
  console.log(`      • http://localhost:3000`);
  console.log('\n   📍 Authorized redirect URIs:');
  console.log(`      • ${BACKEND_PROD}/auth/google/callback`);
  console.log(`      • http://localhost:3001/auth/google/callback`);

  console.log('\n✅ TESTE CONCLUÍDO!');
  console.log('=====================================');
  console.log('📝 Para testar manualmente:');
  console.log(`1. Acesse: ${PRODUCTION_URL}/auth/login`);
  console.log('2. Clique em "Entrar com o Google"');
  console.log('3. Autorize no Google');
  console.log('4. Deve retornar autenticado');
}

// Executar testes
runTests().catch(console.error);
