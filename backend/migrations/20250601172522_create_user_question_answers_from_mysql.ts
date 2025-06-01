/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: user_answer -> user_question_answers
 * Gerado em: 2025-06-01T17:25:22.864Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('user_question_answers');
  if (!hasTable) {
    return knex.schema.createTable('user_question_answers', function (table) {
        table.bigInteger('answer_id').notNullable()
        table.bigInteger('question_id').notNullable()
        table.bigInteger('version')
        table.datetime('date_created').notNullable()
        table.boolean('is_correct')
        table.datetime('last_updated')
        table.bigInteger('score')
        table.bigInteger('user_id')
        table.increments('id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['answer_id']);
      table.index(['question_id']);
      table.index(['user_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('user_question_answers');
}
