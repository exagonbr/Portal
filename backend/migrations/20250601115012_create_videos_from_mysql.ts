/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: video -> videos
 * Gerado em: 2025-06-01T11:50:12.126Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('videos');
  if (!hasTable) {
    return knex.schema.createTable('videos', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.string('api_id')
        table.datetime('date_created')
        table.boolean('deleted')
        table.string('imdb_id')
        table.integer('intro_end')
        table.integer('intro_start')
        table.datetime('last_updated')
        table.string('original_language')
        table.integer('outro_start')
        table.text('overview')
        table.double('popularity')
        table.integer('report_count')
        table.double('vote_average')
        table.integer('vote_count')
        table.string('class').notNullable()
        table.string('backdrop_path')
        table.bigInteger('poster_image_id')
        table.string('poster_path')
        table.string('release_date')
        table.string('title')
        table.string('trailer_key')
        table.bigInteger('backdrop_image_id')
        table.string('air_date')
        table.string('episode_string')
        table.integer('episode_number')
        table.string('name')
        table.integer('season_episode_merged')
        table.integer('season_number')
        table.bigInteger('show_id')
        table.bigInteger('still_image_id')
        table.string('still_path')
        table.string('duration')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['poster_image_id']);
      table.index(['backdrop_image_id']);
      table.index(['show_id']);
      table.index(['still_image_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('videos');
}
