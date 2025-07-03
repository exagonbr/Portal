/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: educational_stage -> educational_stages
 * Gerado em: 2025-06-01T17:29:24.711Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('educational_stages');
  if (!hasTable) {
    return knex.schema.createTable('educational_stages', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.datetime('date_created')
        table.boolean('deleted').notNullable()
        table.boolean('grade_1')
        table.boolean('grade_2')
        table.boolean('grade_3')
        table.boolean('grade_4')
        table.boolean('grade_5')
        table.boolean('grade_6')
        table.boolean('grade_7')
        table.boolean('grade_8')
        table.boolean('grade_9')
        table.datetime('last_updated')
        table.string('name').notNullable()
        table.string('uuid')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices

    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('educational_stages');
}
