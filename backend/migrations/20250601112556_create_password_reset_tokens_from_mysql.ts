/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: forgot_password -> password_reset_tokens
 * Gerado em: 2025-06-01T11:25:56.134Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('password_reset_tokens');
  if (!hasTable) {
    return knex.schema.createTable('password_reset_tokens', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.string('email')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices

    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('password_reset_tokens');
}
