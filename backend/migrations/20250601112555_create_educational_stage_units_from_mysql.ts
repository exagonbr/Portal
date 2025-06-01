/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: educational_stage_unit -> educational_stage_units
 * Gerado em: 2025-06-01T11:25:55.575Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('educational_stage_units');
  if (!hasTable) {
    return knex.schema.createTable('educational_stage_units', function (table) {
        table.bigInteger('educational_stage_units_id').notNullable()
        table.bigInteger('unit_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['unit_id']);
      table.index(['educational_stage_units_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('educational_stage_units');
}
