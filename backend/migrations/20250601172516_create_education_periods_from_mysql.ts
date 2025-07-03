/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: education_period -> education_periods
 * Gerado em: 2025-06-01T17:25:16.282Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('education_periods');
  if (!hasTable) {
    return knex.schema.createTable('education_periods', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.string('description').notNullable()
        table.boolean('is_active').defaultTo(true)
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices

    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('education_periods');
}
