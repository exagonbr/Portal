#!/usr/bin/env node

/**
 * Script para diagnosticar o fluxo de autenticação e identificar problemas com header Authorization
 */

const https = require('https');
const http = require('http');

// Configurações
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:3001';

// Dados de teste
const loginData = {
  email: 'admin@portal.com',
  password: 'admin123'
};

// Função para fazer requisições HTTP
function makeRequest(url, data, method = 'POST', headers = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;
    
    const postData = data ? JSON.stringify(data) : '';
    const urlObj = new URL(url);
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'DebugAuthFlow/1.0'
    };
    
    const allHeaders = { ...defaultHeaders, ...headers };
    if (postData) {
      allHeaders['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: allHeaders
    };

    console.log(`🔍 Fazendo requisição ${method} para: ${url}`);
    console.log(`📨 Headers enviados:`, JSON.stringify(allHeaders, null, 2));

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testAuthFlow() {
  console.log('🔍 Iniciando diagnóstico do fluxo de autenticação...\n');

  // PASSO 1: Fazer login e obter token
  console.log('📋 PASSO 1: Fazendo login...');
  
  try {
    const loginResponse = await makeRequest(`${BACKEND_URL}/api/auth/login`, loginData);
    
    console.log(`📊 Status do login: ${loginResponse.status}`);
    console.log(`📄 Resposta do login:`, JSON.stringify(loginResponse.data, null, 2));
    
    if (loginResponse.status !== 200) {
      console.log('❌ Falha no login. Abortando testes.');
      return;
    }

    const token = loginResponse.data.token;
    if (!token) {
      console.log('❌ Token não retornado no login. Abortando testes.');
      return;
    }
    
    console.log(`✅ Login bem-sucedido! Token obtido: ${token.substring(0, 20)}...`);
    console.log('');

    // PASSO 2: Testar endpoint protegido COM token
    console.log('📋 PASSO 2: Testando endpoint protegido COM Authorization header...');
    
    const protectedRequest = await makeRequest(
      `${BACKEND_URL}/api/users?search=professor%40sabercon`,
      null,
      'GET',
      { 'Authorization': `Bearer ${token}` }
    );
    
    console.log(`📊 Status da requisição com token: ${protectedRequest.status}`);
    console.log(`📄 Resposta:`, JSON.stringify(protectedRequest.data, null, 2));
    console.log('');

    // PASSO 3: Testar endpoint protegido SEM token
    console.log('📋 PASSO 3: Testando endpoint protegido SEM Authorization header...');
    
    const unprotectedRequest = await makeRequest(
      `${BACKEND_URL}/api/users?search=professor%40sabercon`,
      null,
      'GET'
    );
    
    console.log(`📊 Status da requisição sem token: ${unprotectedRequest.status}`);
    console.log(`📄 Resposta:`, JSON.stringify(unprotectedRequest.data, null, 2));
    console.log('');

    // PASSO 4: Testar endpoint do Next.js
    console.log('📋 PASSO 4: Testando endpoint do Next.js...');
    
    const nextJsRequest = await makeRequest(
      `${FRONTEND_URL}/api/auth/validate`,
      { token },
      'POST'
    );
    
    console.log(`📊 Status da validação Next.js: ${nextJsRequest.status}`);
    console.log(`📄 Resposta:`, JSON.stringify(nextJsRequest.data, null, 2));
    console.log('');

    // PASSO 5: Verificar formato do token
    console.log('📋 PASSO 5: Analisando token...');
    
    try {
      // Decodificar payload do token (sem verificar assinatura)
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log(`🔑 Payload do token:`, JSON.stringify(payload, null, 2));
        
        // Verificar expiração
        if (payload.exp) {
          const expirationDate = new Date(payload.exp * 1000);
          const now = new Date();
          console.log(`⏰ Token expira em: ${expirationDate.toISOString()}`);
          console.log(`⏰ Agora é: ${now.toISOString()}`);
          console.log(`⏰ Token válido: ${expirationDate > now ? '✅ SIM' : '❌ NÃO - EXPIRADO'}`);
        }
      } else {
        console.log('❌ Formato de token inválido');
      }
    } catch (error) {
      console.log(`❌ Erro ao decodificar token: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Função para simular problema do frontend
async function simulateFrontendIssue() {
  console.log('\n🔍 Simulando problema do frontend...\n');

  // Simular localStorage
  let mockLocalStorage = {};
  
  // Função para simular getAuthToken do apiClient
  function getAuthToken() {
    // Simula typeof window !== 'undefined'
    const token = mockLocalStorage['auth_token'];
    if (token) return token;
    
    // Simula fallback para cookies (vazio neste caso)
    return null;
  }

  console.log('📋 Estado inicial:');
  console.log(`💾 localStorage: ${JSON.stringify(mockLocalStorage)}`);
  console.log(`🔑 getAuthToken(): ${getAuthToken()}`);
  console.log('');

  // Simular login bem-sucedido
  console.log('📋 Simulando login bem-sucedido...');
  const mockLoginResponse = {
    success: true,
    token: 'mock.jwt.token',
    user: { id: 1, name: 'Admin', email: 'admin@portal.com' }
  };
  
  // Simular salvamento no localStorage (como no LoginForm.tsx)
  mockLocalStorage['auth_token'] = mockLoginResponse.token;
  if (mockLoginResponse.user) {
    mockLocalStorage['user_data'] = JSON.stringify(mockLoginResponse.user);
  }
  
  console.log('💾 localStorage após login:', JSON.stringify(mockLocalStorage));
  console.log(`🔑 getAuthToken(): ${getAuthToken()}`);
  console.log('');

  // Simular construção de headers (como no apiClient)
  function prepareHeaders(customHeaders = {}) {
    const headers = { 'Content-Type': 'application/json', ...customHeaders };
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  console.log('📋 Headers que seriam enviados:');
  const headers = prepareHeaders();
  console.log(`📨 Headers: ${JSON.stringify(headers, null, 2)}`);
  
  if (headers.Authorization) {
    console.log('✅ Header Authorization seria incluído');
  } else {
    console.log('❌ Header Authorization NÃO seria incluído');
  }
}

// Função principal
async function main() {
  console.log('🚀 Debug do Fluxo de Autenticação\n');
  
  await testAuthFlow();
  await simulateFrontendIssue();
  
  console.log('\n📋 Resumo do Diagnóstico:');
  console.log('1. ✅ Se login retornou token e status 200: Backend está funcionando');
  console.log('2. ✅ Se endpoint protegido funciona COM token: Validação está correta');
  console.log('3. ❌ Se endpoint protegido falha SEM token: Segurança está funcionando');
  console.log('4. 🔍 Se frontend não inclui Authorization: Problema no cliente');
  
  console.log('\n🔧 Possíveis causas do problema:');
  console.log('- Token não está sendo salvo no localStorage após login');
  console.log('- Múltiplas implementações de auth estão conflitando');
  console.log('- getAuthToken() não está retornando o token');
  console.log('- Headers não estão sendo construídos corretamente');
  console.log('- Token pode estar expirado');
}

// Executar se este arquivo for chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testAuthFlow, simulateFrontendIssue, makeRequest }; 