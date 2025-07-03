/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: tag -> tags
 * Gerado em: 2025-06-01T11:50:08.730Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('tags');
  if (!hasTable) {
    return knex.schema.createTable('tags', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.datetime('date_created').notNullable()
        table.boolean('deleted')
        table.datetime('last_updated').notNullable()
        table.string('name')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.unique(['name']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('tags');
}
