/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: unit -> school_units
 * Gerado em: 2025-06-01T17:25:22.483Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('school_units');
  if (!hasTable) {
    return knex.schema.createTable('school_units', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.datetime('date_created')
        table.boolean('deleted')
        table.bigInteger('institution_id').notNullable()
        table.datetime('last_updated')
        table.string('name').notNullable()
        table.string('institution_name')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['institution_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('school_units');
}
