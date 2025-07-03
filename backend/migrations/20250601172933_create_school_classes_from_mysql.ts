/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: unit_class -> school_classes
 * Gerado em: 2025-06-01T17:29:33.420Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('school_classes');
  if (!hasTable) {
    return knex.schema.createTable('school_classes', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.datetime('date_created')
        table.boolean('deleted').notNullable()
        table.bigInteger('institution_id').notNullable()
        table.datetime('last_updated')
        table.string('name').notNullable()
        table.bigInteger('unit_id').notNullable()
        table.string('institution_name')
        table.string('unit_name')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['institution_id']);
      table.index(['unit_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('school_classes');
}
