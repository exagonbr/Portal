/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: settings -> system_settings
 * Gerado em: 2025-06-01T17:28:00.383Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('system_settings');
  if (!hasTable) {
    return knex.schema.createTable('system_settings', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.string('default_value')
        table.text('description')
        table.string('name')
        table.boolean('required')
        table.string('settings_key').notNullable()
        table.string('settings_type')
        table.boolean('validation_required')
        table.string('value')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices

    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('system_settings');
}
