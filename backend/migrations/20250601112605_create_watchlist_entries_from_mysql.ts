/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: watchlist_entry -> watchlist_entries
 * Gerado em: 2025-06-01T11:26:05.350Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('watchlist_entries');
  if (!hasTable) {
    return knex.schema.createTable('watchlist_entries', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.datetime('date_created')
        table.boolean('is_deleted').notNullable()
        table.datetime('last_updated')
        table.bigInteger('profile_id').notNullable()
        table.bigInteger('tv_show_id')
        table.bigInteger('user_id').notNullable()
        table.bigInteger('video_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['profile_id']);
      table.index(['tv_show_id']);
      table.index(['user_id']);
      table.index(['video_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('watchlist_entries');
}
