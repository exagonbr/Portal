#!/usr/bin/env node

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:3001';

// APIs que estão no frontend (Next.js)
const FRONTEND_APIS = [
  {
    url: '/api/dashboard/metrics/realtime',
    method: 'GET',
    description: 'Métricas em Tempo Real (Frontend)',
    requiresAuth: true
  },
  {
    url: '/api/dashboard/engagement',
    method: 'GET',
    description: 'Métricas de Engajamento (Frontend)',
    requiresAuth: true
  },
  {
    url: '/api/dashboard/analytics',
    method: 'GET',
    description: 'Analytics do Dashboard (Frontend)',
    requiresAuth: true
  },
  {
    url: '/api/dashboard/system',
    method: 'GET',
    description: 'Dashboard do Sistema (Frontend)',
    requiresAuth: true
  },
  {
    url: '/api/dashboard/summary',
    method: 'GET',
    description: 'Resumo do Dashboard (Frontend)',
    requiresAuth: true
  },
  {
    url: '/api/dashboard/health',
    method: 'GET',
    description: 'Status de Saúde do Sistema (Frontend)',
    requiresAuth: true
  }
];

// APIs que estão no backend
const BACKEND_APIS = [
  {
    url: '/api/institutions?page=1&limit=10',
    method: 'GET',
    description: 'API de Instituições (Backend)',
    requiresAuth: true
  },
  {
    url: '/api/users/stats',
    method: 'GET',
    description: 'Estatísticas de Usuários (Backend)',
    requiresAuth: true
  }
];

// Função para gerar um token JWT válido para teste
function generateTestToken() {
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'ExagonTech';
  
  const payload = {
    userId: 'test-admin-id',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: 'SYSTEM_ADMIN',
    institutionId: 'test-institution',
    permissions: ['admin', 'read', 'write'],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 horas
  };
  
  try {
    return jwt.sign(payload, secret);
  } catch (error) {
    console.log('⚠️ Não foi possível gerar JWT, usando token de fallback');
    // Token base64 de fallback
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }
}

async function testAPI(api, baseUrl, tokenType = 'jwt') {
  const url = `${baseUrl}${api.url}`;
  const token = generateTestToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (api.requiresAuth) {
    if (tokenType === 'jwt') {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['X-Auth-Token'] = token;
    }
  }
  
  try {
    console.log(`\n🧪 Testando: ${api.description}`);
    console.log(`📍 URL: ${url}`);
    console.log(`🔐 Token: ${tokenType === 'jwt' ? 'JWT' : 'Base64'}`);
    
    const response = await fetch(url, {
      method: api.method,
      headers
    });
    
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      data = { message: responseText };
    }
    
    if (response.ok) {
      console.log(`✅ Status: ${response.status} - OK`);
      console.log(`📊 Dados: ${data.success ? 'Sucesso' : 'Resposta válida'}`);
      
      if (data.message) {
        console.log(`💬 Mensagem: ${data.message}`);
      }
      
      return { success: true, status: response.status, data };
    } else {
      console.log(`❌ Status: ${response.status} - ${response.statusText}`);
      console.log(`💬 Erro: ${data.message || 'Erro desconhecido'}`);
      
      return { success: false, status: response.status, error: data.message };
    }
  } catch (error) {
    console.log(`💥 Erro de conexão: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkServerStatus(url, name) {
  try {
    console.log(`\n🔍 Verificando ${name}...`);
    const response = await fetch(url, { method: 'GET' });
    console.log(`✅ ${name} está rodando (Status: ${response.status})`);
    return true;
  } catch (error) {
    console.log(`❌ ${name} não está acessível: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes completos das APIs...\n');
  console.log('='.repeat(70));
  
  // Verificar status dos servidores
  console.log('\n📡 VERIFICANDO SERVIDORES');
  console.log('='.repeat(70));
  
  const frontendRunning = await checkServerStatus(FRONTEND_URL, 'Frontend (Next.js)');
  const backendRunning = await checkServerStatus(BACKEND_URL, 'Backend');
  
  if (!frontendRunning && !backendRunning) {
    console.log('\n❌ Nenhum servidor está rodando. Inicie os servidores primeiro.');
    return;
  }
  
  const results = [];
  
  // Testar APIs do Frontend
  if (frontendRunning) {
    console.log('\n🌐 TESTANDO APIs DO FRONTEND (Next.js)');
    console.log('='.repeat(70));
    
    for (const api of FRONTEND_APIS) {
      const result = await testAPI(api, FRONTEND_URL, 'jwt');
      results.push({
        api: api.description,
        url: api.url,
        server: 'Frontend',
        ...result
      });
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  // Testar APIs do Backend
  if (backendRunning) {
    console.log('\n⚙️ TESTANDO APIs DO BACKEND');
    console.log('='.repeat(70));
    
    for (const api of BACKEND_APIS) {
      // Tentar primeiro com JWT
      let result = await testAPI(api, BACKEND_URL, 'jwt');
      
      // Se falhar com JWT, tentar com base64
      if (!result.success && result.status === 401) {
        console.log('🔄 Tentando novamente com token base64...');
        result = await testAPI(api, BACKEND_URL, 'base64');
      }
      
      results.push({
        api: api.description,
        url: api.url,
        server: 'Backend',
        ...result
      });
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  // Resumo dos resultados
  console.log('\n' + '='.repeat(70));
  console.log('📋 RESUMO DOS TESTES');
  console.log('='.repeat(70));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✅ APIs funcionando: ${successful.length}/${results.length}`);
  console.log(`❌ APIs com problema: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n🎉 APIs FUNCIONANDO:');
    successful.forEach(result => {
      console.log(`  ✅ ${result.api} (${result.status || 'OK'}) - ${result.server}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n🚨 APIs COM PROBLEMAS:');
    failed.forEach(result => {
      const errorMsg = result.error || 'Status ' + result.status;
      console.log(`  ❌ ${result.api} - ${errorMsg} (${result.server})`);
    });
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('🏁 Testes concluídos!');
  
  if (failed.length === 0) {
    console.log('🎊 Todas as APIs estão funcionando corretamente!');
  } else {
    console.log(`⚠️  Ainda há ${failed.length} API(s) com problema(s).`);
    
    if (failed.some(r => r.status === 401)) {
      console.log('\n💡 DICA: Erros 401 podem indicar que você precisa:');
      console.log('   1. Fazer login no sistema para obter um token válido');
      console.log('   2. Verificar se o JWT_SECRET está configurado corretamente');
      console.log('   3. Verificar se as rotas de autenticação estão funcionando');
    }
    
    if (failed.some(r => r.status === 404)) {
      console.log('\n💡 DICA: Erros 404 podem indicar que:');
      console.log('   1. A rota não existe no servidor testado');
      console.log('   2. A rota pode estar em outro servidor (frontend vs backend)');
      console.log('   3. O servidor pode não ter sido iniciado corretamente');
    }
  }
}

// Executar testes
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAPI, runTests }; 