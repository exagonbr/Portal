import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('videos', (table) => {
    table.string('id').primary();
    table.string('thumbnail');
    table.string('title').notNullable();
    table.string('duration');
    table.string('video_url');
    table.text('description');
    table.string('course_id');
    table.string('module_id');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Índices
    table.index(['title']);
    table.index(['course_id']);
    table.index(['module_id']);
    table.index(['is_active']);
    
    // Foreign keys
    table.foreign('course_id').references('id').inTable('courses');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('videos');
}