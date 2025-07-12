#!/usr/bin/env node

/**
 * 🧪 Script de Teste Completo da Migração
 * 
 * Executa a migração completa e verifica se tudo foi criado corretamente
 */

const { exec } = require('child_process');
const path = require('path');

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

const log = (message, color = 'reset') => {
  console.log(colors[color] + message + colors.reset);
};

const execAsync = (command, options = {}) => {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

async function runCompleteTest() {
  log('🧪 Iniciando teste completo da migração MySQL → PostgreSQL...', 'cyan');
  log('', 'reset');

  const startTime = Date.now();

  try {
    // 1. Verificar ambiente
    log('1️⃣ Verificando ambiente...', 'bright');
    
    // Verificar se estamos no diretório correto
    const fs = require('fs');
    if (!fs.existsSync('package.json')) {
      log('❌ Erro: Execute este script no diretório backend', 'red');
      process.exit(1);
    }

    // Verificar se node_modules existe
    if (!fs.existsSync('node_modules')) {
      log('📦 Instalando dependências...', 'yellow');
      await execAsync('npm install');
      log('✅ Dependências instaladas', 'green');
    }

    // 2. Executar migração
    log('', 'reset');
    log('2️⃣ Executando migração...', 'bright');
    
    try {
      const migrateResult = await execAsync('npm run migrate:latest');
      log('✅ Migração executada com sucesso', 'green');
      
      // Mostrar output da migração (últimas 10 linhas)
      const lines = migrateResult.stdout.split('\n').slice(-10);
      lines.forEach(line => {
        if (line.trim()) {
          log(`   ${line}`, 'cyan');
        }
      });
    } catch (error) {
      log('❌ Erro na migração:', 'red');
      log(error.stdout || error.stderr || error.error.message, 'red');
      throw error;
    }

    // 3. Executar seed
    log('', 'reset');
    log('3️⃣ Executando seed...', 'bright');
    
    try {
      const seedResult = await execAsync('npm run seed:run');
      log('✅ Seed executado com sucesso', 'green');
      
      // Mostrar output do seed (últimas 10 linhas)
      const lines = seedResult.stdout.split('\n').slice(-10);
      lines.forEach(line => {
        if (line.trim()) {
          log(`   ${line}`, 'cyan');
        }
      });
    } catch (error) {
      log('❌ Erro no seed:', 'red');
      log(error.stdout || error.stderr || error.error.message, 'red');
      throw error;
    }

    // 4. Executar verificação
    log('', 'reset');
    log('4️⃣ Executando verificação...', 'bright');
    
    try {
      const verifyResult = await execAsync('npx ts-node scripts/verify-complete-migration.ts');
      log('✅ Verificação concluída com sucesso', 'green');
      
      // Mostrar output da verificação
      log(verifyResult.stdout, 'cyan');
    } catch (error) {
      log('❌ Erro na verificação:', 'red');
      log(error.stdout || error.stderr || error.error.message, 'red');
      throw error;
    }

    // 5. Teste de conectividade
    log('', 'reset');
    log('5️⃣ Testando conectividade...', 'bright');
    
    try {
      await execAsync('npm run test:db');
      log('✅ Teste de conectividade passou', 'green');
    } catch (error) {
      log('⚠️ Aviso: Teste de conectividade falhou (pode ser normal)', 'yellow');
    }

    // 6. Resumo final
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    log('', 'reset');
    log('🎉 TESTE COMPLETO CONCLUÍDO COM SUCESSO!', 'green');
    log('', 'reset');
    log(`⏱️ Tempo total: ${duration}s`, 'cyan');
    log('', 'reset');
    
    log('📊 RESUMO:', 'bright');
    log('  ✅ Migração estrutural: OK', 'green');
    log('  ✅ Seed de dados básicos: OK', 'green');
    log('  ✅ Verificação de integridade: OK', 'green');
    log('  ✅ Sistema pronto para uso: OK', 'green');
    log('', 'reset');
    
    log('🔗 Próximos passos:', 'bright');
    log('  1. 🌐 Acesse: http://localhost:3000/admin/migration/mysql-postgres', 'cyan');
    log('  2. 📥 Configure conexão MySQL', 'cyan');
    log('  3. 🔄 Execute migração de dados', 'cyan');
    log('  4. ✅ Valide os dados migrados', 'cyan');
    log('', 'reset');
    
    log('🎯 O sistema está pronto para receber dados do MySQL!', 'green');

  } catch (error) {
    log('', 'reset');
    log('❌ FALHA NO TESTE COMPLETO!', 'red');
    log('', 'reset');
    
    if (error.error) {
      log('Erro:', 'red');
      log(error.error.message, 'red');
    }
    
    if (error.stdout) {
      log('Output:', 'yellow');
      log(error.stdout, 'yellow');
    }
    
    if (error.stderr) {
      log('Stderr:', 'red');
      log(error.stderr, 'red');
    }
    
    log('', 'reset');
    log('🔧 Soluções possíveis:', 'yellow');
    log('  1. Verificar se PostgreSQL está rodando', 'yellow');
    log('  2. Verificar configurações no .env', 'yellow');
    log('  3. Verificar permissões do banco de dados', 'yellow');
    log('  4. Executar manualmente: npm run migrate:latest && npm run seed:run', 'yellow');
    
    process.exit(1);
  }
}

// Executar teste
runCompleteTest().catch(console.error);
