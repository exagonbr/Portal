/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: question -> questions
 * Gerado em: 2025-06-01T17:27:59.578Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('questions');
  if (!hasTable) {
    return knex.schema.createTable('questions', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.datetime('date_created').notNullable()
        table.boolean('deleted')
        table.bigInteger('file_id')
        table.datetime('last_updated')
        table.text('test')
        table.bigInteger('tv_show_id')
        table.bigInteger('episode_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['tv_show_id']);
      table.index(['episode_id']);
      table.index(['file_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('questions');
}
