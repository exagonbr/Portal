import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Verificar se a tabela já existe
  const hasTable = await knex.schema.hasTable('roles');
  
  if (!hasTable) {
    await knex.schema.createTable('roles', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      
      // Criar o tipo enum para roles
      table.enum('name', [
        'SYSTEM_ADMIN', 
        'INSTITUTION_MANAGER', 
        'ACADEMIC_COORDINATOR', 
        'TEACHER', 
        'STUDENT', 
        'GUARDIAN'
      ]).notNullable().unique();
      
      table.text('description').nullable();
      table.jsonb('permissions').defaultTo('[]');
      table.boolean('active').defaultTo(true);
      
      // Timestamps
      table.timestamps(true, true);
    });
    
    console.log('✅ Tabela roles criada com sucesso');
  } else {
    console.log('ℹ️  Tabela roles já existe');
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('roles');
} 