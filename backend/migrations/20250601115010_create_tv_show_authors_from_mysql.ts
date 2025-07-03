/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: tv_show_author -> tv_show_authors
 * Gerado em: 2025-06-01T11:50:10.069Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('tv_show_authors');
  if (!hasTable) {
    return knex.schema.createTable('tv_show_authors', function (table) {
        table.bigInteger('tv_show_authors_id').notNullable()
        table.bigInteger('author_id')
        table.increments('id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['author_id']);
      table.index(['tv_show_authors_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('tv_show_authors');
}
