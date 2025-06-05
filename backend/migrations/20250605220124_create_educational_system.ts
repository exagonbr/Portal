import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Tabela de atividades/assignments
  const hasActivities = await knex.schema.hasTable('activities')
  if (!hasActivities) {
    await knex.schema.createTable('activities', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('title').notNullable();
      table.text('description');
      table.enum('type', ['assignment', 'quiz', 'project', 'exam']).notNullable();
      table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
      table.uuid('class_id').references('id').inTable('classes').onDelete('CASCADE');
      table.uuid('teacher_id').references('id').inTable('users').onDelete('CASCADE');
      table.datetime('due_date').notNullable();
      table.integer('points').notNullable().defaultTo(100);
      table.text('instructions');
      table.json('attachments');
      table.boolean('allow_late_submission').defaultTo(false);
      table.boolean('active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // Tabela de submissões de atividades
  const hasSubmissions = await knex.schema.hasTable('activity_submissions')
  if (!hasSubmissions) {
    await knex.schema.createTable('activity_submissions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('activity_id').references('id').inTable('activities').onDelete('CASCADE');
      table.uuid('student_id').references('id').inTable('users').onDelete('CASCADE');
      table.text('content');
      table.json('attachments');
      table.datetime('submitted_at').notNullable();
      table.datetime('last_modified_at');
      table.enum('status', ['submitted', 'late', 'graded']).defaultTo('submitted');
      table.timestamps(true, true);
      
      table.unique(['activity_id', 'student_id']);
    });
  }

  // Tabela de notas
  const hasGrades = await knex.schema.hasTable('grades')
  if (!hasGrades) {
    await knex.schema.createTable('grades', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('activity_id').references('id').inTable('activities').onDelete('CASCADE');
      table.uuid('student_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('submission_id').references('id').inTable('activity_submissions').onDelete('CASCADE');
      table.uuid('graded_by').references('id').inTable('users').onDelete('SET NULL');
      table.decimal('points_earned', 8, 2).notNullable();
      table.decimal('points_possible', 8, 2).notNullable();
      table.decimal('percentage', 5, 2).notNullable();
      table.string('grade_letter', 2);
      table.text('feedback');
      table.datetime('graded_at').notNullable();
      table.timestamps(true, true);
      
      table.unique(['activity_id', 'student_id']);
    });
  }

  // Tabela de frequência/attendance
  const hasAttendance = await knex.schema.hasTable('attendance')
  if (!hasAttendance) {
    await knex.schema.createTable('attendance', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('class_id').references('id').inTable('classes').onDelete('CASCADE');
      table.uuid('student_id').references('id').inTable('users').onDelete('CASCADE');
      table.date('date').notNullable();
      table.enum('status', ['present', 'absent', 'late', 'excused']).notNullable();
      table.text('notes');
      table.uuid('recorded_by').references('id').inTable('users').onDelete('SET NULL');
      table.timestamps(true, true);
      
      table.unique(['class_id', 'student_id', 'date']);
    });
  }

  // Tabela de módulos de curso
  const hasModules = await knex.schema.hasTable('course_modules')
  if (!hasModules) {
    await knex.schema.createTable('course_modules', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.text('description');
      table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
      table.integer('order_index').notNullable().defaultTo(0);
      table.integer('duration_hours').defaultTo(0);
      table.boolean('active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // Tabela de lições/aulas
  const hasLessons = await knex.schema.hasTable('lessons')
  if (!hasLessons) {
    await knex.schema.createTable('lessons', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('title').notNullable();
      table.text('description');
      table.uuid('module_id').references('id').inTable('course_modules').onDelete('CASCADE');
      table.uuid('class_id').references('id').inTable('classes').onDelete('CASCADE');
      table.integer('order_index').notNullable().defaultTo(0);
      table.enum('type', ['lecture', 'practical', 'lab', 'seminar']).defaultTo('lecture');
      table.datetime('scheduled_at');
      table.integer('duration_minutes').defaultTo(60);
      table.text('content');
      table.json('materials');
      table.boolean('completed').defaultTo(false);
      table.timestamps(true, true);
    });
  }

  // Tabela de progresso do aluno
  const hasProgress = await knex.schema.hasTable('student_progress')
  if (!hasProgress) {
    await knex.schema.createTable('student_progress', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('student_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
      table.uuid('module_id').references('id').inTable('course_modules').onDelete('CASCADE');
      table.uuid('lesson_id').references('id').inTable('lessons').onDelete('CASCADE');
      table.enum('status', ['not_started', 'in_progress', 'completed']).defaultTo('not_started');
      table.decimal('completion_percentage', 5, 2).defaultTo(0);
      table.datetime('started_at');
      table.datetime('completed_at');
      table.integer('time_spent_minutes').defaultTo(0);
      table.timestamps(true, true);
      
      table.unique(['student_id', 'lesson_id']);
    });
  }

  // Tabela de configurações do sistema
  const hasSettings = await knex.schema.hasTable('system_settings')
  if (!hasSettings) {
    await knex.schema.createTable('system_settings', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('key').unique().notNullable();
      table.text('value');
      table.string('type').defaultTo('string');
      table.text('description');
      table.string('category').defaultTo('general');
      table.boolean('is_public').defaultTo(false);
      table.timestamps(true, true);
    });
  }

  // Tabela de logs de auditoria
  const hasAuditLogs = await knex.schema.hasTable('audit_logs')
  if (!hasAuditLogs) {
    await knex.schema.createTable('audit_logs', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
      table.string('action').notNullable();
      table.string('entity_type').notNullable();
      table.uuid('entity_id');
      table.json('old_values');
      table.json('new_values');
      table.string('ip_address');
      table.string('user_agent');
      table.timestamps(true, true);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('system_settings');
  await knex.schema.dropTableIfExists('student_progress');
  await knex.schema.dropTableIfExists('lessons');
  await knex.schema.dropTableIfExists('course_modules');
  await knex.schema.dropTableIfExists('attendance');
  await knex.schema.dropTableIfExists('grades');
  await knex.schema.dropTableIfExists('activity_submissions');
  await knex.schema.dropTableIfExists('activities');
}

