/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: user_genre -> user_genres
 * Gerado em: 2025-06-01T17:28:03.368Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('user_genres');
  if (!hasTable) {
    return knex.schema.createTable('user_genres', function (table) {
        table.bigInteger('user_favorite_genres_id').notNullable()
        table.bigInteger('genre_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['genre_id']);
      table.index(['user_favorite_genres_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('user_genres');
}
