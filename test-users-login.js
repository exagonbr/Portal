#!/usr/bin/env node

/**
 * Script para testar o novo endpoint /users/login
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://portal.sabercon.com.br/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://portal.sabercon.com.br';

// Credenciais de teste
const TEST_CREDENTIALS = {
  email: 'admin@sistema.com',
  password: 'admin123'
};

/**
 * Função para fazer requisições HTTP
 */
async function makeRequest(url, options = {}) {
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    return {
      status: response.status,
      data: data,
      headers: response.headers
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      data: null
    };
  }
}

/**
 * Testa o endpoint /users/login no backend
 */
async function testBackendUsersLogin() {
  console.log('\n🔐 Testando /users/login no backend...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/users/login`, {
      method: 'POST',
      body: TEST_CREDENTIALS
    });

    console.log(`Status: ${response.status}`);
    console.log('Resposta:', JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.success) {
      console.log('✅ Login via /users/login funcionando!');
      return response.data.data.accessToken;
    } else {
      console.log('❌ Login via /users/login falhou');
      return null;
    }
  } catch (error) {
    console.log('❌ Erro ao testar /users/login:', error.message);
    return null;
  }
}

/**
 * Testa o endpoint /users/login no frontend
 */
async function testFrontendUsersLogin() {
  console.log('\n🌐 Testando /users/login no frontend...');
  
  try {
    const response = await makeRequest(`${FRONTEND_URL}/api/users/login`, {
      method: 'POST',
      body: TEST_CREDENTIALS
    });

    console.log(`Status: ${response.status}`);
    console.log('Resposta:', JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.success) {
      console.log('✅ Login via frontend /users/login funcionando!');
      return response.data.data.token;
    } else {
      console.log('❌ Login via frontend /users/login falhou');
      return null;
    }
  } catch (error) {
    console.log('❌ Erro ao testar frontend /users/login:', error.message);
    return null;
  }
}

/**
 * Compara os dois endpoints
 */
async function compareEndpoints() {
  console.log('\n🔍 Comparando endpoints antigo vs novo...');
  
  // Testar endpoint antigo /auth/login
  try {
    const authResponse = await makeRequest(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      body: TEST_CREDENTIALS
    });
    
    console.log('📊 Endpoint /auth/login:', authResponse.status === 200 ? '✅ Funcionando' : '❌ Não funcionando');
  } catch (error) {
    console.log('📊 Endpoint /auth/login: ❌ Erro -', error.message);
  }
  
  // Testar endpoint novo /users/login
  try {
    const usersResponse = await makeRequest(`${BACKEND_URL}/users/login`, {
      method: 'POST',
      body: TEST_CREDENTIALS
    });
    
    console.log('📊 Endpoint /users/login:', usersResponse.status === 200 ? '✅ Funcionando' : '❌ Não funcionando');
  } catch (error) {
    console.log('📊 Endpoint /users/login: ❌ Erro -', error.message);
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🧪 Testando migração para /users/login');
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`Frontend: ${FRONTEND_URL}`);
  
  // Teste 1: Comparar endpoints
  await compareEndpoints();
  
  // Teste 2: Login no backend via /users/login
  const backendToken = await testBackendUsersLogin();
  
  // Teste 3: Login no frontend via /users/login
  const frontendToken = await testFrontendUsersLogin();
  
  console.log('\n🏁 Testes concluídos!');
  
  if (backendToken && frontendToken) {
    console.log('✅ Migração para /users/login bem-sucedida!');
    console.log('✅ Ambos os endpoints estão funcionando corretamente.');
  } else {
    console.log('❌ Há problemas na migração que precisam ser corrigidos.');
    
    if (!backendToken) {
      console.log('  - Backend /users/login não está funcionando');
    }
    
    if (!frontendToken) {
      console.log('  - Frontend /users/login não está funcionando');
    }
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testBackendUsersLogin, testFrontendUsersLogin, compareEndpoints }; 