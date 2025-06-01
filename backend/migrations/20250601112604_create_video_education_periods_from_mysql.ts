/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: video_education_period -> video_education_periods
 * Gerado em: 2025-06-01T11:26:04.179Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('video_education_periods');
  if (!hasTable) {
    return knex.schema.createTable('video_education_periods', function (table) {
        table.bigInteger('video_periods_id').notNullable()
        table.bigInteger('education_period_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['education_period_id']);
      table.index(['video_periods_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('video_education_periods');
}
