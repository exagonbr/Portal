import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Criar tabela notification_templates
  await knex.schema.createTable('notification_templates', (table) => {
    table.increments('id').primary(); // Auto-incremental
    table.string('name', 255).notNullable();
    table.string('subject', 500).notNullable();
    table.text('message');
    table.boolean('html').defaultTo(false);
    table.string('category', 100).defaultTo('custom');
    table.boolean('is_public').defaultTo(false);
    table.string('user_id', 50).notNullable();
    table.string('created_by', 50).notNullable();
    table.timestamps(true, true); // created_at e updated_at
    
    // Índices para performance
    table.index('user_id');
    table.index('category');
    table.index('is_public');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notification_templates');
} 