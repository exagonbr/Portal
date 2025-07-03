/**
 * Script de teste para verificar o sistema de prevenção de loops
 * Execute com: node test-loop-prevention.js
 */

const fetch = require('node-fetch');
const chalk = require('chalk');

const BASE_URL = process.env.BASE_URL || 'https://portal.sabercon.com.br';
const LOGIN_ENDPOINT = '/api/auth/login';

console.log(chalk.blue('🧪 Teste do Sistema de Prevenção de Loops'));
console.log(chalk.gray(`URL Base: ${BASE_URL}`));
console.log(chalk.gray('-----------------------------------\n'));

/**
 * Simula um loop de requisições
 */
async function simulateLoop() {
  console.log(chalk.yellow('📍 Teste 1: Simulando loop de requisições rápidas'));
  
  const requests = [];
  const startTime = Date.now();
  
  // Fazer 10 requisições muito rápidas
  for (let i = 0; i < 10; i++) {
    requests.push(
      fetch(`${BASE_URL}${LOGIN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Loop-Test-Agent'
        },
        body: JSON.stringify({
          email: 'test@loop.com',
          password: 'test123'
        })
      }).then(res => ({
        status: res.status,
        statusText: res.statusText,
        headers: res.headers.raw()
      })).catch(err => ({
        error: err.message
      }))
    );
  }
  
  const results = await Promise.all(requests);
  const endTime = Date.now();
  
  console.log(chalk.gray(`Tempo total: ${endTime - startTime}ms`));
  console.log(chalk.gray(`Requisições enviadas: ${requests.length}`));
  
  // Analisar resultados
  let blocked = 0;
  let success = 0;
  let errors = 0;
  
  results.forEach((result, index) => {
    if (result.error) {
      errors++;
      console.log(chalk.red(`  ❌ Requisição ${index + 1}: Erro - ${result.error}`));
    } else if (result.status === 429) {
      blocked++;
      console.log(chalk.yellow(`  🚫 Requisição ${index + 1}: Bloqueada (429)`));
    } else {
      success++;
      console.log(chalk.green(`  ✅ Requisição ${index + 1}: ${result.status} ${result.statusText}`));
    }
  });
  
  console.log(chalk.blue('\n📊 Resumo:'));
  console.log(chalk.green(`  Sucesso: ${success}`));
  console.log(chalk.yellow(`  Bloqueadas: ${blocked}`));
  console.log(chalk.red(`  Erros: ${errors}`));
  
  if (blocked > 0) {
    console.log(chalk.green('\n✅ Sistema de prevenção está funcionando!'));
  } else {
    console.log(chalk.red('\n⚠️  Nenhuma requisição foi bloqueada - verificar sistema'));
  }
}

/**
 * Testa recuperação após bloqueio
 */
async function testRecovery() {
  console.log(chalk.yellow('\n📍 Teste 2: Verificando recuperação após bloqueio'));
  
  // Aguardar 15 segundos
  console.log(chalk.gray('Aguardando 15 segundos...'));
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  try {
    const response = await fetch(`${BASE_URL}${LOGIN_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Loop-Test-Agent'
      },
      body: JSON.stringify({
        email: 'test@recovery.com',
        password: 'test123'
      })
    });
    
    if (response.status === 429) {
      console.log(chalk.yellow('⏳ Ainda bloqueado após 15 segundos'));
    } else {
      console.log(chalk.green(`✅ Sistema recuperado! Status: ${response.status}`));
    }
  } catch (error) {
    console.log(chalk.red(`❌ Erro na recuperação: ${error.message}`));
  }
}

/**
 * Testa detecção de padrões
 */
async function testPatternDetection() {
  console.log(chalk.yellow('\n📍 Teste 3: Detecção de padrões suspeitos'));
  
  // Fazer requisições com intervalo de 500ms
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(`${BASE_URL}${LOGIN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `Pattern-Test-${i}`
        },
        body: JSON.stringify({
          email: `test${i}@pattern.com`,
          password: 'test123'
        })
      });
      
      console.log(chalk.gray(`  Requisição ${i + 1}: ${response.status} ${response.statusText}`));
      
      if (response.status === 429) {
        const data = await response.json();
        console.log(chalk.yellow(`  🚫 Bloqueado: ${data.message}`));
        break;
      }
      
      // Aguardar 500ms entre requisições
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(chalk.red(`  ❌ Erro: ${error.message}`));
    }
  }
}

/**
 * Executa todos os testes
 */
async function runTests() {
  try {
    await simulateLoop();
    await testRecovery();
    await testPatternDetection();
    
    console.log(chalk.blue('\n🏁 Testes concluídos!'));
  } catch (error) {
    console.log(chalk.red('\n❌ Erro durante os testes:'), error);
  }
}

// Executar testes
runTests(); 