/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: generic_video_genre -> video_genres
 * Gerado em: 2025-06-01T11:50:04.127Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('video_genres');
  if (!hasTable) {
    return knex.schema.createTable('video_genres', function (table) {
        table.bigInteger('generic_video_genre_id').notNullable()
        table.bigInteger('genre_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['genre_id']);
      table.index(['generic_video_genre_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('video_genres');
}
