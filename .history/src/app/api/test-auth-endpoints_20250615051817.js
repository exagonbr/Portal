#!/usr/bin/env node

const BASE_URL = 'http://localhost:3002';

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Usuários de teste
const testUsers = [
  {
    email: 'admin@sabercon.edu.br',
    password: 'password123',
    expectedRole: 'SYSTEM_ADMIN'
  },
  {
    email: 'gestor@sabercon.edu.br',
    password: 'password123',
    expectedRole: 'INSTITUTION_ADMIN'
  },
  {
    email: 'coordenador@sabercon.edu.br',
    password: 'password123',
    expectedRole: 'ACADEMIC_COORDINATOR'
  },
  {
    email: 'professor@sabercon.edu.br',
    password: 'password123',
    expectedRole: 'TEACHER'
  },
  {
    email: 'estudante@sabercon.edu.br',
    password: 'password123',
    expectedRole: 'STUDENT'
  },
  {
    email: 'usuario@invalido.com',
    password: 'senhaerrada',
    expectedRole: null, // Deve falhar
    shouldFail: true
  }
];

async function testLogin(user) {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password
      }),
    });

    const data = await response.json();

    if (user.shouldFail) {
      if (!response.ok) {
        log(`✅ ${user.email}: Falha esperada - ${data.message}`, 'green');
        return { success: true, expected: true };
      } else {
        log(`❌ ${user.email}: Deveria ter falhado mas passou`, 'red');
        return { success: false, expected: false };
      }
    } else {
      if (response.ok && data.success) {
        const roleMatch = data.user.role === user.expectedRole;
        if (roleMatch) {
          log(`✅ ${user.email}: Login OK - Role: ${data.user.role}`, 'green');
          return { success: true, expected: true, token: data.token || 'no-token', user: data.user };
        } else {
          log(`❌ ${user.email}: Role incorreta. Esperado: ${user.expectedRole}, Recebido: ${data.user.role}`, 'red');
          return { success: false, expected: false };
        }
      } else {
        log(`❌ ${user.email}: Login falhou - ${data.message}`, 'red');
        return { success: false, expected: false };
      }
    }
  } catch (error) {
    log(`❌ ${user.email}: Erro de conexão - ${error.message}`, 'red');
    return { success: false, expected: false, error: error.message };
  }
}

async function testHealthEndpoint() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    log(`\n🏥 Health Check:`, 'blue');
    log(`   Status: ${data.status}`, data.status === 'healthy' ? 'green' : 'yellow');
    log(`   Frontend: ${data.frontend.status}`);
    log(`   Backend: ${data.backend.status} (${data.backend.url})`);
    log(`   Authentication: ${data.services.authentication}`);
    
    if (data.backend.responseTime) {
      log(`   Response Time: ${data.backend.responseTime}ms`);
    }
    
    if (data.backend.error) {
      log(`   Backend Error: ${data.backend.error}`, 'yellow');
    }
    
    return data;
  } catch (error) {
    log(`❌ Health check falhou: ${error.message}`, 'red');
    return null;
  }
}

async function testProtectedEndpoint(token, user) {
  if (!token || token === 'no-token') {
    log(`⚠️  Sem token para testar endpoint protegido`, 'yellow');
    return false;
  }

  try {
    // Testar um endpoint que requer autenticação
    const response = await fetch(`${BASE_URL}/api/dashboard/analytics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': `auth_token=${token}`
      }
    });

    if (response.ok) {
      log(`✅ Endpoint protegido acessível para ${user.name} (${user.role})`, 'green');
      return true;
    } else {
      log(`❌ Endpoint protegido negou acesso para ${user.name}: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erro ao testar endpoint protegido: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('🚀 Iniciando testes de autenticação...', 'bold');
  log('=' .repeat(50), 'blue');

  // Testar health primeiro
  const healthData = await testHealthEndpoint();
  
  log('\n🔐 Testando logins:', 'blue');
  log('-'.repeat(30));

  const results = [];
  
  for (const user of testUsers) {
    const result = await testLogin(user);
    results.push({ user, result });
    
    // Se login foi bem-sucedido, testar endpoint protegido
    if (result.success && result.token && result.user) {
      await testProtectedEndpoint(result.token, result.user);
    }
    
    // Pequena pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Resumo
  log('\n📊 Resumo dos Testes:', 'bold');
  log('=' .repeat(50), 'blue');
  
  const successful = results.filter(r => r.result.success && r.result.expected).length;
  const failed = results.filter(r => !r.result.success || !r.result.expected).length;
  
  log(`✅ Sucessos: ${successful}`, 'green');
  log(`❌ Falhas: ${failed}`, failed > 0 ? 'red' : 'green');
  
  if (healthData) {
    log(`🏥 Status do Sistema: ${healthData.status}`, 
         healthData.status === 'healthy' ? 'green' : 'yellow');
    
    if (healthData.status === 'degraded') {
      log(`⚠️  Sistema em modo fallback - Backend indisponível`, 'yellow');
      log(`   Autenticação funcionando via fallback local`, 'yellow');
    }
  }

  log('\n🎯 Credenciais de Teste Disponíveis:', 'blue');
  log('-'.repeat(40));
  testUsers.filter(u => !u.shouldFail).forEach(user => {
    log(`   ${user.email} / ${user.password} (${user.expectedRole})`);
  });

  log('\n✨ Testes concluídos!', 'bold');
  
  return { successful, failed, total: results.length };
}

// Executar testes
if (require.main === module) {
  runTests().catch(error => {
    log(`💥 Erro fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests, testLogin, testHealthEndpoint }; 