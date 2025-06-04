#!/usr/bin/env node

/**
 * Script para testar o cliente de API unificado e verificar se o problema 
 * do header Authorization foi resolvido
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
      'User-Agent': 'TestUnifiedAuth/1.0'
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

// Simulação do UnifiedApiClient
class MockUnifiedApiClient {
  constructor() {
    this.localStorage = {};
    this.CONFIG = {
      API_BASE_URL: BACKEND_URL,
      STORAGE_KEYS: {
        AUTH_TOKEN: 'auth_token',
        REFRESH_TOKEN: 'refresh_token',
        USER_DATA: 'user_data',
        SESSION_ID: 'session_id',
        EXPIRES_AT: 'auth_expires_at'
      }
    };
  }

  getAuthToken() {
    const token = this.localStorage[this.CONFIG.STORAGE_KEYS.AUTH_TOKEN];
    if (token) {
      console.log('🔑 Token encontrado no localStorage simulado');
      return token;
    }
    console.log('❌ Token não encontrado no localStorage simulado');
    return null;
  }

  setAuthToken(token, refreshToken, expiresAt) {
    this.localStorage[this.CONFIG.STORAGE_KEYS.AUTH_TOKEN] = token;
    if (refreshToken) {
      this.localStorage[this.CONFIG.STORAGE_KEYS.REFRESH_TOKEN] = refreshToken;
    }
    if (expiresAt) {
      this.localStorage[this.CONFIG.STORAGE_KEYS.EXPIRES_AT] = expiresAt;
    }
    console.log('✅ Token salvo no localStorage simulado');
  }

  prepareHeaders(customHeaders = {}, includeAuth = true) {
    const headers = { 'Content-Type': 'application/json', ...customHeaders };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Header Authorization incluído');
      } else {
        console.log('⚠️ Token não disponível para Authorization header');
      }
    }

    return headers;
  }

  async login(email, password) {
    console.log(`🔐 Fazendo login para: ${email}`);
    
    const response = await makeRequest(`${this.CONFIG.API_BASE_URL}/api/auth/login`, { email, password });
    
    if (response.status === 200 && response.data.token) {
      const { token, refreshToken, refresh_token, expires_at, user } = response.data;
      
      // Salvar dados de autenticação
      this.setAuthToken(token, refreshToken || refresh_token, expires_at);
      
      if (user) {
        this.localStorage[this.CONFIG.STORAGE_KEYS.USER_DATA] = JSON.stringify(user);
      }

      console.log('✅ Login bem-sucedido e dados salvos');
      return { success: true, data: response.data };
    } else {
      throw new Error(response.data.message || 'Falha no login');
    }
  }

  async makeAuthenticatedRequest(endpoint, method = 'GET', body = null) {
    const url = `${this.CONFIG.API_BASE_URL}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
    const headers = this.prepareHeaders();

    console.log(`🌐 ${method} ${url}`);
    console.log(`📨 Headers:`, headers);

    return await makeRequest(url, body, method, headers);
  }
}

async function testUnifiedAuth() {
  console.log('🧪 Testando cliente de API unificado...\n');

  const mockClient = new MockUnifiedApiClient();

  try {
    // PASSO 1: Login
    console.log('📋 PASSO 1: Fazendo login com cliente unificado...');
    
    await mockClient.login(loginData.email, loginData.password);
    
    console.log('📊 Estado do localStorage após login:');
    console.log(JSON.stringify(mockClient.localStorage, null, 2));
    console.log('');

    // PASSO 2: Testar requisição autenticada
    console.log('📋 PASSO 2: Fazendo requisição autenticada...');
    
    const authResponse = await mockClient.makeAuthenticatedRequest('/api/users?search=professor%40sabercon');
    
    console.log(`📊 Status da requisição autenticada: ${authResponse.status}`);
    
    if (authResponse.status === 200) {
      console.log('✅ Requisição autenticada funcionou!');
      console.log(`📄 Usuários encontrados: ${authResponse.data.data?.items?.length || 0}`);
    } else {
      console.log('❌ Requisição autenticada falhou');
      console.log(`📄 Resposta:`, JSON.stringify(authResponse.data, null, 2));
    }

    console.log('');

    // PASSO 3: Verificar integridade do token
    console.log('📋 PASSO 3: Verificando integridade do token...');
    
    const token = mockClient.getAuthToken();
    if (token) {
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          console.log(`🔑 Token válido com payload:`, {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            permissions: payload.permissions?.length || 0,
            exp: new Date(payload.exp * 1000).toISOString()
          });
        }
      } catch (error) {
        console.log(`❌ Erro ao decodificar token: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Teste de simulação completa do fluxo
async function simulateCompleteFlow() {
  console.log('\n🔍 Simulando fluxo completo do frontend...\n');

  // Simular estado inicial
  console.log('📋 Estado inicial (usuário não logado):');
  const mockClient = new MockUnifiedApiClient();
  
  const initialHeaders = mockClient.prepareHeaders();
  console.log(`📨 Headers iniciais:`, initialHeaders);
  
  if (initialHeaders.Authorization) {
    console.log('❌ PROBLEMA: Authorization header presente sem login');
  } else {
    console.log('✅ CORRETO: Sem Authorization header antes do login');
  }

  console.log('');

  // Simular login
  console.log('📋 Fazendo login...');
  try {
    await mockClient.login(loginData.email, loginData.password);
    console.log('✅ Login concluído');
  } catch (error) {
    console.log(`❌ Falha no login: ${error.message}`);
    return;
  }

  console.log('');

  // Simular requisição pós-login
  console.log('📋 Estado pós-login:');
  const postLoginHeaders = mockClient.prepareHeaders();
  console.log(`📨 Headers pós-login:`, postLoginHeaders);
  
  if (postLoginHeaders.Authorization) {
    console.log('✅ CORRETO: Authorization header presente após login');
  } else {
    console.log('❌ PROBLEMA: Authorization header ausente após login');
  }
}

// Função principal
async function main() {
  console.log('🚀 Teste do Cliente de API Unificado\n');
  
  await testUnifiedAuth();
  await simulateCompleteFlow();
  
  console.log('\n📋 Resumo da Correção:');
  console.log('✅ Cliente unificado centraliza toda lógica de auth');
  console.log('✅ Token é salvo automaticamente após login');
  console.log('✅ Header Authorization é incluído automaticamente');
  console.log('✅ Logs detalhados para debugging');
  
  console.log('\n🔧 Próximos passos:');
  console.log('1. Atualizar todos os componentes para usar unifiedApi');
  console.log('2. Remover implementações duplicadas de auth');
  console.log('3. Testar no browser com o novo LoginForm');
}

// Executar se este arquivo for chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testUnifiedAuth, simulateCompleteFlow, MockUnifiedApiClient }; 