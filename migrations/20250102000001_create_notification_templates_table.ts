import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('notification_templates', (table) => {
    table.string('id').primary();
    table.string('name').notNullable();
    table.string('subject').notNullable();
    table.text('message').notNullable();
    table.boolean('html').defaultTo(false);
    table.string('category').defaultTo('custom');
    table.boolean('is_public').defaultTo(false);
    table.string('user_id').notNullable();
    table.string('created_by').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Índices
    table.index('user_id');
    table.index('category');
    table.index('is_public');
    table.index(['user_id', 'name']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('notification_templates');
} 