/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: viewing_status -> viewing_statuses
 * Gerado em: 2025-06-01T11:50:13.705Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('viewing_statuses');
  if (!hasTable) {
    return knex.schema.createTable('viewing_statuses', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.boolean('completed')
        table.integer('current_play_time').notNullable()
        table.datetime('date_created')
        table.datetime('last_updated')
        table.bigInteger('profile_id')
        table.integer('runtime')
        table.bigInteger('tv_show_id')
        table.bigInteger('user_id')
        table.bigInteger('video_id').notNullable()
      
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
  return knex.schema.dropTableIfExists('viewing_statuses');
}
