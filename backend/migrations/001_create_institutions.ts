import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('institutions', (table) => {
    table.string('id').primary();
    table.string('name').notNullable();
    table.enum('type', ['UNIVERSITY', 'COLLEGE', 'TECH_CENTER', 'SCHOOL']).notNullable();
    table.json('characteristics').defaultTo('[]');
    table.string('address');
    table.string('phone');
    table.string('email');
    table.timestamps(true, true);
    
    // Índices
    table.index(['name']);
    table.index(['type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('institutions');
}