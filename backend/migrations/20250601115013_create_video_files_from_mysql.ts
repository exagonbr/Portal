/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: video_file -> video_files
 * Gerado em: 2025-06-01T11:50:13.352Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('video_files');
  if (!hasTable) {
    return knex.schema.createTable('video_files', function (table) {
        table.bigInteger('video_files_id').notNullable()
        table.bigInteger('file_id')
        table.increments('id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['file_id']);
      table.index(['video_files_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('video_files');
}
