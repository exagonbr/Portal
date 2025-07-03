/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: generic_video_tag -> video_tags
 * Gerado em: 2025-06-01T17:29:26.237Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('video_tags');
  if (!hasTable) {
    return knex.schema.createTable('video_tags', function (table) {
        table.bigInteger('generic_video_tags_id').notNullable()
        table.bigInteger('tag_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['tag_id']);
      table.index(['generic_video_tags_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('video_tags');
}
