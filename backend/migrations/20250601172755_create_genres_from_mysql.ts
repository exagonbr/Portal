/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: genre -> genres
 * Gerado em: 2025-06-01T17:27:55.994Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('genres');
  if (!hasTable) {
    return knex.schema.createTable('genres', function (table) {
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
  return knex.schema.dropTableIfExists('genres');
}
