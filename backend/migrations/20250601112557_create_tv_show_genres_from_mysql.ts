/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: genre_tv_show -> tv_show_genres
 * Gerado em: 2025-06-01T11:25:57.901Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('tv_show_genres');
  if (!hasTable) {
    return knex.schema.createTable('tv_show_genres', function (table) {
        table.bigInteger('genre_tv_show_id').notNullable()
        table.bigInteger('tv_show_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['tv_show_id']);
      table.index(['genre_tv_show_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('tv_show_genres');
}
