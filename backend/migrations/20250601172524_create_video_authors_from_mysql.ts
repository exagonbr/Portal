/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: video_author -> video_authors
 * Gerado em: 2025-06-01T17:25:24.248Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('video_authors');
  if (!hasTable) {
    return knex.schema.createTable('video_authors', function (table) {
        table.bigInteger('video_authors_id').notNullable()
        table.bigInteger('author_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['author_id']);
      table.index(['video_authors_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('video_authors');
}
