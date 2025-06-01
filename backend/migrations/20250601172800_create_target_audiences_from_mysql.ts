/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: target_audience -> target_audiences
 * Gerado em: 2025-06-01T17:28:00.763Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('target_audiences');
  if (!hasTable) {
    return knex.schema.createTable('target_audiences', function (table) {
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
  return knex.schema.dropTableIfExists('target_audiences');
}
