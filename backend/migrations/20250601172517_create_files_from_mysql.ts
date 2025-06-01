/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: file -> files
 * Gerado em: 2025-06-01T17:25:17.184Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('files');
  if (!hasTable) {
    return knex.schema.createTable('files', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.string('content_type')
        table.datetime('date_created').notNullable()
        table.string('extension')
        table.string('external_link')
        table.boolean('is_default')
        table.boolean('is_public')
        table.string('label')
        table.datetime('last_updated').notNullable()
        table.string('local_file')
        table.string('name')
        table.string('original_filename')
        table.string('quality')
        table.string('sha256hex')
        table.bigInteger('size')
        table.string('subtitle_label')
        table.string('subtitle_src_lang')
        table.boolean('is_subtitled')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices

    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('files');
}
