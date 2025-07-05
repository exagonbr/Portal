#!/usr/bin/env node

/**
 * Script para criar usuários padrão no sistema
 * 
 * Este script cria usuários para todas as roles do sistema:
 * - SYSTEM_ADMIN: admin@sabercon.edu.br
 * - INSTITUTION_MANAGER: gestor@sabercon.edu.br
 * - TEACHER: professor@sabercon.edu.br
 * - STUDENT: julia.c@ifsp.com
 * - COORDINATOR: coordenador@sabercon.edu.com
 * - GUARDIAN: renato@gmail.com
 * 
 * Todos os usuários são criados com a senha: password123
 */

const { execSync } = require('child_process');
const path = require('path');

// Caminho para o script do migrador
const migratorScript = path.resolve(__dirname, 'mysql-to-postgres-migrator.ts');

console.log('🚀 Iniciando criação de usuários padrão...');
console.log('📝 Executando mysql-to-postgres-migrator.ts com flag --create-default-users');

try {
  // Executar o script com ts-node e a flag para criar usuários padrão
  execSync(`npx ts-node ${migratorScript} --create-default-users`, { stdio: 'inherit' });
  
  console.log('\n✅ Processo concluído com sucesso!');
  console.log('👤 Usuários criados com senha: password123');
  console.log('👑 SYSTEM_ADMIN: admin@sabercon.edu.br');
  console.log('🏢 INSTITUTION_MANAGER: gestor@sabercon.edu.br');
  console.log('👨‍🏫 TEACHER: professor@sabercon.edu.br');
  console.log('🎓 STUDENT: julia.c@ifsp.com');
  console.log('📚 COORDINATOR: coordenador@sabercon.edu.com');
  console.log('👨‍👩‍👧‍👦 GUARDIAN: renato@gmail.com');
} catch (error) {
  console.error('❌ Erro ao criar usuários padrão:', error.message);
  process.exit(1);
} 