/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: institution_tv_show -> institution_tv_shows
 * Gerado em: 2025-06-01T11:25:58.280Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('institution_tv_shows');
  if (!hasTable) {
    return knex.schema.createTable('institution_tv_shows', function (table) {
        table.bigInteger('tv_show_id').notNullable()
        table.bigInteger('institution_id').notNullable()
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['institution_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('institution_tv_shows');
}
