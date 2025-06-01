/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: cookie_signed -> user_sessions
 * Gerado em: 2025-06-01T17:27:53.864Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('user_sessions');
  if (!hasTable) {
    return knex.schema.createTable('user_sessions', function (table) {
        table.increments('id')
        table.string('cookie')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices

    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('user_sessions');
}
