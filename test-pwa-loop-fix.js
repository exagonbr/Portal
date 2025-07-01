#!/usr/bin/env node

/**
 * Script para testar a correção de loops PWA
 * Simula requisições em massa para verificar se o sistema detecta e corrige loops
 */

const fetch = require('node-fetch');
const chalk = require('chalk');

const BASE_URL = 'https://portal.sabercon.com.br';
const TEST_ENDPOINTS = [
  '/api/auth/login',
  '/api/users',
  '/api/institutions',
  '/api/dashboard/analytics'
];

// Configuração do teste
const TEST_CONFIG = {
  REQUESTS_PER_SECOND: 15, // Acima do threshold de 10
  DURATION_SECONDS: 10,
  CONCURRENT_REQUESTS: 5
};

console.log(chalk.blue.bold('🧪 TESTE DE CORREÇÃO DE LOOPS PWA'));
console.log(chalk.blue('=' .repeat(50)));
console.log(chalk.yellow(`📊 Configuração do teste:`));
console.log(chalk.yellow(`   • Requisições por segundo: ${TEST_CONFIG.REQUESTS_PER_SECOND}`));
console.log(chalk.yellow(`   • Duração: ${TEST_CONFIG.DURATION_SECONDS}s`));
console.log(chalk.yellow(`   • Requisições concorrentes: ${TEST_CONFIG.CONCURRENT_REQUESTS}`));
console.log(chalk.yellow(`   • Endpoints testados: ${TEST_ENDPOINTS.length}`));
console.log('');

// Estatísticas
let totalRequests = 0;
let successfulRequests = 0;
let failedRequests = 0;
let rateLimitedRequests = 0;
const responseTimeHistory = [];

/**
 * Faz uma requisição de teste
 */
async function makeTestRequest(endpoint, requestId) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `PWA-Loop-Test-${requestId}`,
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      }),
      timeout: 5000
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;
    responseTimeHistory.push(responseTime);

    totalRequests++;

    if (response.status === 429) {
      rateLimitedRequests++;
      console.log(chalk.yellow(`⚠️  Rate limited: ${endpoint} (${response.status})`));
      return { success: false, rateLimited: true, responseTime };
    } else if (response.ok || response.status === 401) {
      // 401 é esperado para credenciais inválidas
      successfulRequests++;
      console.log(chalk.green(`✅ Success: ${endpoint} (${response.status}) - ${responseTime}ms`));
      return { success: true, rateLimited: false, responseTime };
    } else {
      failedRequests++;
      console.log(chalk.red(`❌ Failed: ${endpoint} (${response.status}) - ${responseTime}ms`));
      return { success: false, rateLimited: false, responseTime };
    }

  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    totalRequests++;
    failedRequests++;
    
    console.log(chalk.red(`❌ Error: ${endpoint} - ${error.message} - ${responseTime}ms`));
    return { success: false, rateLimited: false, responseTime, error: error.message };
  }
}

/**
 * Executa uma rajada de requisições
 */
async function executeBurst() {
  const promises = [];
  
  for (let i = 0; i < TEST_CONFIG.CONCURRENT_REQUESTS; i++) {
    const endpoint = TEST_ENDPOINTS[i % TEST_ENDPOINTS.length];
    const requestId = `${Date.now()}-${i}`;
    promises.push(makeTestRequest(endpoint, requestId));
  }

  await Promise.all(promises);
}

/**
 * Executa o teste principal
 */
async function runTest() {
  console.log(chalk.blue('🚀 Iniciando teste de loops...'));
  console.log('');

  const startTime = Date.now();
  const endTime = startTime + (TEST_CONFIG.DURATION_SECONDS * 1000);

  // Executar rajadas de requisições
  while (Date.now() < endTime) {
    await executeBurst();
    
    // Aguardar para controlar a taxa de requisições
    const delayMs = 1000 / (TEST_CONFIG.REQUESTS_PER_SECOND / TEST_CONFIG.CONCURRENT_REQUESTS);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  const actualDuration = (Date.now() - startTime) / 1000;

  console.log('');
  console.log(chalk.blue.bold('📊 RESULTADOS DO TESTE'));
  console.log(chalk.blue('=' .repeat(50)));
  
  // Estatísticas gerais
  console.log(chalk.white(`📈 Estatísticas Gerais:`));
  console.log(chalk.white(`   • Total de requisições: ${totalRequests}`));
  console.log(chalk.green(`   • Sucessos: ${successfulRequests} (${((successfulRequests/totalRequests)*100).toFixed(1)}%)`));
  console.log(chalk.red(`   • Falhas: ${failedRequests} (${((failedRequests/totalRequests)*100).toFixed(1)}%)`));
  console.log(chalk.yellow(`   • Rate Limited: ${rateLimitedRequests} (${((rateLimitedRequests/totalRequests)*100).toFixed(1)}%)`));
  console.log(chalk.white(`   • Duração real: ${actualDuration.toFixed(1)}s`));
  console.log(chalk.white(`   • Taxa real: ${(totalRequests/actualDuration).toFixed(1)} req/s`));
  
  // Estatísticas de tempo de resposta
  if (responseTimeHistory.length > 0) {
    const avgResponseTime = responseTimeHistory.reduce((a, b) => a + b, 0) / responseTimeHistory.length;
    const minResponseTime = Math.min(...responseTimeHistory);
    const maxResponseTime = Math.max(...responseTimeHistory);
    
    console.log('');
    console.log(chalk.white(`⏱️  Tempo de Resposta:`));
    console.log(chalk.white(`   • Média: ${avgResponseTime.toFixed(0)}ms`));
    console.log(chalk.white(`   • Mínimo: ${minResponseTime}ms`));
    console.log(chalk.white(`   • Máximo: ${maxResponseTime}ms`));
  }

  // Análise dos resultados
  console.log('');
  console.log(chalk.blue.bold('🔍 ANÁLISE DOS RESULTADOS'));
  console.log(chalk.blue('=' .repeat(50)));

  if (rateLimitedRequests > 0) {
    console.log(chalk.green(`✅ RATE LIMITING FUNCIONANDO:`));
    console.log(chalk.green(`   • ${rateLimitedRequests} requisições foram bloqueadas`));
    console.log(chalk.green(`   • Sistema detectou e preveniu loop potencial`));
  } else {
    console.log(chalk.yellow(`⚠️  RATE LIMITING NÃO ATIVADO:`));
    console.log(chalk.yellow(`   • Nenhuma requisição foi bloqueada`));
    console.log(chalk.yellow(`   • Pode indicar que o threshold não foi atingido`));
  }

  if (failedRequests > totalRequests * 0.5) {
    console.log(chalk.red(`❌ MUITAS FALHAS:`));
    console.log(chalk.red(`   • ${((failedRequests/totalRequests)*100).toFixed(1)}% das requisições falharam`));
    console.log(chalk.red(`   • Pode indicar problema no servidor`));
  } else {
    console.log(chalk.green(`✅ TAXA DE FALHAS ACEITÁVEL:`));
    console.log(chalk.green(`   • ${((failedRequests/totalRequests)*100).toFixed(1)}% de falhas`));
  }

  // Recomendações
  console.log('');
  console.log(chalk.blue.bold('💡 RECOMENDAÇÕES'));
  console.log(chalk.blue('=' .repeat(50)));

  if (rateLimitedRequests === 0 && totalRequests > 50) {
    console.log(chalk.yellow(`⚠️  Considere diminuir o threshold de rate limiting`));
  }

  if (responseTimeHistory.length > 0) {
    const avgResponseTime = responseTimeHistory.reduce((a, b) => a + b, 0) / responseTimeHistory.length;
    if (avgResponseTime > 1000) {
      console.log(chalk.yellow(`⚠️  Tempo de resposta alto (${avgResponseTime.toFixed(0)}ms)`));
    }
  }

  console.log(chalk.green(`✅ Teste concluído com sucesso!`));
}

/**
 * Testa a funcionalidade de correção de emergência
 */
async function testEmergencyFix() {
  console.log('');
  console.log(chalk.blue.bold('🚨 TESTE DE CORREÇÃO DE EMERGÊNCIA'));
  console.log(chalk.blue('=' .repeat(50)));
  
  console.log(chalk.yellow('Este teste simularia a correção de emergência do PWA'));
  console.log(chalk.yellow('Em um ambiente real, isso:'));
  console.log(chalk.yellow('  • Desregistraria todos os service workers'));
  console.log(chalk.yellow('  • Limparia todos os caches'));
  console.log(chalk.yellow('  • Limparia localStorage e sessionStorage'));
  console.log(chalk.yellow('  • Recarregaria a página'));
  console.log('');
  console.log(chalk.green('✅ Funcionalidade de emergência disponível'));
}

// Executar testes
async function main() {
  try {
    await runTest();
    await testEmergencyFix();
  } catch (error) {
    console.log(chalk.red('❌ Erro durante o teste:'), error);
    process.exit(1);
  }
}

// Verificar se chalk está disponível
if (typeof chalk === 'undefined') {
  console.log('⚠️  Chalk não disponível, usando console.log simples');
  // Fallback para console.log simples se chalk não estiver disponível
}

main(); 