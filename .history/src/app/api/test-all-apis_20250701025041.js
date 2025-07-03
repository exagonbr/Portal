#!/usr/bin/env node

const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://portal.sabercon.com.br/api'
  : 'http://localhost:3000/api';

// Lista de endpoints para testar
const ENDPOINTS = [
  // APIs de autenticação
  { path: '/health', method: 'GET', auth: false },
  
  // APIs que devem funcionar sem autenticação
  { path: '/auth/login', method: 'POST', auth: false, body: { email: 'admin@sabercon.edu.br', password: 'password123' } },
  
  // APIs que precisam de autenticação
  { path: '/dashboard/analytics', method: 'GET', auth: true },
  { path: '/dashboard/engagement', method: 'GET', auth: true },
  { path: '/dashboard/system', method: 'GET', auth: true },
  { path: '/institutions', method: 'GET', auth: true },
  { path: '/roles/stats', method: 'GET', auth: true },
  { path: '/users', method: 'GET', auth: true },
  { path: '/settings', method: 'GET', auth: true },
];

let authToken = null;

function log(message, color = 'reset') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function login() {
  try {
    log('🔐 Fazendo login...', 'blue');
    
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@sabercon.edu.br',
        password: 'password123'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      log('✅ Login realizado com sucesso', 'green');
      
      // Extrair token do cookie ou resposta
      const cookies = response.headers.get('set-cookie');
      if (cookies) {
        const tokenMatch = cookies.match(/auth_token=([^;]+)/);
        if (tokenMatch) {
          authToken = tokenMatch[1];
          log(`🎫 Token obtido: ${authToken.substring(0, 20)}...`, 'cyan');
        }
      }
      
      return true;
    } else {
      log(`❌ Erro no login: ${data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`💥 Erro crítico no login: ${error.message}`, 'red');
    return false;
  }
}

async function testEndpoint(endpoint) {
  const startTime = Date.now();
  
  try {
    log(`\n🧪 Testando ${endpoint.method} ${endpoint.path}`, 'yellow');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Adicionar autenticação se necessário
    if (endpoint.auth && authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const options = {
      method: endpoint.method,
      headers,
      signal: AbortSignal.timeout(10000), // 10 segundos timeout
    };
    
    if (endpoint.body) {
      options.body = JSON.stringify(endpoint.body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint.path}`, options);
    const duration = Date.now() - startTime;
    
    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: 'Resposta não é JSON válido' };
    }
    
    if (response.ok) {
      log(`✅ ${endpoint.path} - ${response.status} (${duration}ms)`, 'green');
      if (data.message) {
        log(`   📝 ${data.message}`, 'cyan');
      }
    } else {
      log(`❌ ${endpoint.path} - ${response.status} (${duration}ms)`, 'red');
      log(`   📝 ${data.error || data.message || 'Erro desconhecido'}`, 'red');
    }
    
    // Verificar se a resposta demorou muito (possível loop)
    if (duration > 5000) {
      log(`⚠️  ATENÇÃO: Resposta muito lenta (${duration}ms) - possível loop!`, 'yellow');
    }
    
    return {
      path: endpoint.path,
      method: endpoint.method,
      status: response.status,
      duration,
      success: response.ok,
      error: response.ok ? null : (data.error || data.message || 'Erro desconhecido')
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      log(`⏰ ${endpoint.path} - TIMEOUT (${duration}ms) - possível loop infinito!`, 'red');
      return {
        path: endpoint.path,
        method: endpoint.method,
        status: 'TIMEOUT',
        duration,
        success: false,
        error: 'Timeout - possível loop infinito'
      };
    } else {
      log(`💥 ${endpoint.path} - ERRO: ${error.message} (${duration}ms)`, 'red');
      return {
        path: endpoint.path,
        method: endpoint.method,
        status: 'ERROR',
        duration,
        success: false,
        error: error.message
      };
    }
  }
}

async function runTests() {
  log('🚀 Iniciando testes de APIs...', 'magenta');
  log('=' .repeat(50), 'magenta');
  
  // Fazer login primeiro
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('❌ Não foi possível fazer login. Alguns testes podem falhar.', 'red');
  }
  
  const results = [];
  
  // Testar cada endpoint
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Pequena pausa entre requests para evitar sobrecarga
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Resumo dos resultados
  log('\n' + '=' .repeat(50), 'magenta');
  log('📊 RESUMO DOS TESTES', 'magenta');
  log('=' .repeat(50), 'magenta');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const timeouts = results.filter(r => r.status === 'TIMEOUT').length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  
  log(`✅ Sucessos: ${successful}`, 'green');
  log(`❌ Falhas: ${failed}`, 'red');
  log(`⏰ Timeouts: ${timeouts}`, 'yellow');
  log(`⏱️  Tempo médio: ${Math.round(avgDuration)}ms`, 'cyan');
  
  if (timeouts > 0) {
    log('\n⚠️  ATENÇÃO: Foram detectados timeouts que podem indicar loops infinitos!', 'yellow');
    results.filter(r => r.status === 'TIMEOUT').forEach(r => {
      log(`   - ${r.method} ${r.path}`, 'yellow');
    });
  }
  
  const slowEndpoints = results.filter(r => r.duration > 2000);
  if (slowEndpoints.length > 0) {
    log('\n🐌 Endpoints lentos (>2s):', 'yellow');
    slowEndpoints.forEach(r => {
      log(`   - ${r.method} ${r.path} (${r.duration}ms)`, 'yellow');
    });
  }
  
  log('\n🏁 Testes concluídos!', 'magenta');
}

// Executar testes
runTests().catch(error => {
  log(`💥 Erro crítico nos testes: ${error.message}`, 'red');
  process.exit(1);
}); 