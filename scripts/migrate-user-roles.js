#!/usr/bin/env node

/**
 * Script para executar a migração de usuários das colunas booleanas para a coluna role
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Determina o diretório raiz do projeto
const rootDir = path.resolve(__dirname, '..');

// Verifica se estamos em ambiente de desenvolvimento ou produção
const isProd = process.env.NODE_ENV === 'production';

console.log('📊 Iniciando migração de roles de usuário...');
console.log(`🔧 Ambiente: ${isProd ? 'Produção' : 'Desenvolvimento'}`);

try {
  // Verifica se o arquivo de migração existe
  const migrationFile = path.join(rootDir, 'backend/migrations/20250602000001_migrate_user_boolean_to_role.ts');
  if (!fs.existsSync(migrationFile)) {
    throw new Error(`Arquivo de migração não encontrado: ${migrationFile}`);
  }

  console.log('🔍 Verificando configuração do banco de dados...');
  
  // Verifica se o knexfile existe
  const knexfilePath = path.join(rootDir, 'backend/knexfile.js');
  if (!fs.existsSync(knexfilePath)) {
    throw new Error(`Arquivo de configuração do Knex não encontrado: ${knexfilePath}`);
  }

  // Executa a migração específica
  console.log('🚀 Executando migração de roles de usuário...');
  const command = `cd "${path.join(rootDir, 'backend')}" && npx knex migrate:up 20250602000001_migrate_user_boolean_to_role.ts`;
  
  console.log(`Executando comando: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    
    console.log('✅ Migração de roles de usuário concluída com sucesso!');
    console.log('');
    console.log('ℹ️  Agora a coluna role contém os seguintes valores baseados nas colunas booleanas:');
    console.log('   - is_admin = true → SYSTEM_ADMIN');
    console.log('   - is_manager = true → INSTITUTION_MANAGER');
    console.log('   - is_coordinator = true → ACADEMIC_COORDINATOR');
    console.log('   - is_teacher = true → TEACHER');
    console.log('   - is_guardian = true → GUARDIAN');
    console.log('   - nenhuma coluna = true → STUDENT (padrão)');
    console.log('');
    console.log('🔄 A prioridade segue a ordem acima em caso de múltiplas colunas com valor true.');
  } catch (execError) {
    console.error('❌ Erro ao executar a migração usando Knex:', execError.message);
    
    // Verifica se o erro está relacionado a problemas de compatibilidade de TypeScript
    if (execError.message.includes('TypeScript') || execError.message.includes('enum')) {
      console.log('');
      console.log('💡 Sugestão: O erro pode estar relacionado à compatibilidade do TypeScript.');
      console.log('   Tente editar o arquivo de migração para usar constantes em vez de enum:');
      console.log('');
      console.log('   Substitua:');
      console.log('   enum UserRole { ... }');
      console.log('');
      console.log('   Por:');
      console.log('   const ROLE = {');
      console.log('     SYSTEM_ADMIN: "SYSTEM_ADMIN",');
      console.log('     ...');
      console.log('   }');
      console.log('');
      console.log('   E atualize todas as referências de UserRole para ROLE no arquivo.');
    }
    
    // Se o erro estiver relacionado a módulos não encontrados
    if (execError.message.includes('Cannot find module')) {
      console.log('');
      console.log('💡 Sugestão: O erro está relacionado a um módulo não encontrado.');
      console.log('   Verifique se todas as importações no arquivo de migração apontam para caminhos corretos.');
      console.log('   Considere definir as constantes diretamente no arquivo de migração.');
    }
    
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Erro ao executar a migração:', error.message);
  process.exit(1);
} 