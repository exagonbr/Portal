import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Verificar se a tabela já existe
  const hasTable = await knex.schema.hasTable('role_permissions');
  
  if (!hasTable) {
    await knex.schema.createTable('role_permissions', (table) => {
      // Chaves estrangeiras
      table.uuid('role_id').references('id').inTable('roles').onDelete('CASCADE');
      table.uuid('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
      
      // Chave primária composta
      table.primary(['role_id', 'permission_id']);
      
      // Timestamps
      table.timestamps(true, true);
    });
    
    console.log('✅ Tabela role_permissions criada com sucesso');
  } else {
    console.log('ℹ️  Tabela role_permissions já existe');
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('role_permissions');
} 