/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: institution_user -> institution_users
 * Gerado em: 2025-06-01T11:50:05.842Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('institution_users');
  if (!hasTable) {
    return knex.schema.createTable('institution_users', function (table) {
        table.bigInteger('institution_users_id').notNullable()
        table.bigInteger('user_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['user_id']);
      table.index(['institution_users_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('institution_users');
}
