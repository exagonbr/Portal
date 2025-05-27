import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('highlights', (table) => {
    table.string('id').primary();
    table.integer('page_number').notNullable();
    table.text('content').notNullable();
    table.string('color').notNullable();
    table.json('position').notNullable(); // {x, y, width, height}
    table.string('book_id').notNullable();
    table.string('user_id').notNullable();
    table.timestamps(true, true);
    
    // Índices
    table.index(['book_id']);
    table.index(['user_id']);
    table.index(['page_number']);
    table.index(['color']);
    table.index(['created_at']);
    
    // Foreign keys
    table.foreign('book_id').references('id').inTable('books');
    table.foreign('user_id').references('id').inTable('users');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('highlights');
}