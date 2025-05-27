import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_progress', (table) => {
    table.string('id').primary();
    table.string('user_id').notNullable();
    table.string('course_id');
    table.string('module_id');
    table.string('lesson_id');
    table.string('book_id');
    table.string('video_id');
    table.decimal('progress', 5, 2).defaultTo(0); // 0-100%
    table.timestamp('completed_at');
    table.timestamp('last_accessed_at').defaultTo(knex.fn.now());
    table.integer('time_spent').defaultTo(0); // em segundos
    table.timestamps(true, true);
    
    // Índices
    table.index(['user_id']);
    table.index(['course_id']);
    table.index(['module_id']);
    table.index(['lesson_id']);
    table.index(['book_id']);
    table.index(['video_id']);
    table.index(['progress']);
    table.index(['last_accessed_at']);
    
    // Foreign keys
    table.foreign('user_id').references('id').inTable('users');
    table.foreign('course_id').references('id').inTable('courses');
    table.foreign('module_id').references('id').inTable('modules');
    table.foreign('lesson_id').references('id').inTable('lessons');
    table.foreign('book_id').references('id').inTable('books');
    table.foreign('video_id').references('id').inTable('videos');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user_progress');
}