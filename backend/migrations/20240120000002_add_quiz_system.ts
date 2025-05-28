import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create quizzes table
  await knex.schema.createTable('quizzes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('description');
    table.integer('time_limit'); // in minutes
    table.integer('passing_score').notNullable();
    table.integer('attempts').defaultTo(1);
    table.boolean('is_graded').defaultTo(true);
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.uuid('module_id').references('id').inTable('modules').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // Create questions table
  await knex.schema.createTable('questions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE');
    table.enum('type', ['multiple-choice', 'true-false', 'short-answer']).notNullable();
    table.text('text').notNullable();
    table.specificType('options', 'text[]');
    table.specificType('correct_answer', 'text[]').notNullable();
    table.integer('points').notNullable();
    table.text('explanation');
    table.integer('order').notNullable();
    table.timestamps(true, true);
  });

  // Create quiz_attempts table
  await knex.schema.createTable('quiz_attempts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('attempt_number').notNullable();
    table.decimal('score', 5, 2);
    table.boolean('passed').defaultTo(false);
    table.jsonb('answers');
    table.timestamp('started_at');
    table.timestamp('completed_at');
    table.timestamps(true, true);
  });

  // Extend lessons table for different types
  await knex.schema.alterTable('lessons', (table) => {
    table.enum('type', ['video', 'reading', 'quiz', 'assignment']).notNullable();
    table.string('duration');
    table.integer('xp_reward').defaultTo(0);
    table.boolean('is_completed').defaultTo(false);
    table.string('video_url');
    table.jsonb('requirements');
  });

  // Extend modules table
  await knex.schema.alterTable('modules', (table) => {
    table.integer('xp_reward').defaultTo(0);
    table.boolean('is_completed').defaultTo(false);
    table.specificType('prerequisites', 'text[]');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('modules', (table) => {
    table.dropColumn('xp_reward');
    table.dropColumn('is_completed');
    table.dropColumn('prerequisites');
  });

  await knex.schema.alterTable('lessons', (table) => {
    table.dropColumn('type');
    table.dropColumn('duration');
    table.dropColumn('xp_reward');
    table.dropColumn('is_completed');
    table.dropColumn('video_url');
    table.dropColumn('requirements');
  });

  await knex.schema.dropTableIfExists('quiz_attempts');
  await knex.schema.dropTableIfExists('questions');
  await knex.schema.dropTableIfExists('quizzes');
}
