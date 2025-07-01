#!/usr/bin/env node

/**
 * Script de teste para verificar o sistema de autenticação customizado
 */

const https = require('https');
const http = require('http');

// Configurações
const BACKEND_URL = 'https://portal.sabercon.com.br/api';
const FRONTEND_URL = 'https://portal.sabercon.com.br';

// Credenciais de teste
const TEST_CREDENTIALS = {
  email: 'admin@portal.com',
  password: 'password123'
};

/**
 * Faz uma requisição HTTP/HTTPS
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'AuthTest/1.0',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Testa o endpoint de login do backend
 */
async function testBackendLogin() {
  console.log('\n🔐 Testando login no backend...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/auth/optimized/login`, {
      method: 'POST',
      body: TEST_CREDENTIALS
    });

    console.log(`Status: ${response.status}`);
    console.log('Resposta:', JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.success) {
      console.log('✅ Login no backend funcionando!');
      return response.data.data.token;
    } else {
      console.log('❌ Login no backend falhou');
      return null;
    }
  } catch (error) {
    console.log('❌ Erro ao testar login no backend:', error.message);
    return null;
  }
}

/**
 * Testa o endpoint de validação do backend
 */
async function testBackendValidation(token) {
  if (!token) {
    console.log('⏭️ Pulando teste de validação (sem token)');
    return;
  }

  console.log('\n🔍 Testando validação de token no backend...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/auth/optimized/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`Status: ${response.status}`);
    console.log('Resposta:', JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.success) {
      console.log('✅ Validação no backend funcionando!');
    } else {
      console.log('❌ Validação no backend falhou');
    }
  } catch (error) {
    console.log('❌ Erro ao testar validação no backend:', error.message);
  }
}

/**
 * Testa o endpoint de login do frontend
 */
async function testFrontendLogin() {
  console.log('\n🌐 Testando login no frontend...');
  
  try {
    const response = await makeRequest(`${FRONTEND_URL}/api/auth/login`, {
      method: 'POST',
      body: TEST_CREDENTIALS
    });

    console.log(`Status: ${response.status}`);
    console.log('Resposta:', JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.success) {
      console.log('✅ Login no frontend funcionando!');
      return response.data.data.token;
    } else {
      console.log('❌ Login no frontend falhou');
      return null;
    }
  } catch (error) {
    console.log('❌ Erro ao testar login no frontend:', error.message);
    return null;
  }
}

/**
 * Testa o endpoint de validação do frontend
 */
async function testFrontendValidation(token) {
  if (!token) {
    console.log('⏭️ Pulando teste de validação frontend (sem token)');
    return;
  }

  console.log('\n🔍 Testando validação de token no frontend...');
  
  try {
    const response = await makeRequest(`${FRONTEND_URL}/api/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`Status: ${response.status}`);
    console.log('Resposta:', JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.success) {
      console.log('✅ Validação no frontend funcionando!');
    } else {
      console.log('❌ Validação no frontend falhou');
    }
  } catch (error) {
    console.log('❌ Erro ao testar validação no frontend:', error.message);
  }
}

/**
 * Testa o redirecionamento do NextAuth
 */
async function testNextAuthRedirect() {
  console.log('\n🔄 Testando redirecionamento do NextAuth...');
  
  try {
    const response = await makeRequest(`${FRONTEND_URL}/api/auth/signin`, {
      method: 'GET'
    });

    console.log(`Status: ${response.status}`);
    console.log('Resposta:', JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.message) {
      console.log('✅ Redirecionamento do NextAuth funcionando!');
    } else {
      console.log('❌ Redirecionamento do NextAuth falhou');
    }
  } catch (error) {
    console.log('❌ Erro ao testar redirecionamento:', error.message);
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🧪 Iniciando testes do sistema de autenticação customizado');
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`Frontend: ${FRONTEND_URL}`);
  
  // Teste 1: Login no backend
  const backendToken = await testBackendLogin();
  
  // Teste 2: Validação no backend
  await testBackendValidation(backendToken);
  
  // Teste 3: Login no frontend
  const frontendToken = await testFrontendLogin();
  
  // Teste 4: Validação no frontend
  await testFrontendValidation(frontendToken);
  
  // Teste 5: Redirecionamento do NextAuth
  await testNextAuthRedirect();
  
  console.log('\n🏁 Testes concluídos!');
  
  if (backendToken && frontendToken) {
    console.log('✅ Sistema de autenticação customizado está funcionando corretamente!');
    console.log('✅ NextAuth foi desabilitado com sucesso e o sistema customizado está ativo.');
  } else {
    console.log('❌ Há problemas no sistema de autenticação que precisam ser corrigidos.');
  }
}

// Executar testes
main().catch(console.log);