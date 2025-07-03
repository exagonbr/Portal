/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: movie_tag -> movie_tags
 * Gerado em: 2025-06-01T11:25:58.649Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('movie_tags');
  if (!hasTable) {
    return knex.schema.createTable('movie_tags', function (table) {
        table.bigInteger('movie_tags_id').notNullable()
        table.bigInteger('tag_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['tag_id']);
      table.index(['movie_tags_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('movie_tags');
}
