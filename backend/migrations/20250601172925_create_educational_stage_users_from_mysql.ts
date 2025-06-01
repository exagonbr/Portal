/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: educational_stage_user -> educational_stage_users
 * Gerado em: 2025-06-01T17:29:25.498Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('educational_stage_users');
  if (!hasTable) {
    return knex.schema.createTable('educational_stage_users', function (table) {
        table.bigInteger('educational_stage_users_id').notNullable()
        table.bigInteger('user_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['user_id']);
      table.index(['educational_stage_users_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('educational_stage_users');
}
