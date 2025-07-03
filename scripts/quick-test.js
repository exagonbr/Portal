#!/usr/bin/env node

/**
 * Script de teste rápido para validar algumas rotas principais
 * Autor: Kilo Code
 * Data: 2025-01-07
 */

const https = require('https');
const http = require('http');

// Configurações
const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  credentials: {
    email: 'admin@sabercon.edu.br',
    password: 'password123'
  },
  timeout: 10000
};

// Rotas principais para teste rápido
const MAIN_ROUTES = [
  { path: '/api/auth/login', method: 'POST', needsAuth: false, body: CONFIG.credentials },
  { path: '/api/auth/session', method: 'GET', needsAuth: true },
  { path: '/api/health-check', method: 'GET', needsAuth: false },
  { path: '/api/users', method: 'GET', needsAuth: true },
  { path: '/api/courses', method: 'GET', needsAuth: true },
  { path: '/api/admin/system/info', method: 'GET', needsAuth: true },
  { path: '/api/dashboard/summary', method: 'GET', needsAuth: true },
  { path: '/api/books', method: 'GET', needsAuth: true },
  { path: '/api/collections', method: 'GET', needsAuth: true },
  { path: '/api/assignments', method: 'GET', needsAuth: true }
];

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para fazer requisições HTTP
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
        'User-Agent': 'Quick-API-Test/1.0',
        ...options.headers
      },
      timeout: CONFIG.timeout
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            raw: data
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            raw: data,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Função para fazer login
async function login() {
  log('🔐 Fazendo login...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/auth/login`, {
      method: 'POST',
      body: CONFIG.credentials
    });
    
    if (response.status === 200 && response.data.success) {
      log('✅ Login realizado com sucesso!', 'green');
      return response.data.data.token;
    } else {
      log(`❌ Falha no login: ${response.data.message || 'Erro desconhecido'}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Erro ao fazer login: ${error.message}`, 'red');
    return null;
  }
}

// Função para testar uma rota
async function testRoute(route, token) {
  const startTime = Date.now();
  
  try {
    const headers = {};
    if (token && route.needsAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      method: route.method,
      headers
    };
    
    if (route.body) {
      options.body = route.body;
    }
    
    const response = await makeRequest(`${CONFIG.baseUrl}${route.path}`, options);
    const responseTime = Date.now() - startTime;
    
    const success = response.status < 400;
    const status = success ? '✅' : '❌';
    const color = success ? 'green' : 'red';
    
    log(`${status} ${route.method.padEnd(6)} ${route.path.padEnd(30)} ${response.status} (${responseTime}ms)`, color);
    
    return { success, status: response.status, responseTime, message: response.data?.message };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    log(`❌ ${route.method.padEnd(6)} ${route.path.padEnd(30)} ERROR (${responseTime}ms) - ${error.message}`, 'red');
    return { success: false, status: 0, responseTime, message: error.message };
  }
}

// Função principal
async function main() {
  log('🚀 Teste Rápido de API - Portal', 'bright');
  log(`📍 Base URL: ${CONFIG.baseUrl}`, 'blue');
  log(`👤 Usuário: ${CONFIG.credentials.email}`, 'blue');
  log('═'.repeat(80), 'blue');
  
  // Fazer login
  const token = await login();
  
  if (!token) {
    log('\n❌ Não foi possível obter token de autenticação. Continuando sem autenticação...', 'yellow');
  }
  
  log('\n🧪 Testando rotas principais...', 'cyan');
  log('Status  Método  Rota                           Código  Tempo', 'blue');
  log('─'.repeat(80), 'blue');
  
  const results = [];
  
  // Testar cada rota
  for (const route of MAIN_ROUTES) {
    const result = await testRoute(route, token);
    results.push({ route, result });
    
    // Pequeno delay entre requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Resumo
  log('\n📊 RESUMO', 'bright');
  log('═'.repeat(40), 'blue');
  
  const successful = results.filter(r => r.result.success).length;
  const total = results.length;
  const successRate = ((successful / total) * 100).toFixed(1);
  
  log(`✅ Sucessos: ${successful}/${total}`, 'green');
  log(`❌ Falhas: ${total - successful}/${total}`, 'red');
  log(`📈 Taxa de sucesso: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');
  
  const avgTime = Math.round(
    results.reduce((sum, r) => sum + r.result.responseTime, 0) / total
  );
  log(`⏱️  Tempo médio: ${avgTime}ms`, 'cyan');
  
  // Mostrar falhas se houver
  const failures = results.filter(r => !r.result.success);
  if (failures.length > 0) {
    log('\n❌ ROTAS COM FALHA:', 'red');
    failures.forEach(f => {
      log(`  ${f.route.method} ${f.route.path} - ${f.result.message}`, 'red');
    });
  }
  
  // Status da API
  log('\n🏥 STATUS DA API:', 'bright');
  if (successful >= total * 0.8) {
    log('🟢 API está funcionando bem!', 'green');
  } else if (successful >= total * 0.5) {
    log('🟡 API tem alguns problemas, mas está funcional', 'yellow');
  } else {
    log('🔴 API tem problemas sérios!', 'red');
  }
  
  log('\n🎉 Teste rápido concluído!', 'bright');
  
  // Código de saída baseado no sucesso
  process.exit(successful >= total * 0.8 ? 0 : 1);
}

// Executar script
if (require.main === module) {
  main().catch(error => {
    log(`💥 Erro fatal: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { makeRequest, login, testRoute };