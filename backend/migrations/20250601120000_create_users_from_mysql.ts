/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: user -> users
 * Gerado em: 2025-06-01T12:00:00.000Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('users');
  if (!hasTable) {
    return knex.schema.createTable('users', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.string('email').unique().notNullable()
        table.string('password').notNullable()
        table.string('name').notNullable()
        table.string('cpf')
        table.string('phone')
        table.date('birth_date')
        table.string('address')
        table.string('city')
        table.string('state')
        table.string('zip_code')
        table.string('endereco')
        table.string('telefone')
        table.string('usuario')
        table.string('unidade_ensino')
        table.boolean('is_active').defaultTo(true)
        table.integer('role_id')
        table.integer('institution_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['email']);
      table.index(['role_id']);
      table.index(['institution_id']);
      table.index(['is_active']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('users');
} 