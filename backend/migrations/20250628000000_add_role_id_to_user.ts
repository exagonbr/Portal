import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('🔧 Verificando e adicionando campo role_id na tabela user...');
  
  // Verificar se a tabela user existe
  const userTableExists = await knex.schema.hasTable('user');
  
  if (userTableExists) {
    // Verificar se a coluna role_id já existe
    const hasRoleId = await knex.schema.hasColumn('user', 'role_id');
    
    if (!hasRoleId) {
      console.log('➕ Adicionando coluna role_id na tabela user...');
      await knex.schema.alterTable('user', (table) => {
        table.uuid('role_id').references('id').inTable('roles').onDelete('SET NULL');
      });
      console.log('✅ Coluna role_id adicionada com sucesso na tabela user');
    } else {
      console.log('ℹ️ Coluna role_id já existe na tabela user');
    }
  } else {
    console.log('ℹ️ Tabela user não existe, migration não necessária');
  }

  // Verificar se a tabela users existe (nome no plural)
  const usersTableExists = await knex.schema.hasTable('users');
  
  if (usersTableExists) {
    console.log('✅ Tabela users já existe');
  } else {
    console.log('ℹ️ Tabela users não existe');
  }
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔧 Removendo campo role_id da tabela user...');
  
  const userTableExists = await knex.schema.hasTable('user');
  
  if (userTableExists) {
    const hasRoleId = await knex.schema.hasColumn('user', 'role_id');
    
    if (hasRoleId) {
      await knex.schema.alterTable('user', (table) => {
        table.dropColumn('role_id');
      });
      console.log('✅ Coluna role_id removida da tabela user');
    }
  }
} 