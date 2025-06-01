/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: video_educational_stage -> video_educational_stages
 * Gerado em: 2025-06-01T17:28:05.369Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('video_educational_stages');
  if (!hasTable) {
    return knex.schema.createTable('video_educational_stages', function (table) {
        table.bigInteger('video_stages_id').notNullable()
        table.bigInteger('educational_stage_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['educational_stage_id']);
      table.index(['video_stages_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('video_educational_stages');
}
