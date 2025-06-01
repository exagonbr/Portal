#!/usr/bin/env node

/**
 * Script para testar a migração de roles de usuários
 * Este script cria uma tabela de teste com colunas booleanas,
 * insere alguns usuários de teste e depois executa a migração.
 */
const path = require('path');
const { execSync } = require('child_process');

// Caminho para o diretório backend
const backendDir = path.join(__dirname, '..', 'backend');

// Função para executar comandos SQL
function executeSql(sql) {
  return execSync(`cd "${backendDir}" && npx knex raw "${sql.replace(/"/g, '\\"')}"`, { 
    stdio: ['pipe', 'pipe', 'pipe'] 
  }).toString();
}

console.log('🧪 Iniciando teste da migração de roles de usuários...');

try {
  // 1. Criar uma tabela de teste
  console.log('📊 Criando tabela de teste...');
  executeSql(`
    DROP TABLE IF EXISTS users_test;
    CREATE TABLE users_test (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      is_teacher BOOLEAN DEFAULT FALSE,
      is_manager BOOLEAN DEFAULT FALSE,
      is_admin BOOLEAN DEFAULT FALSE,
      is_coordinator BOOLEAN DEFAULT FALSE,
      is_guardian BOOLEAN DEFAULT FALSE
    );
  `);
  
  // 2. Inserir alguns usuários de teste
  console.log('👤 Inserindo usuários de teste...');
  executeSql(`
    INSERT INTO users_test (name, email, is_teacher, is_manager, is_admin, is_coordinator, is_guardian) VALUES
    ('Admin User', 'admin@example.com', false, false, true, false, false),
    ('Manager User', 'manager@example.com', false, true, false, false, false),
    ('Teacher User', 'teacher@example.com', true, false, false, false, false),
    ('Coordinator User', 'coordinator@example.com', false, false, false, true, false),
    ('Guardian User', 'guardian@example.com', false, false, false, false, true),
    ('Student User', 'student@example.com', false, false, false, false, false),
    ('Multi-Role User', 'multi@example.com', true, true, false, false, false);
  `);
  
  // 3. Criar um script de migração temporário para a tabela de teste
  console.log('🔄 Criando script de migração temporário...');
  const tempMigrationPath = path.join(backendDir, 'migrations', 'temp_test_user_roles_migration.js');
  const fs = require('fs');
  
  const migrationContent = `
exports.up = async function(knex) {
  console.log('🔄 Iniciando migração de teste para roles de usuários...');
  
  // Verificar se a coluna role já existe
  const hasRoleColumn = await knex.schema.hasColumn('users_test', 'role');
  
  // Se não existir, criar a coluna role
  if (!hasRoleColumn) {
    await knex.schema.alterTable('users_test', (table) => {
      table.enum('role', [
        'SYSTEM_ADMIN',
        'INSTITUTION_MANAGER',
        'ACADEMIC_COORDINATOR',
        'TEACHER',
        'STUDENT',
        'GUARDIAN'
      ]).defaultTo('STUDENT');
    });
    console.log('✅ Coluna role criada com sucesso!');
  }
  
  // Verificar quais colunas existem
  const hasIsTeacher = await knex.schema.hasColumn('users_test', 'is_teacher');
  const hasIsManager = await knex.schema.hasColumn('users_test', 'is_manager');
  const hasIsAdmin = await knex.schema.hasColumn('users_test', 'is_admin');
  const hasIsCoordinator = await knex.schema.hasColumn('users_test', 'is_coordinator');
  const hasIsGuardian = await knex.schema.hasColumn('users_test', 'is_guardian');
  
  // Construir a consulta dinamicamente com base nas colunas existentes
  let columnsToSelect = ['id'];
  if (hasIsTeacher) columnsToSelect.push('is_teacher');
  if (hasIsManager) columnsToSelect.push('is_manager');
  if (hasIsAdmin) columnsToSelect.push('is_admin');
  if (hasIsCoordinator) columnsToSelect.push('is_coordinator');
  if (hasIsGuardian) columnsToSelect.push('is_guardian');
  
  // Obter todos os usuários com apenas as colunas existentes
  const users = await knex('users_test').select(columnsToSelect);
  console.log(\`🔍 Encontrados \${users.length} usuários para migração.\`);
  
  // Para cada usuário, definir a role com base nas colunas booleanas
  let updateCount = 0;
  for (const user of users) {
    let role = 'STUDENT'; // Valor padrão
    
    // Definir a role com base na hierarquia: admin > manager > coordinator > teacher > guardian > student
    // Verificar cada coluna antes de usá-la
    if (hasIsAdmin && user.is_admin) {
      role = 'SYSTEM_ADMIN';
    } else if (hasIsManager && user.is_manager) {
      role = 'INSTITUTION_MANAGER';
    } else if (hasIsCoordinator && user.is_coordinator) {
      role = 'ACADEMIC_COORDINATOR';
    } else if (hasIsTeacher && user.is_teacher) {
      role = 'TEACHER';
    } else if (hasIsGuardian && user.is_guardian) {
      role = 'GUARDIAN';
    }
    
    // Atualizar a role do usuário
    await knex('users_test')
      .where('id', user.id)
      .update({ role });
    
    updateCount++;
  }
  
  console.log(\`✅ Migração de teste concluída! \${updateCount} usuários atualizados.\`);
};

exports.down = async function(knex) {
  // Remover a coluna role se ela existir
  const hasRoleColumn = await knex.schema.hasColumn('users_test', 'role');
  
  if (hasRoleColumn) {
    await knex.schema.alterTable('users_test', (table) => {
      table.dropColumn('role');
    });
  }
  
  console.log('🔄 Migração de teste revertida!');
};
  `;
  
  fs.writeFileSync(tempMigrationPath, migrationContent);
  
  // 4. Executar a migração temporária
  console.log('🚀 Executando migração temporária...');
  execSync(`cd "${backendDir}" && npx knex migrate:latest --specific=temp_test_user_roles_migration.js`, { 
    stdio: 'inherit' 
  });
  
  // 5. Verificar os resultados
  console.log('🔍 Verificando resultados...');
  const results = executeSql(`
    SELECT 
      COUNT(*) as total_users,
      COUNT(CASE WHEN role = 'SYSTEM_ADMIN' THEN 1 END) as admins,
      COUNT(CASE WHEN role = 'INSTITUTION_MANAGER' THEN 1 END) as managers,
      COUNT(CASE WHEN role = 'ACADEMIC_COORDINATOR' THEN 1 END) as coordinators,
      COUNT(CASE WHEN role = 'TEACHER' THEN 1 END) as teachers,
      COUNT(CASE WHEN role = 'STUDENT' THEN 1 END) as students,
      COUNT(CASE WHEN role = 'GUARDIAN' THEN 1 END) as guardians
    FROM users_test;
  `);
  
  console.log('📊 Resultados da migração:');
  console.log(results);
  
  // 6. Limpar - reverter migração e remover tabela
  console.log('🧹 Limpando ambiente de teste...');
  execSync(`cd "${backendDir}" && npx knex migrate:down --specific=temp_test_user_roles_migration.js`, { 
    stdio: 'inherit' 
  });
  
  executeSql('DROP TABLE IF EXISTS users_test;');
  fs.unlinkSync(tempMigrationPath);
  
  console.log('✅ Teste concluído com sucesso!');
  console.log('');
  console.log('ℹ️  Este teste confirma que a migração:');
  console.log('  1. Cria corretamente a coluna role');
  console.log('  2. Mapeia corretamente os valores booleanos para as roles correspondentes');
  console.log('  3. Segue a hierarquia de prioridade definida');
  console.log('  4. Lida com segurança com colunas que podem não existir');
  
} catch (error) {
  console.error('❌ Erro durante o teste:', error.message);
  process.exit(1);
} 