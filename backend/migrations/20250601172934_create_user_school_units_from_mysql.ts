/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: user_unit -> user_school_units
 * Gerado em: 2025-06-01T17:29:34.202Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('user_school_units');
  if (!hasTable) {
    return knex.schema.createTable('user_school_units', function (table) {
        table.bigInteger('unit_id').notNullable()
        table.bigInteger('user_id').notNullable()
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['user_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('user_school_units');
}
