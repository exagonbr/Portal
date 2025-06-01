/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: educational_stage_institution -> educational_stage_institutions
 * Gerado em: 2025-06-01T17:29:24.898Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('educational_stage_institutions');
  if (!hasTable) {
    return knex.schema.createTable('educational_stage_institutions', function (table) {
        table.bigInteger('educational_stage_institions_id').notNullable()
        table.bigInteger('institution_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['institution_id']);
      table.index(['educational_stage_institions_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('educational_stage_institutions');
}
