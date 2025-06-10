import type { Knex } from 'knex';

/**
 * Migração para adicionar a coluna is_active na tabela institutions
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('institutions', (table) => {
    table.boolean('is_active').defaultTo(true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('institutions', (table) => {
    table.dropColumn('is_active');
  });
} 