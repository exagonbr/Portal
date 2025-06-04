import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Verifica se a tabela já existe
  const exists = await knex.schema.hasTable('aws_usage_logs');
  if (exists) return;

  return knex.schema.createTable('aws_usage_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('operation').notNullable();
    table.boolean('success').notNullable().defaultTo(false);
    table.jsonb('details');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    
    // Índices
    table.index('user_id');
    table.index('operation');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('aws_usage_logs');
} 