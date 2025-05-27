import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('courses', (table) => {
    table.string('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.enum('level', ['BASIC', 'SUPERIOR', 'PROFESSIONAL']).notNullable();
    table.string('cycle').notNullable();
    table.string('stage');
    table.string('institution_id').notNullable();
    table.string('duration');
    table.json('schedule').defaultTo('{}');
    table.json('teachers').defaultTo('[]');
    table.json('students').defaultTo('[]');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Índices
    table.index(['name']);
    table.index(['level']);
    table.index(['cycle']);
    table.index(['institution_id']);
    table.index(['is_active']);
    
    // Foreign key
    table.foreign('institution_id').references('id').inTable('institutions');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('courses');
}