/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: public -> public_content
 * Gerado em: 2025-06-01T17:29:29.155Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('public_content');
  if (!hasTable) {
    return knex.schema.createTable('public_content', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.integer('api_id').notNullable()
        table.string('name').notNullable()
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices

    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('public_content');
}
