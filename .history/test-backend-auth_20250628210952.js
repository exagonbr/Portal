#!/usr/bin/env node

/**
 * Script de teste para resolver o erro 401 na API /users
 * 
 * Este script demonstra como:
 * 1. Gerar um JWT válido
 * 2. Testar a autenticação no backend
 * 3. Verificar se a API /users funciona
 */

const jwt = require('jsonwebtoken');
const https = require('https');
const http = require('http');

// Configurações
const BACKEND_URL = 'http://localhost:3001';
const JWT_SECRET = 'ExagonTech';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function generateTestJWT() {
  log('\n🔧 Gerando JWT de teste...', 'cyan');
  
  const payload = {
    userId: 'test-admin-id',
    email: 'admin@sabercon.com.br',
    name: 'Admin Test',
    role: 'SYSTEM_ADMIN',
    institutionId: 'test-institution',
    permissions: [
      'system.admin',
      'users.manage',
      'institutions.manage',
      'units.manage'
    ],
    sessionId: 'session_' + Date.now(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
  };
  
  const token = jwt.sign(payload, JWT_SECRET);
  
  log('✅ JWT gerado com sucesso!', 'green');
  log(`📋 Payload: ${JSON.stringify(payload, null, 2)}`, 'blue');
  log(`🔑 Token: ${token.substring(0, 50)}...`, 'yellow');
  log(`⏰ Expira em: ${new Date(payload.exp * 1000).toLocaleString()}`, 'magenta');
  
  return { token, payload };
}

async function testBackendHealth() {
  log('\n🏥 Testando saúde do backend...', 'cyan');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/health`);
    
    if (response.status === 200) {
      log('✅ Backend está funcionando!', 'green');
      log(`📊 Status: ${response.status}`, 'blue');
      log(`📋 Resposta: ${JSON.stringify(response.data, null, 2)}`, 'blue');
      return true;
    } else {
      log(`❌ Backend retornou status ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erro ao conectar com backend: ${error.message}`, 'red');
    log('💡 Certifique-se de que o backend está rodando em http://localhost:3001', 'yellow');
    return false;
  }
}

async function testJWTGeneration() {
  log('\n🧪 Testando geração de JWT no backend...', 'cyan');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/users-debug/generate-test-jwt`);
    
    if (response.status === 200) {
      log('✅ Geração de JWT no backend funcionando!', 'green');
      log(`🔑 Token gerado: ${response.data.data.token.substring(0, 50)}...`, 'yellow');
      return response.data.data.token;
    } else {
      log(`❌ Erro na geração de JWT: ${response.status}`, 'red');
      log(`📋 Resposta: ${JSON.stringify(response.data, null, 2)}`, 'blue');
      return null;
    }
  } catch (error) {
    log(`❌ Erro ao testar geração de JWT: ${error.message}`, 'red');
    return null;
  }
}

async function testJWTValidation(token) {
  log('\n🔍 Testando validação de JWT...', 'cyan');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/users-debug/test-jwt-validation`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      log('✅ Validação de JWT funcionando!', 'green');
      log(`👤 Usuário: ${response.data.data.user.email}`, 'blue');
      log(`🎭 Role: ${response.data.data.user.role}`, 'blue');
      return true;
    } else {
      log(`❌ Erro na validação de JWT: ${response.status}`, 'red');
      log(`📋 Resposta: ${JSON.stringify(response.data, null, 2)}`, 'blue');
      return false;
    }
  } catch (error) {
    log(`❌ Erro ao testar validação de JWT: ${error.message}`, 'red');
    return false;
  }
}

async function testJWTAndRole(token) {
  log('\n🛡️ Testando validação de JWT + Role...', 'cyan');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/users-debug/test-jwt-and-role`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      log('✅ Validação de JWT + Role funcionando!', 'green');
      log(`👤 Usuário: ${response.data.data.user.email}`, 'blue');
      log(`🎭 Role: ${response.data.data.user.role}`, 'blue');
      log(`🔐 Roles permitidas: ${response.data.data.allowedRoles.join(', ')}`, 'blue');
      return true;
    } else {
      log(`❌ Erro na validação de JWT + Role: ${response.status}`, 'red');
      log(`📋 Resposta: ${JSON.stringify(response.data, null, 2)}`, 'blue');
      return false;
    }
  } catch (error) {
    log(`❌ Erro ao testar validação de JWT + Role: ${error.message}`, 'red');
    return false;
  }
}

async function testUsersAPI(token) {
  log('\n👥 Testando API /users original...', 'cyan');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/users?page=1&limit=10&sortBy=name&sortOrder=asc`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      log('✅ API /users funcionando!', 'green');
      log(`📊 Total de usuários: ${response.data.total || response.data.data?.length || 0}`, 'blue');
      log(`📋 Primeiros usuários: ${JSON.stringify(response.data.data?.slice(0, 2) || [], null, 2)}`, 'blue');
      return true;
    } else {
      log(`❌ Erro na API /users: ${response.status}`, 'red');
      log(`📋 Resposta: ${JSON.stringify(response.data, null, 2)}`, 'blue');
      return false;
    }
  } catch (error) {
    log(`❌ Erro ao testar API /users: ${error.message}`, 'red');
    return false;
  }
}

async function testUsersSimulation(token) {
  log('\n🎭 Testando simulação da API /users...', 'cyan');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/users-debug/simulate-users-route?page=1&limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      log('✅ Simulação da API /users funcionando!', 'green');
      log(`📊 Total de usuários simulados: ${response.data.total}`, 'blue');
      log(`📋 Usuários simulados: ${JSON.stringify(response.data.data, null, 2)}`, 'blue');
      return true;
    } else {
      log(`❌ Erro na simulação da API /users: ${response.status}`, 'red');
      log(`📋 Resposta: ${JSON.stringify(response.data, null, 2)}`, 'blue');
      return false;
    }
  } catch (error) {
    log(`❌ Erro ao testar simulação da API /users: ${error.message}`, 'red');
    return false;
  }
}

async function runFullDiagnosis() {
  log('\n🔍 Executando diagnóstico completo...', 'cyan');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/users-debug/full-diagnosis`);
    
    if (response.status === 200) {
      log('✅ Diagnóstico completo realizado!', 'green');
      log(`📋 Resultado: ${JSON.stringify(response.data.data, null, 2)}`, 'blue');
      return true;
    } else {
      log(`❌ Erro no diagnóstico: ${response.status}`, 'red');
      log(`📋 Resposta: ${JSON.stringify(response.data, null, 2)}`, 'blue');
      return false;
    }
  } catch (error) {
    log(`❌ Erro ao executar diagnóstico: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('🚀 Iniciando teste de resolução do erro 401 na API /users', 'bright');
  log('=' * 60, 'cyan');
  
  const results = {
    backendHealth: false,
    jwtGeneration: false,
    jwtValidation: false,
    jwtAndRole: false,
    usersAPI: false,
    usersSimulation: false,
    fullDiagnosis: false
  };
  
  // 1. Testar saúde do backend
  results.backendHealth = await testBackendHealth();
  if (!results.backendHealth) {
    log('\n❌ Backend não está funcionando. Abortando testes.', 'red');
    process.exit(1);
  }
  
  // 2. Gerar JWT local
  const { token: localToken } = await generateTestJWT();
  
  // 3. Testar geração de JWT no backend
  const backendToken = await testJWTGeneration();
  results.jwtGeneration = !!backendToken;
  
  // Usar token do backend se disponível, senão usar local
  const testToken = backendToken || localToken;
  
  // 4. Testar validação de JWT
  results.jwtValidation = await testJWTValidation(testToken);
  
  // 5. Testar validação de JWT + Role
  results.jwtAndRole = await testJWTAndRole(testToken);
  
  // 6. Testar API /users original
  results.usersAPI = await testUsersAPI(testToken);
  
  // 7. Testar simulação da API /users
  results.usersSimulation = await testUsersSimulation(testToken);
  
  // 8. Executar diagnóstico completo
  results.fullDiagnosis = await runFullDiagnosis();
  
  // Resumo final
  log('\n📊 RESUMO DOS TESTES', 'bright');
  log('=' * 60, 'cyan');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const successRate = Math.round((passedTests / totalTests) * 100);
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSOU' : '❌ FALHOU';
    const color = passed ? 'green' : 'red';
    log(`${test}: ${status}`, color);
  });
  
  log(`\n📈 Taxa de Sucesso: ${successRate}% (${passedTests}/${totalTests})`, 
       successRate >= 75 ? 'green' : successRate >= 50 ? 'yellow' : 'red');
  
  if (results.usersAPI) {
    log('\n🎉 SUCESSO! O erro 401 na API /users foi resolvido!', 'green');
    log('💡 Use o seguinte comando para testar manualmente:', 'yellow');
    log(`curl -H "Authorization: Bearer ${testToken.substring(0, 50)}..." "${BACKEND_URL}/api/users?page=1&limit=10"`, 'blue');
  } else if (results.jwtValidation && results.jwtAndRole) {
    log('\n⚠️ A autenticação está funcionando, mas há um problema na API /users', 'yellow');
    log('💡 Verifique os logs do backend para mais detalhes', 'yellow');
  } else {
    log('\n❌ Ainda há problemas na autenticação', 'red');
    log('💡 Verifique se o backend está rodando e se o JWT_SECRET está correto', 'yellow');
  }
  
  log('\n🔧 Para mais informações, acesse:', 'cyan');
  log(`- Diagnóstico: ${BACKEND_URL}/api/users-debug/full-diagnosis`, 'blue');
  log(`- Gerar JWT: ${BACKEND_URL}/api/users-debug/generate-test-jwt`, 'blue');
  log(`- Testar JWT: ${BACKEND_URL}/api/users-debug/test-jwt-validation`, 'blue');
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    log(`\n💥 Erro fatal: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { generateTestJWT, testBackendHealth, testUsersAPI };