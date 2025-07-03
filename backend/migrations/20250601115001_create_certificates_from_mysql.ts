/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: certificate -> certificates
 * Gerado em: 2025-06-01T11:50:01.622Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('certificates');
  if (!hasTable) {
    return knex.schema.createTable('certificates', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.datetime('date_created').notNullable()
        table.datetime('last_updated')
        table.string('path')
        table.bigInteger('score')
        table.bigInteger('tv_show_id')
        table.bigInteger('user_id')
        table.string('document')
        table.string('license_code')
        table.string('tv_show_name')
        table.boolean('recreate').defaultTo(true)
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['tv_show_id']);
      table.index(['user_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('certificates');
}
