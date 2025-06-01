/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: genre_movie -> movie_genres
 * Gerado em: 2025-06-01T17:29:26.825Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('movie_genres');
  if (!hasTable) {
    return knex.schema.createTable('movie_genres', function (table) {
        table.bigInteger('genre_movies_id').notNullable()
        table.bigInteger('movie_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['movie_id']);
      table.index(['genre_movies_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('movie_genres');
}
