/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: public_tv_show -> public_tv_shows
 * Gerado em: 2025-06-01T11:25:59.639Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('public_tv_shows');
  if (!hasTable) {
    return knex.schema.createTable('public_tv_shows', function (table) {
        table.bigInteger('public_tv_show_id').notNullable()
        table.bigInteger('tv_show_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['tv_show_id']);
      table.index(['public_tv_show_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('public_tv_shows');
}
