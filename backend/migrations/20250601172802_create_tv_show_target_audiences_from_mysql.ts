/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: tv_show_target_audience -> tv_show_target_audiences
 * Gerado em: 2025-06-01T17:28:02.377Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('tv_show_target_audiences');
  if (!hasTable) {
    return knex.schema.createTable('tv_show_target_audiences', function (table) {
        table.bigInteger('tv_show_target_audiences_id')
        table.bigInteger('target_audience_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['target_audience_id']);
      table.index(['tv_show_target_audiences_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('tv_show_target_audiences');
}
