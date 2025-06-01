import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Verificar se a tabela já existe
  const hasTable = await knex.schema.hasTable('permissions');
  
  if (!hasTable) {
    await knex.schema.createTable('permissions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      
      // Campos principais
      table.string('name').notNullable().unique();
      table.string('resource').notNullable();
      table.enum('action', ['create', 'read', 'update', 'delete', 'manage', 'view', 'access', 'submit', 'communicate', 'monitor', 'track', 'message', 'moderate']).notNullable();
      table.text('description').nullable();
      
      // Timestamps
      table.timestamps(true, true);
    });
    
    console.log('✅ Tabela permissions criada com sucesso');
  } else {
    console.log('ℹ️  Tabela permissions já existe');
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('permissions');
} 