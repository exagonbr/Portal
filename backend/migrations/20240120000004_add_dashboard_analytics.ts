import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create teacher_dashboard_data table
  await knex.schema.createTable('teacher_dashboard_data', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('teacher_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('total_students').defaultTo(0);
    table.integer('active_classes').defaultTo(0);
    table.decimal('average_attendance', 5, 2).defaultTo(0);
    table.jsonb('upcoming_classes');
    table.jsonb('student_performance');
    table.jsonb('class_attendance');
    table.jsonb('subject_distribution');
    table.jsonb('class_performance');
    table.jsonb('recent_activities');
    table.timestamps(true, true);
  });

  // Create student_dashboard_data table
  await knex.schema.createTable('student_dashboard_data', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('student_id').references('id').inTable('users').onDelete('CASCADE');
    table.decimal('current_grade', 5, 2).defaultTo(0);
    table.decimal('attendance_rate', 5, 2).defaultTo(0);
    table.integer('completed_assignments').defaultTo(0);
    table.integer('total_assignments').defaultTo(0);
    table.jsonb('ranking');
    table.jsonb('upcoming_deadlines');
    table.jsonb('grade_history');
    table.jsonb('attendance_by_subject');
    table.jsonb('weekly_study_hours');
    table.jsonb('performance_history');
    table.timestamps(true, true);
  });

  // Create assignments table
  await knex.schema.createTable('assignments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.uuid('teacher_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description');
    table.enum('type', ['Trabalho', 'Relatório', 'Avaliação', 'Questionário']).notNullable();
    table.date('deadline');
    table.integer('weight').defaultTo(0);
    table.enum('status', ['Pendente', 'Em Andamento', 'Concluído', 'Não Iniciado']).defaultTo('Não Iniciado');
    table.timestamps(true, true);
  });

  // Create assignment_submissions table
  await knex.schema.createTable('assignment_submissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('assignment_id').references('id').inTable('assignments').onDelete('CASCADE');
    table.uuid('student_id').references('id').inTable('users').onDelete('CASCADE');
    table.text('content');
    table.string('file_path');
    table.decimal('grade', 5, 2);
    table.text('feedback');
    table.enum('status', ['Submetido', 'Avaliado', 'Pendente']).defaultTo('Pendente');
    table.timestamps(true, true);
  });

  // Create attendance table
  await knex.schema.createTable('attendance', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('student_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.date('date').notNullable();
    table.boolean('present').defaultTo(false);
    table.text('notes');
    table.timestamps(true, true);
    table.unique(['student_id', 'course_id', 'date']);
  });

  // Create grades table
  await knex.schema.createTable('grades', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('student_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.uuid('assignment_id').references('id').inTable('assignments').onDelete('CASCADE');
    table.decimal('grade', 5, 2).notNullable();
    table.integer('weight').defaultTo(25);
    table.text('feedback');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('grades');
  await knex.schema.dropTableIfExists('attendance');
  await knex.schema.dropTableIfExists('assignment_submissions');
  await knex.schema.dropTableIfExists('assignments');
  await knex.schema.dropTableIfExists('student_dashboard_data');
  await knex.schema.dropTableIfExists('teacher_dashboard_data');
}
