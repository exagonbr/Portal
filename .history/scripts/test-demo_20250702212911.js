#!/usr/bin/env node

/**
 * Script de Demonstração das Melhorias
 * Testa algumas rotas específicas para mostrar os novos recursos
 */

const { makeRequest, authenticate, testRoute, getStatusMessage } = require('./run-api-test.js');

const CONFIG = {
  baseUrl: 'http://localhost:3000',
  credentials: {
    email: 'admin@sabercon.edu.br',
    password: 'password123'
  }
};

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function demonstrateFeatures() {
  log('🚀 DEMONSTRAÇÃO DAS MELHORIAS NO SCRIPT DE API', 'bright');
  log('═'.repeat(60), 'blue');
  
  // Rotas de exemplo para testar
  const testRoutes = [
    {
      path: '/auth/login',
      methods: ['POST'],
      hasAuth: false,
      description: 'Endpoint de login'
    },
    {
      path: '/users',
      methods: ['GET', 'POST'],
      hasAuth: true,
      description: 'Gerenciamento de usuários'
    },
    {
      path: '/courses',
      methods: ['GET'],
      hasAuth: true,
      description: 'Lista de cursos'
    }
  ];

  log('\n🔐 Testando autenticação...', 'cyan');
  const auth = await authenticate();
  
  if (auth.success) {
    log('✅ Autenticação bem-sucedida!', 'green');
    log(`👤 Token obtido: ${auth.token ? 'Sim' : 'Não'}`, 'gray');
  } else {
    log('❌ Falha na autenticação', 'red');
  }

  log('\n🧪 Testando rotas com STATUS CODES detalhados:', 'cyan');
  log('─'.repeat(60), 'gray');

  for (const route of testRoutes) {
    log(`\n📍 Testando: ${route.path} ${route.hasAuth ? '🔒' : '🔓'}`, 'yellow');
    log(`📝 ${route.description}`, 'gray');
    
    const results = await testRoute(route, auth.token);
    
    results.forEach(test => {
      const statusColor = test.status >= 200 && test.status < 300 ? 'green' : 
                         test.status >= 300 && test.status < 400 ? 'yellow' : 'red';
      const authIcon = test.authUsed ? '🔒' : '🔓';
      const statusDisplay = test.status === 0 ? 'ERR' : test.status;
      
      log(`  ${test.method.padEnd(6)} ${authIcon} ${statusDisplay} ${test.statusText} (${test.responseTime}ms)`, statusColor);
      
      if (test.message && test.message !== test.statusText) {
        log(`    💬 ${test.message}`, 'gray');
      }
    });
  }

  log('\n📊 RECURSOS DEMONSTRADOS:', 'bright');
  log('─'.repeat(60), 'gray');
  log('✅ Status codes detalhados para cada método HTTP', 'green');
  log('✅ Indicadores visuais de autenticação (🔒/🔓)', 'green');
  log('✅ Tempo de resposta por requisição', 'green');
  log('✅ Mensagens de erro contextuais', 'green');
  log('✅ Cores diferenciadas por tipo de status', 'green');
  log('✅ Detecção automática de rotas que precisam de auth', 'green');

  log('\n🎯 PRÓXIMOS PASSOS:', 'cyan');
  log('1. Execute: node scripts/run-api-test.js', 'blue');
  log('2. Veja o relatório completo com todas as rotas', 'blue');
  log('3. Analise os status codes de cada endpoint', 'blue');
  log('4. Identifique rotas que precisam de correção', 'blue');

  log('\n🎉 Demonstração concluída!', 'bright');
}

// Executar demonstração
if (require.main === module) {
  demonstrateFeatures().catch(error => {
    log(`💥 Erro na demonstração: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { demonstrateFeatures };