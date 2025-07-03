/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: report -> system_reports
 * Gerado em: 2025-06-01T17:27:59.778Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('system_reports');
  if (!hasTable) {
    return knex.schema.createTable('system_reports', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.bigInteger('created_by_id')
        table.datetime('date_created').notNullable()
        table.string('error_code')
        table.datetime('last_updated').notNullable()
        table.boolean('resolved')
        table.bigInteger('video_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['created_by_id']);
      table.index(['video_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('system_reports');
}
