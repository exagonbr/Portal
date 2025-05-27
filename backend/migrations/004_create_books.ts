import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('books', (table) => {
    table.string('id').primary();
    table.string('thumbnail');
    table.string('title').notNullable();
    table.string('author').notNullable();
    table.string('publisher');
    table.text('synopsis');
    table.string('duration');
    table.enum('format', ['pdf', 'epub']);
    table.string('file_path');
    table.integer('page_count');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Índices
    table.index(['title']);
    table.index(['author']);
    table.index(['publisher']);
    table.index(['format']);
    table.index(['is_active']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('books');
}