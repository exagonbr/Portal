import type { Knex } from 'knex';

// Definição das constantes de roles
const ROLE = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  INSTITUTION_MANAGER: 'INSTITUTION_MANAGER',
  ACADEMIC_COORDINATOR: 'ACADEMIC_COORDINATOR',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  GUARDIAN: 'GUARDIAN'
};

/**
 * Migração para converter campos booleanos de usuários (is_teacher, is_manager, is_admin)
 * para o campo role com base em papéis predefinidos
 */
export async function up(knex: Knex): Promise<void> {
  console.log('🔄 Iniciando migração de campos booleanos para role...');
  
  // Verificando se a tabela de usuários existe
  const hasUsersTable = await knex.schema.hasTable('users');
  if (!hasUsersTable) {
    console.log('⚠️ Tabela de usuários não encontrada. Pulando migração.');
    return;
  }
  
  // Verificando se as colunas booleanas existem
  const hasIsTeacher = await knex.schema.hasColumn('users', 'is_teacher');
  const hasIsManager = await knex.schema.hasColumn('users', 'is_manager');
  const hasIsAdmin = await knex.schema.hasColumn('users', 'is_admin');
  const hasIsCoordinator = await knex.schema.hasColumn('users', 'is_coordinator');
  const hasIsGuardian = await knex.schema.hasColumn('users', 'is_guardian');
  
  // Se nenhuma das colunas existir, não há nada a fazer
  if (!hasIsTeacher && !hasIsManager && !hasIsAdmin && !hasIsCoordinator && !hasIsGuardian) {
    console.log('⚠️ Nenhuma coluna booleana de perfil encontrada. Pulando migração.');
    return;
  }
  
  // Verificando se a coluna role já existe
  const hasRoleColumn = await knex.schema.hasColumn('users', 'role');
  
  // Se não existir, criar a coluna role
  if (!hasRoleColumn) {
    await knex.schema.alterTable('users', (table) => {
      table.enum('role', [
        ROLE.SYSTEM_ADMIN,
        ROLE.INSTITUTION_MANAGER,
        ROLE.ACADEMIC_COORDINATOR,
        ROLE.TEACHER,
        ROLE.STUDENT,
        ROLE.GUARDIAN
      ]).defaultTo(ROLE.STUDENT);
    });
    console.log('✅ Coluna role criada com sucesso!');
  }
  
  // Construir a consulta dinamicamente com base nas colunas existentes
  let columnsToSelect = ['id'];
  if (hasIsTeacher) columnsToSelect.push('is_teacher');
  if (hasIsManager) columnsToSelect.push('is_manager');
  if (hasIsAdmin) columnsToSelect.push('is_admin');
  if (hasIsCoordinator) columnsToSelect.push('is_coordinator');
  if (hasIsGuardian) columnsToSelect.push('is_guardian');
  
  // Obter todos os usuários com apenas as colunas existentes
  const users = await knex('users').select(columnsToSelect);
  console.log(`🔍 Encontrados ${users.length} usuários para migração.`);
  
  // Para cada usuário, definir a role com base nas colunas booleanas
  let updateCount = 0;
  for (const user of users) {
    let role = ROLE.STUDENT; // Valor padrão
    
    // Definir a role com base na hierarquia: admin > manager > coordinator > teacher > guardian > student
    // Verificar cada coluna antes de usá-la
    if (hasIsAdmin && user.is_admin) {
      role = ROLE.SYSTEM_ADMIN;
    } else if (hasIsManager && user.is_manager) {
      role = ROLE.INSTITUTION_MANAGER;
    } else if (hasIsCoordinator && user.is_coordinator) {
      role = ROLE.ACADEMIC_COORDINATOR;
    } else if (hasIsTeacher && user.is_teacher) {
      role = ROLE.TEACHER;
    } else if (hasIsGuardian && user.is_guardian) {
      role = ROLE.GUARDIAN;
    }
    
    // Atualizar a role do usuário
    await knex('users')
      .where('id', user.id)
      .update({ role });
    
    updateCount++;
  }
  
  console.log(`✅ Migração concluída! ${updateCount} usuários atualizados.`);
  
  // Criar um índice na coluna role para melhorar o desempenho das consultas
  try {
    // Verificar se o índice já existe usando abordagem compatível com PostgreSQL
    const indexExists = await knex.raw(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_users_role'
      ) as exists
    `);
    
    const hasRoleIndex = indexExists && indexExists.rows && indexExists.rows[0] && indexExists.rows[0].exists;
    
    if (!hasRoleIndex) {
      await knex.schema.alterTable('users', (table) => {
        table.index(['role'], 'idx_users_role');
      });
      console.log('✅ Índice na coluna role criado com sucesso!');
    }
  } catch (error) {
    console.log('⚠️ Erro ao verificar ou criar índice na coluna role:', error);
  }
  
  console.log('🏁 Migração de campos booleanos para role concluída com sucesso!');
}

export async function down(knex: Knex): Promise<void> {
  // Verificando se a tabela de usuários existe
  const hasUsersTable = await knex.schema.hasTable('users');
  if (!hasUsersTable) {
    console.log('⚠️ Tabela de usuários não encontrada. Pulando reversão.');
    return;
  }
  
  // Verificando se a coluna role existe
  const hasRoleColumn = await knex.schema.hasColumn('users', 'role');
  
  if (hasRoleColumn) {
    // Não vamos remover a coluna role, apenas reiniciar o valor padrão
    await knex('users').update({ role: ROLE.STUDENT });
    console.log('✅ Valores da coluna role reiniciados para STUDENT.');
  }
  
  console.log('🏁 Reversão concluída!');
} 