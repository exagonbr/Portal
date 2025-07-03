/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: user_role -> user_roles
 * Gerado em: 2025-06-01T17:29:34.010Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('user_roles');
  if (!hasTable) {
    return knex.schema.createTable('user_roles', function (table) {
        table.bigInteger('role_id').notNullable()
        table.bigInteger('user_id').notNullable()
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['user_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('user_roles');
}
