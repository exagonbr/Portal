#!/usr/bin/env node

/**
 * Script para testar as correções de timeout da API /api/users/stats
 */

const chalk = require('chalk');

const BASE_URL = process.env.TEST_URL || 'https://portal.sabercon.com.br';
const BACKEND_URL = process.env.BACKEND_URL || 'https://portal.sabercon.com.br/api';

console.log(chalk.blue.bold('🧪 TESTE DE CORREÇÃO DE TIMEOUT - API Users Stats\n'));

/**
 * Testa o endpoint frontend /api/users/stats
 */
async function testFrontendEndpoint() {
  console.log(chalk.yellow('📊 Testando endpoint frontend /api/users/stats'));
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}/api/users/stats`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    const duration = Date.now() - startTime;
    const result = await response.json();
    
    console.log(`⏱️  Duração: ${duration}ms`);
    console.log(`📡 Status: ${response.status}`);
    console.log(`✅ Sucesso: ${result.success}`);
    
    if (result.success && result.data) {
      console.log(`👥 Total de usuários: ${result.data.total_users}`);
      console.log(`🟢 Usuários ativos: ${result.data.active_users}`);
      console.log(`📈 Registros recentes: ${result.data.recent_registrations}`);
      
      if (result.data.users_by_role) {
        console.log('👤 Usuários por role:');
        Object.entries(result.data.users_by_role).forEach(([role, count]) => {
          console.log(`   ${role}: ${count}`);
        });
      }
    }
    
    // Verificar se foi resolvido em tempo aceitável
    if (duration < 10000) {
      console.log(chalk.green('✅ SUCESSO: Resposta em tempo aceitável!'));
    } else if (duration < 30000) {
      console.log(chalk.yellow('⚠️  ATENÇÃO: Resposta lenta mas dentro do timeout'));
    } else {
      console.log(chalk.red('❌ FALHA: Ainda muito lento'));
    }
    
    return { success: true, duration, status: response.status };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(chalk.red(`❌ ERRO após ${duration}ms: ${error.message}`));
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      console.log(chalk.red('🚨 TIMEOUT DETECTADO - Correção não funcionou completamente'));
    }
    
    return { success: false, duration, error: error.message };
  }
}

/**
 * Testa o endpoint backend direto (se acessível)
 */
async function testBackendEndpoint() {
  console.log(chalk.yellow('\n📊 Testando endpoint backend direto'));
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${BACKEND_URL}/users/stats`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    const duration = Date.now() - startTime;
    const result = await response.json();
    
    console.log(`⏱️  Duração: ${duration}ms`);
    console.log(`📡 Status: ${response.status}`);
    console.log(`✅ Sucesso: ${result.success}`);
    
    if (duration < 5000) {
      console.log(chalk.green('✅ EXCELENTE: Backend otimizado!'));
    } else if (duration < 15000) {
      console.log(chalk.yellow('⚠️  OK: Backend melhorou mas ainda pode otimizar'));
    } else {
      console.log(chalk.red('❌ PROBLEMA: Backend ainda lento'));
    }
    
    return { success: true, duration, status: response.status };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(chalk.red(`❌ ERRO após ${duration}ms: ${error.message}`));
    return { success: false, duration, error: error.message };
  }
}

/**
 * Teste de carga - múltiplas requisições simultâneas
 */
async function testLoad() {
  console.log(chalk.yellow('\n🔥 Teste de carga - 5 requisições simultâneas'));
  
  const promises = Array.from({ length: 5 }, (_, i) => {
    return fetch(`${BASE_URL}/api/users/stats`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    }).then(async (response) => {
      const result = await response.json();
      return {
        index: i + 1,
        status: response.status,
        success: result.success,
        hasData: !!result.data
      };
    }).catch(error => ({
      index: i + 1,
      error: error.message
    }));
  });
  
  const startTime = Date.now();
  const results = await Promise.allSettled(promises);
  const duration = Date.now() - startTime;
  
  console.log(`⏱️  Duração total: ${duration}ms`);
  
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - successful;
  
  console.log(`✅ Sucessos: ${successful}/${results.length}`);
  console.log(`❌ Falhas: ${failed}/${results.length}`);
  
  if (successful >= 4) {
    console.log(chalk.green('✅ EXCELENTE: Sistema suporta carga simultânea!'));
  } else if (successful >= 2) {
    console.log(chalk.yellow('⚠️  OK: Algumas falhas sob carga'));
  } else {
    console.log(chalk.red('❌ PROBLEMA: Sistema não suporta carga'));
  }
  
  return { successful, failed, duration };
}

/**
 * Executa todos os testes
 */
async function runAllTests() {
  try {
    console.log(`🎯 Testando contra: ${BASE_URL}`);
    console.log(`🎯 Backend: ${BACKEND_URL}\n`);
    
    // Teste 1: Endpoint frontend
    const frontendResult = await testFrontendEndpoint();
    
    // Teste 2: Endpoint backend (se acessível)
    const backendResult = await testBackendEndpoint();
    
    // Teste 3: Carga
    const loadResult = await testLoad();
    
    // Resumo
    console.log(chalk.blue.bold('\n📋 RESUMO DOS TESTES'));
    console.log('='.repeat(50));
    
    console.log(`Frontend: ${frontendResult.success ? '✅' : '❌'} (${frontendResult.duration}ms)`);
    console.log(`Backend:  ${backendResult.success ? '✅' : '❌'} (${backendResult.duration}ms)`);
    console.log(`Carga:    ${loadResult.successful}/${loadResult.successful + loadResult.failed} sucessos (${loadResult.duration}ms)`);
    
    // Avaliação geral
    const allGood = frontendResult.success && 
                   frontendResult.duration < 10000 && 
                   loadResult.successful >= 4;
    
    if (allGood) {
      console.log(chalk.green.bold('\n🎉 CORREÇÃO DE TIMEOUT FUNCIONANDO PERFEITAMENTE!'));
    } else if (frontendResult.success) {
      console.log(chalk.yellow.bold('\n⚠️  CORREÇÃO PARCIAL - Ainda há espaço para melhorias'));
    } else {
      console.log(chalk.red.bold('\n❌ CORREÇÃO NÃO FUNCIONOU - Revisar implementação'));
    }
    
  } catch (error) {
    console.log(chalk.red.bold('\n💥 ERRO GERAL NO TESTE:'), error);
  }
}

// Executar testes
if (require.main === module) {
  runAllTests();
}

module.exports = { testFrontendEndpoint, testBackendEndpoint, testLoad };
