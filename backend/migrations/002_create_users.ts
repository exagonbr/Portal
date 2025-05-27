import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.string('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.enum('role', ['admin', 'manager', 'teacher', 'student']).notNullable();
    table.string('institution').notNullable();
    table.string('endereco');
    table.string('telefone');
    table.string('usuario').notNullable().unique();
    table.string('unidade_ensino');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login');
    table.timestamps(true, true);
    
    // Índices
    table.index(['email']);
    table.index(['role']);
    table.index(['institution']);
    table.index(['usuario']);
    table.index(['is_active']);
    
    // Foreign key
    table.foreign('institution').references('id').inTable('institutions');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}