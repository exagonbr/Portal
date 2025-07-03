/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: profile_target_audience -> profile_target_audiences
 * Gerado em: 2025-06-01T17:25:19.863Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('profile_target_audiences');
  if (!hasTable) {
    return knex.schema.createTable('profile_target_audiences', function (table) {
        table.bigInteger('profile_target_audiences_id')
        table.bigInteger('target_audience_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['target_audience_id']);
      table.index(['profile_target_audiences_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('profile_target_audiences');
}
