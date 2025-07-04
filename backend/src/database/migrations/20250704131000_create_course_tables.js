'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  // Tabela de disciplinas/matérias
  await knex.schema.createTable('subjects', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable();
    table.string('code', 50).notNullable().unique();
    table.text('description').nullable();
    table.string('icon', 100).nullable();
    table.string('color', 7).nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de cursos
  await knex.schema.createTable('courses', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable();
    table.string('code', 50).notNullable().unique();
    table.text('description').nullable();
    table.string('thumbnail_url', 500).nullable();
    table.integer('duration_hours').nullable();
    table.string('level', 50).nullable(); // beginner, intermediate, advanced
    table.decimal('price', 10, 2).nullable();
    table.bigInteger('subject_id').unsigned().nullable().references('id').inTable('subjects');
    table.bigInteger('instructor_id').unsigned().nullable().references('id').inTable('user');
    table.bigInteger('institution_id').unsigned().nullable().references('id').inTable('institution');
    table.boolean('is_published').defaultTo(false);
    table.boolean('is_featured').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.integer('enrollment_count').defaultTo(0);
    table.decimal('rating', 3, 2).nullable();
    table.timestamps(true, true);
  });

  // Tabela de módulos do curso
  await knex.schema.createTable('modules', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable();
    table.text('description').nullable();
    table.bigInteger('course_id').unsigned().notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.integer('order_index').notNullable();
    table.integer('duration_minutes').nullable();
    table.boolean('is_published').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de lições/aulas
  await knex.schema.createTable('lessons', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable();
    table.text('description').nullable();
    table.bigInteger('module_id').unsigned().notNullable().references('id').inTable('modules').onDelete('CASCADE');
    table.integer('order_index').notNullable();
    table.string('content_type', 50).notNullable(); // video, text, quiz, assignment
    table.text('content').nullable(); // Para conteúdo de texto
    table.string('video_url', 500).nullable();
    table.integer('duration_minutes').nullable();
    table.boolean('is_published').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de matrículas em cursos
  await knex.schema.createTable('course_enrollments', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('user');
    table.bigInteger('course_id').unsigned().notNullable().references('id').inTable('courses');
    table.datetime('enrolled_at').notNullable();
    table.datetime('completed_at').nullable();
    table.integer('progress_percentage').defaultTo(0);
    table.string('status', 50).defaultTo('active'); // active, completed, dropped
    table.decimal('final_grade', 5, 2).nullable();
    table.timestamps(true, true);
    table.unique(['user_id', 'course_id']);
  });

  // Tabela de progresso nas lições
  await knex.schema.createTable('lesson_progress', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('user');
    table.bigInteger('lesson_id').unsigned().notNullable().references('id').inTable('lessons');
    table.datetime('started_at').notNullable();
    table.datetime('completed_at').nullable();
    table.integer('time_spent_seconds').defaultTo(0);
    table.boolean('is_completed').defaultTo(false);
    table.timestamps(true, true);
    table.unique(['user_id', 'lesson_id']);
  });

  // Tabela de questionários/quizzes
  await knex.schema.createTable('quizzes', function(table) {
    table.bigIncrements('id').primary();
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.bigInteger('lesson_id').unsigned().nullable().references('id').inTable('lessons');
    table.bigInteger('module_id').unsigned().nullable().references('id').inTable('modules');
    table.bigInteger('course_id').unsigned().nullable().references('id').inTable('courses');
    table.integer('time_limit_minutes').nullable();
    table.integer('passing_score').defaultTo(70);
    table.integer('max_attempts').defaultTo(3);
    table.boolean('shuffle_questions').defaultTo(false);
    table.boolean('show_correct_answers').defaultTo(true);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de questões
  await knex.schema.createTable('questions', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('quiz_id').unsigned().notNullable().references('id').inTable('quizzes').onDelete('CASCADE');
    table.text('question_text').notNullable();
    table.string('question_type', 50).notNullable(); // multiple_choice, true_false, short_answer, essay
    table.json('options').nullable(); // Para questões de múltipla escolha
    table.text('correct_answer').nullable();
    table.text('explanation').nullable();
    table.integer('points').defaultTo(1);
    table.integer('order_index').notNullable();
    table.timestamps(true, true);
  });

  // Tabela de tentativas de quiz
  await knex.schema.createTable('quiz_attempts', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('user');
    table.bigInteger('quiz_id').unsigned().notNullable().references('id').inTable('quizzes');
    table.datetime('started_at').notNullable();
    table.datetime('completed_at').nullable();
    table.integer('score').nullable();
    table.integer('total_points').nullable();
    table.decimal('percentage', 5, 2).nullable();
    table.boolean('passed').nullable();
    table.integer('attempt_number').notNullable();
    table.timestamps(true, true);
  });

  // Tabela de respostas do quiz
  await knex.schema.createTable('quiz_answers', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('attempt_id').unsigned().notNullable().references('id').inTable('quiz_attempts').onDelete('CASCADE');
    table.bigInteger('question_id').unsigned().notNullable().references('id').inTable('questions');
    table.text('user_answer').nullable();
    table.boolean('is_correct').nullable();
    table.integer('points_earned').defaultTo(0);
    table.timestamps(true, true);
  });

  // Tabela de certificados
  await knex.schema.createTable('course_certificates', function(table) {
    table.bigIncrements('id').primary();
    table.string('certificate_number', 100).notNullable().unique();
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('user');
    table.bigInteger('course_id').unsigned().notNullable().references('id').inTable('courses');
    table.datetime('issued_date').notNullable();
    table.string('pdf_url', 500).nullable();
    table.string('validation_url', 500).nullable();
    table.decimal('final_grade', 5, 2).nullable();
    table.integer('course_hours').nullable();
    table.timestamps(true, true);
  });

  // Índices para melhor performance
  await knex.schema.table('courses', function(table) {
    table.index(['is_active', 'is_published']);
    table.index('subject_id');
    table.index('instructor_id');
    table.index('institution_id');
  });

  await knex.schema.table('modules', function(table) {
    table.index('course_id');
  });

  await knex.schema.table('lessons', function(table) {
    table.index('module_id');
  });

  await knex.schema.table('course_enrollments', function(table) {
    table.index('user_id');
    table.index('course_id');
    table.index('status');
  });

  await knex.schema.table('quiz_attempts', function(table) {
    table.index('user_id');
    table.index('quiz_id');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('course_certificates');
  await knex.schema.dropTableIfExists('quiz_answers');
  await knex.schema.dropTableIfExists('quiz_attempts');
  await knex.schema.dropTableIfExists('questions');
  await knex.schema.dropTableIfExists('quizzes');
  await knex.schema.dropTableIfExists('lesson_progress');
  await knex.schema.dropTableIfExists('course_enrollments');
  await knex.schema.dropTableIfExists('lessons');
  await knex.schema.dropTableIfExists('modules');
  await knex.schema.dropTableIfExists('courses');
  await knex.schema.dropTableIfExists('subjects');
};