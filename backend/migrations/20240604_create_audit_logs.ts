import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Verifica se a tabela já existe
  const exists = await knex.schema.hasTable('audit_logs');
  if (exists) return;

  return knex.schema.createTable('audit_logs', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('action').notNullable();
    table.jsonb('data').defaultTo('{}');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    
    // Índices
    table.index('user_id');
    table.index('action');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('audit_logs');
} 