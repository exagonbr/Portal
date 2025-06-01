/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: answer -> question_answers
 * Gerado em: 2025-06-01T17:29:23.729Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('question_answers');
  if (!hasTable) {
    return knex.schema.createTable('question_answers', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.datetime('date_created').notNullable()
        table.boolean('deleted')
        table.boolean('is_correct')
        table.datetime('last_updated')
        table.bigInteger('question_id')
        table.text('reply')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['question_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('question_answers');
}
