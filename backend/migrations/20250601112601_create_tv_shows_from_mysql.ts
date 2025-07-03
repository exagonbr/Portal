/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: tv_show -> tv_shows
 * Gerado em: 2025-06-01T11:26:01.365Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('tv_shows');
  if (!hasTable) {
    return knex.schema.createTable('tv_shows', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.string('api_id')
        table.bigInteger('backdrop_image_id')
        table.string('backdrop_path')
        table.datetime('contract_term_end').notNullable()
        table.datetime('date_created').notNullable()
        table.boolean('deleted')
        table.datetime('first_air_date').notNullable()
        table.string('imdb_id')
        table.datetime('last_updated').notNullable()
        table.boolean('manual_input')
        table.bigInteger('manual_support_id')
        table.string('manual_support_path')
        table.string('name').notNullable()
        table.string('original_language')
        table.text('overview')
        table.double('popularity')
        table.bigInteger('poster_image_id')
        table.string('poster_path')
        table.text('producer')
        table.double('vote_average')
        table.integer('vote_count')
        table.string('total_load')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['backdrop_image_id']);
      table.index(['manual_support_id']);
      table.index(['poster_image_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('tv_shows');
}
