import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('modules', (table) => {
    table.string('id').primary();
    table.string('title').notNullable();
    table.text('description');
    table.integer('xp_reward').defaultTo(0);
    table.boolean('is_completed').defaultTo(false);
    table.json('prerequisites').defaultTo('[]');
    table.string('course_id').notNullable();
    table.integer('order').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Índices
    table.index(['title']);
    table.index(['course_id']);
    table.index(['order']);
    table.index(['is_active']);
    
    // Foreign key
    table.foreign('course_id').references('id').inTable('courses');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('modules');
}