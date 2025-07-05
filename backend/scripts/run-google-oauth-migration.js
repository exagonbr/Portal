#!/usr/bin/env node

/**
 * Script para executar a migração dos campos do Google OAuth
 * 
 * Uso:
 *   node scripts/run-google-oauth-migration.js
 *   
 * Ou com npm:
 *   npm run migrate:google-oauth
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando migração dos campos do Google OAuth...');

try {
  // Definir o caminho para o arquivo de migração
  const migrationPath = path.join(__dirname, '../migrations/20250705000000_add_google_oauth_fields.sql');
  
  console.log('📁 Arquivo de migração:', migrationPath);
  
  // Executar a migração TypeORM
  console.log('⚡ Executando migração TypeORM...');
  execSync('npm run migration:run', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit' 
  });
  
  console.log('✅ Migração executada com sucesso!');
  console.log('');
  console.log('📋 Campos adicionados na tabela user:');
  console.log('   • google_id (VARCHAR 255, UNIQUE) - ID do usuário no Google');
  console.log('   • profile_image (VARCHAR 500) - URL da imagem de perfil');
  console.log('   • email_verified (BOOLEAN, DEFAULT FALSE) - Status de verificação do email');
  console.log('');
  console.log('🔍 Índices criados:');
  console.log('   • idx_user_google_id - Para consultas por Google ID');
  console.log('   • idx_user_email_verified - Para consultas por status de verificação');
  console.log('');
  console.log('🎉 O sistema está pronto para usar Google OAuth!');
  
} catch (error) {
  console.error('❌ Erro ao executar migração:', error.message);
  console.error('');
  console.error('🔧 Possíveis soluções:');
  console.error('   1. Verifique se o banco de dados está rodando');
  console.error('   2. Confirme as credenciais de conexão');
  console.error('   3. Execute manualmente: npm run migration:run');
  console.error('   4. Ou execute o SQL diretamente no banco');
  process.exit(1);
} 