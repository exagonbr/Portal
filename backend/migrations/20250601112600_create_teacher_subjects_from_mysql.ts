/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: teacher_subject -> teacher_subjects
 * Gerado em: 2025-06-01T11:26:00.952Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('teacher_subjects');
  if (!hasTable) {
    return knex.schema.createTable('teacher_subjects', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.boolean('is_child')
        table.boolean('is_deleted')
        table.string('name')
        table.string('uuid')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.unique(['uuid']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('teacher_subjects');
}
