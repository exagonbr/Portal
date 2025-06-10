import type { Knex } from 'knex';

/**
 * Migração para renomear a tabela "users" para "User".
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.renameTable('users', 'User');
  console.log('✅ Tabela "users" renomeada para "User"');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.renameTable('User', 'users');
  console.log('✅ Tabela "User" renomeada de volta para "users"');
} 