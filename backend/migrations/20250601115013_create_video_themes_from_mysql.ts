/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: video_theme -> video_themes
 * Gerado em: 2025-06-01T11:50:13.528Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('video_themes');
  if (!hasTable) {
    return knex.schema.createTable('video_themes', function (table) {
        table.bigInteger('video_themes_id').notNullable()
        table.bigInteger('theme_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['theme_id']);
      table.index(['video_themes_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('video_themes');
}
