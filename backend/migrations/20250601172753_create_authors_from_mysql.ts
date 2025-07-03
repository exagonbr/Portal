/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: author -> authors
 * Gerado em: 2025-06-01T17:27:53.473Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('authors');
  if (!hasTable) {
    return knex.schema.createTable('authors', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.text('description').notNullable()
        table.string('email')
        table.boolean('is_active').defaultTo(true)
        table.string('name').notNullable()
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices

    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('authors');
}
