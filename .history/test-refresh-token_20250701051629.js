#!/usr/bin/env node

/**
 * Script para testar a rota de refresh token
 * Uso: node test-refresh-token.js [backend_url]
 */

const https = require('https');
const http = require('http');

// Configuração
const BACKEND_URL = process.argv[2] || 'https://portal.sabercon.com.br/api';
const FRONTEND_URL = process.argv[3] || 'https://portal.sabercon.com.br';

console.log('🧪 Testando rotas de refresh token...');
console.log(`📡 Backend URL: ${BACKEND_URL}`);
console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Função para fazer requisições HTTP/HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
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
        } catch (e) {
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

// Teste 1: Verificar se a rota existe no backend
async function testBackendRefreshRoute() {
  console.log('🔍 Teste 1: Verificando rota /auth/refresh-token no backend...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/auth/refresh-token`, {
      method: 'POST',
      body: {
        refreshToken: 'test-token'
      }
    });

    if (response.status === 404) {
      console.log('❌ Rota /auth/refresh-token não encontrada (404)');
      return false;
    } else if (response.status === 400 || response.status === 401) {
      console.log('✅ Rota /auth/refresh-token existe (retornou erro esperado para token inválido)');
      return true;
    } else {
      console.log(`⚠️ Rota /auth/refresh-token retornou status inesperado: ${response.status}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Erro ao testar backend: ${error.message}`);
    return false;
  }
}

// Teste 2: Verificar se a rota alternativa existe
async function testBackendSessionsRefreshRoute() {
  console.log('🔍 Teste 2: Verificando rota /sessions/refresh no backend...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/sessions/refresh`, {
      method: 'POST',
      body: {
        refreshToken: 'test-token'
      }
    });

    if (response.status === 404) {
      console.log('❌ Rota /sessions/refresh não encontrada (404)');
      return false;
    } else if (response.status === 400 || response.status === 401) {
      console.log('✅ Rota /sessions/refresh existe (retornou erro esperado para token inválido)');
      return true;
    } else {
      console.log(`⚠️ Rota /sessions/refresh retornou status inesperado: ${response.status}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Erro ao testar backend: ${error.message}`);
    return false;
  }
}

// Teste 3: Verificar rota do frontend
async function testFrontendRefreshRoute() {
  console.log('🔍 Teste 3: Verificando rota /api/auth/refresh no frontend...');
  
  try {
    const response = await makeRequest(`${FRONTEND_URL}/api/auth/refresh`, {
      method: 'POST'
    });

    if (response.status === 404) {
      console.log('❌ Rota /api/auth/refresh não encontrada (404)');
      return false;
    } else if (response.status === 401) {
      console.log('✅ Rota /api/auth/refresh existe (retornou 401 para token ausente)');
      return true;
    } else {
      console.log(`⚠️ Rota /api/auth/refresh retornou status inesperado: ${response.status}`);
      console.log('📄 Resposta:', response.data);
      return true;
    }
  } catch (error) {
    console.log(`❌ Erro ao testar frontend: ${error.message}`);
    return false;
  }
}

// Teste 4: Verificar conectividade entre frontend e backend
async function testConnectivity() {
  console.log('🔍 Teste 4: Verificando conectividade backend...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/auth/validate-session`, {
      method: 'POST',
      body: {
        token: 'test-token'
      }
    });

    if (response.status === 401) {
      console.log('✅ Backend está respondendo corretamente');
      return true;
    } else {
      console.log(`⚠️ Backend retornou status inesperado: ${response.status}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Backend não está acessível: ${error.message}`);
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes...\n');

  const results = {
    backendRefresh: await testBackendRefreshRoute(),
    sessionsRefresh: await testBackendSessionsRefreshRoute(),
    frontendRefresh: await testFrontendRefreshRoute(),
    connectivity: await testConnectivity()
  };

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RESUMO DOS TESTES:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log(`🔧 Backend /auth/refresh-token: ${results.backendRefresh ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`🔧 Backend /sessions/refresh: ${results.sessionsRefresh ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`🌐 Frontend /api/auth/refresh: ${results.frontendRefresh ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`📡 Conectividade Backend: ${results.connectivity ? '✅ OK' : '❌ FALHOU'}`);

  console.log('\n🔧 RECOMENDAÇÕES:');
  
  if (!results.backendRefresh && !results.sessionsRefresh) {
    console.log('❌ Nenhuma rota de refresh encontrada no backend!');
    console.log('   → Verifique se o backend está rodando');
    console.log('   → Verifique se as rotas estão registradas corretamente');
  } else if (!results.backendRefresh) {
    console.log('⚠️ Rota /auth/refresh-token não encontrada, mas /sessions/refresh existe');
    console.log('   → Considere atualizar o frontend para usar /sessions/refresh');
  }

  if (!results.frontendRefresh) {
    console.log('❌ Rota do frontend não está funcionando');
    console.log('   → Verifique se o Next.js está rodando');
    console.log('   → Verifique se o arquivo route.ts existe');
  }

  if (!results.connectivity) {
    console.log('❌ Backend não está acessível');
    console.log('   → Verifique se o backend está rodando na URL correta');
    console.log('   → Verifique configurações de firewall/proxy');
  }

  console.log('\n✨ Teste concluído!');
}

// Executar testes
runAllTests().catch(console.log); 