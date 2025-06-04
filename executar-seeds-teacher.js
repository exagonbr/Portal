#!/usr/bin/env node

/**
 * Script para executar seeds de atualização de roles de teachers
 * 
 * Uso:
 *   node executar-seeds-teacher.js
 * 
 * Opções:
 *   --prisma    : Executar versão para Prisma
 *   --rollback  : Executar rollback dos seeds
 *   --dry-run   : Apenas mostrar o que seria executado
 */

const { exec } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const isPrisma = args.includes('--prisma');
const isRollback = args.includes('--rollback');
const isDryRun = args.includes('--dry-run');

console.log('🚀 Script de execução de seeds para atualização de roles TEACHER');
console.log('=' .repeat(60));

if (isDryRun) {
  console.log('🔍 MODO DRY-RUN: Apenas mostrando comandos que seriam executados\n');
}

// Definir o seed file baseado na opção
const seedFile = isPrisma 
  ? 'backend/seeds/999_update_teacher_roles_prisma.ts'
  : 'backend/seeds/999_update_teacher_roles.ts';

console.log(`📁 Arquivo de seed: ${seedFile}`);
console.log(`🔧 Modo: ${isPrisma ? 'Prisma' : 'Knex padrão'}`);
console.log(`⚡ Operação: ${isRollback ? 'Rollback' : 'Executar seed'}`);

if (isDryRun) {
  console.log('\n🔍 Comandos que seriam executados:');
  console.log(`   cd backend`);
  
  if (isRollback) {
    console.log(`   npx knex seed:rollback --specific=${path.basename(seedFile, '.ts')}`);
  } else {
    console.log(`   npx knex seed:run --specific=${path.basename(seedFile, '.ts')}`);
  }
  
  console.log('\n💡 Para executar de verdade, remova a flag --dry-run');
  process.exit(0);
}

// Verificar se o arquivo de seed existe
const fs = require('fs');
if (!fs.existsSync(seedFile)) {
  console.error(`❌ Arquivo de seed não encontrado: ${seedFile}`);
  process.exit(1);
}

console.log('\n⏳ Executando seed...');

// Definir o comando
const command = isRollback 
  ? `cd backend && npx knex seed:rollback --specific=${path.basename(seedFile, '.ts')}`
  : `cd backend && npx knex seed:run --specific=${path.basename(seedFile, '.ts')}`;

console.log(`🔧 Comando: ${command}`);

// Executar o comando
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Erro na execução: ${error.message}`);
    process.exit(1);
  }
  
  if (stderr) {
    console.error(`⚠️ Stderr: ${stderr}`);
  }
  
  console.log('\n📋 Saída:');
  console.log(stdout);
  
  console.log('\n✅ Seed executado com sucesso!');
  
  // Sugestões pós-execução
  console.log('\n💡 Próximos passos sugeridos:');
  console.log('   1. Verificar os logs acima para confirmar que tudo ocorreu conforme esperado');
  console.log('   2. Testar o sistema para verificar se os usuários teachers têm as permissões corretas');
  console.log('   3. Se necessário, execute o rollback com: node executar-seeds-teacher.js --rollback');
  
  if (isPrisma) {
    console.log('   4. Considere regenerar o cliente Prisma: npx prisma generate');
  }
});

// Mostrar ajuda se necessário
if (args.includes('--help') || args.includes('-h')) {
  console.log('\n📚 Ajuda:');
  console.log('  node executar-seeds-teacher.js [opções]');
  console.log('');
  console.log('  Opções:');
  console.log('    --prisma      Usar versão do seed compatível com Prisma');
  console.log('    --rollback    Executar rollback (reverter alterações)');
  console.log('    --dry-run     Apenas mostrar comandos sem executar');
  console.log('    --help, -h    Mostrar esta ajuda');
  console.log('');
  console.log('  Exemplos:');
  console.log('    node executar-seeds-teacher.js                    # Executar seed padrão');
  console.log('    node executar-seeds-teacher.js --prisma           # Executar versão Prisma');
  console.log('    node executar-seeds-teacher.js --rollback         # Reverter alterações');
  console.log('    node executar-seeds-teacher.js --dry-run          # Visualizar comandos');
  process.exit(0);
} 