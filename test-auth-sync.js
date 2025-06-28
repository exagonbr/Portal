/**
 * Script para testar a sincronização de autenticação
 * Execute com: node test-auth-sync.js
 */

const fetch = require('node-fetch');

const BASE_URL = 'https://portal.sabercon.com.br/api';

async function testAuthSync() {
  console.log('🧪 Testando sincronização de autenticação...\n');

  // 1. Testar login
  console.log('1. Testando login...');
  try {
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@sabercon.edu.br',
        password: 'admin123'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login bem-sucedido');
      console.log(`   Token: ${loginData.token?.substring(0, 20)}...`);
      
      // 2. Testar endpoints com o token
      const token = loginData.token;
      const endpoints = [
        '/users/stats',
        '/dashboard/analytics',
        '/dashboard/system',
        '/dashboard/health',
        '/dashboard/metrics/realtime'
      ];

      console.log('\n2. Testando endpoints com token...');
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            }
          });

          if (response.ok) {
            console.log(`✅ ${endpoint} - Status: ${response.status}`);
          } else {
            console.log(`❌ ${endpoint} - Status: ${response.status}`);
          }
        } catch (error) {
          console.log(`❌ ${endpoint} - Erro: ${error.message}`);
        }
      }
    } else {
      console.log(`❌ Login falhou - Status: ${loginResponse.status}`);
      const errorData = await loginResponse.text();
      console.log(`   Erro: ${errorData}`);
    }
  } catch (error) {
    console.log(`❌ Erro no login: ${error.message}`);
  }

  // 3. Testar URLs malformadas
  console.log('\n3. Testando URLs malformadas...');
  const malformedUrls = [
    '/apidashboard/analytics',
    '/api/api/dashboard/analytics',
    'dashboard/analytics'
  ];

  for (const url of malformedUrls) {
    try {
      const response = await fetch(`https://portal.sabercon.com.br${url}`);
      console.log(`⚠️  ${url} - Status: ${response.status} (deveria ser 404)`);
    } catch (error) {
      console.log(`❌ ${url} - Erro: ${error.message}`);
    }
  }

  console.log('\n✅ Teste de sincronização concluído!');
}

testAuthSync().catch(console.error);
