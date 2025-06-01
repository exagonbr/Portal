/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: role -> roles
 * Gerado em: 2025-06-01T11:50:08.150Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('roles');
  if (!hasTable) {
    return knex.schema.createTable('roles', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.string('authority')
        table.string('display_name')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.unique(['authority']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('roles');
}
