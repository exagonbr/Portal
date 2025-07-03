/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: notification_queue -> notification_queue
 * Gerado em: 2025-06-01T17:25:19.483Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('notification_queue');
  if (!hasTable) {
    return knex.schema.createTable('notification_queue', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.datetime('date_created').notNullable()
        table.string('description')
        table.boolean('is_completed')
        table.datetime('last_updated').notNullable()
        table.bigInteger('movie_id')
        table.bigInteger('tv_show_id')
        table.string('type')
        table.bigInteger('video_to_play_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['movie_id']);
      table.index(['tv_show_id']);
      table.index(['video_to_play_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('notification_queue');
}
