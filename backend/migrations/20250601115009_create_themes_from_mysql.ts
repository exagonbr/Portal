/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: theme -> themes
 * Gerado em: 2025-06-01T11:50:09.707Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('themes');
  if (!hasTable) {
    return knex.schema.createTable('themes', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.string('description').notNullable()
        table.boolean('is_active').defaultTo(true)
        table.string('name').notNullable()
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices

    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('themes');
}
