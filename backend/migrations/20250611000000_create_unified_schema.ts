import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('🚀 Executando migration unificada...');

  // SEÇÃO 1: TABELAS FUNDAMENTAIS
  await knex.schema.createTable('institutions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('code').unique().notNullable();
    table.text('description');
    table.string('address');
    table.string('city');
    table.string('state');
    table.string('zip_code');
    table.string('phone');
    table.string('email');
    table.string('website');
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable().unique();
    table.text('description');
    table.enum('type', ['system', 'custom']).notNullable().defaultTo('system');
    table.integer('user_count').defaultTo(0);
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.boolean('active').defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable().unique();
    table.string('resource').notNullable();
    table.string('action').notNullable();
    table.text('description');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('role_permissions', (table) => {
    table.uuid('role_id').references('id').inTable('roles').onDelete('CASCADE');
    table.uuid('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
    table.primary(['role_id', 'permission_id']);
    table.timestamps(true, true);
  });

  // SEÇÃO 2: USUÁRIOS E ESTRUTURA EDUCACIONAL
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.string('name').notNullable();
    table.string('cpf').unique();
    table.string('phone');
    table.date('birth_date');
    table.string('address');
    table.string('city');
    table.string('state');
    table.string('zip_code');
    table.boolean('is_active').defaultTo(true);
    table.uuid('role_id').references('id').inTable('roles').onDelete('SET NULL').defaultTo('35f57500-9a89-4318-bc9f-9acad28c2fb6');
    table.uuid('institution_id').references('id').inTable('institutions').onDelete('SET NULL');
    table.integer('user_id_legacy').nullable().comment('Original MySQL user ID for migration tracking');
    table.index('user_id_legacy');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('schools', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('code').notNullable();
    table.text('description');
    table.string('address');
    table.string('city');
    table.string('state');
    table.string('zip_code');
    table.string('phone');
    table.string('email');
    table.uuid('institution_id').references('id').inTable('institutions').onDelete('CASCADE');
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamps(true, true);
    table.unique(['code', 'institution_id']);
  });

  await knex.schema.alterTable('users', (table) => {
    table.uuid('school_id').references('id').inTable('schools').onDelete('SET NULL');
  });

  await knex.schema.createTable('education_cycles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('code').notNullable();
    table.text('description');
    table.integer('min_age');
    table.integer('max_age');
    table.integer('duration_years');
    table.uuid('institution_id').references('id').inTable('institutions').onDelete('CASCADE');
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamps(true, true);
    table.unique(['code', 'institution_id']);
  });

  await knex.schema.createTable('classes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('code').notNullable();
    table.text('description');
    table.integer('year').notNullable();
    table.integer('semester').defaultTo(1);
    table.integer('max_students').defaultTo(30);
    table.integer('current_students').defaultTo(0);
    table.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
    table.uuid('education_cycle_id').references('id').inTable('education_cycles').onDelete('SET NULL');
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamps(true, true);
    table.unique(['code', 'school_id', 'year']);
  });

  // SEÇÃO 3: CONTEÚDO E ARQUIVOS
  await knex.schema.createTable('files', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('original_name', 255).notNullable();
    table.string('type', 10).notNullable();
    table.bigInteger('size').notNullable();
    table.string('size_formatted', 20).notNullable();
    table.string('bucket', 100).notNullable();
    table.string('s3_key', 500).notNullable().unique();
    table.text('s3_url').notNullable();
    table.text('description');
    table.enum('category', ['literario', 'professor', 'aluno']).notNullable();
    table.json('metadata').defaultTo('{}');
    table.string('checksum', 64);
    table.uuid('uploaded_by').references('id').inTable('users').onDelete('SET NULL');
    table.boolean('is_active').defaultTo(true);
    table.specificType('tags', 'text[]').defaultTo('{}');
    table.timestamp('linked_at');
    table.integer('uploaded_by_legacy').nullable().comment('Original MySQL user ID for migration tracking');
    table.index('uploaded_by_legacy');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('books', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.string('author');
    table.string('isbn').unique();
    table.text('description');
    table.string('publisher');
    table.integer('publication_year');
    table.string('language').defaultTo('pt-BR');
    table.integer('pages');
    table.string('category');
    table.string('cover_url');
    table.string('file_url');
    table.string('file_type');
    table.integer('file_size');
    table.uuid('institution_id').references('id').inTable('institutions').onDelete('CASCADE');
    table.uuid('file_id').references('id').inTable('files').onDelete('SET NULL');
    table.enum('status', ['available', 'unavailable']).defaultTo('available');
    table.timestamps(true, true);
  });

  await knex.schema.alterTable('files', (table) => {
    table.uuid('linked_book_id').references('id').inTable('books').onDelete('SET NULL');
  });

  // SEÇÃO 4: CURSOS E EDUCAÇÃO
  await knex.schema.createTable('courses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.string('code').notNullable();
    table.text('description');
    table.text('objectives');
    table.integer('duration_hours');
    table.string('difficulty_level');
    table.string('category');
    table.string('thumbnail_url');
    table.uuid('teacher_id').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('institution_id').references('id').inTable('institutions').onDelete('CASCADE');
    table.enum('status', ['draft', 'published', 'archived']).defaultTo('draft');
    table.timestamps(true, true);
    table.unique(['code', 'institution_id']);
  });

  await knex.schema.createTable('modules', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('description');
    table.integer('order_index').notNullable();
    table.integer('duration_minutes');
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('content', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('description');
    table.enum('type', ['video', 'document', 'quiz', 'assignment', 'link']).notNullable();
    table.text('content_data');
    table.string('file_url');
    table.string('file_type');
    table.integer('file_size');
    table.integer('duration_seconds');
    table.integer('order_index').notNullable();
    table.uuid('module_id').references('id').inTable('modules').onDelete('CASCADE');
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamps(true, true);
  });

  // SEÇÃO 5: AVALIAÇÕES
  await knex.schema.createTable('quizzes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('description');
    table.integer('time_limit_minutes');
    table.integer('max_attempts').defaultTo(1);
    table.decimal('passing_score', 5, 2).defaultTo(70.00);
    table.boolean('shuffle_questions').defaultTo(false);
    table.boolean('show_results').defaultTo(true);
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.enum('status', ['draft', 'published', 'archived']).defaultTo('draft');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('questions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('question_text').notNullable();
    table.enum('type', ['multiple_choice', 'true_false', 'short_answer', 'essay']).notNullable();
    table.json('options');
    table.json('correct_answers');
    table.decimal('points', 5, 2).defaultTo(1.00);
    table.text('explanation');
    table.integer('order_index').notNullable();
    table.uuid('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // SEÇÃO 6: RELACIONAMENTOS E INTERAÇÕES
  await knex.schema.createTable('user_classes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('class_id').references('id').inTable('classes').onDelete('CASCADE');
    table.enum('role', ['student', 'teacher', 'assistant']).defaultTo('student');
    table.date('enrollment_date').defaultTo(knex.fn.now());
    table.enum('status', ['active', 'inactive', 'completed']).defaultTo('active');
    table.timestamps(true, true);
    table.unique(['user_id', 'class_id']);
  });

  await knex.schema.createTable('forum_threads', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('content').notNullable();
    table.uuid('author_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.boolean('is_pinned').defaultTo(false);
    table.boolean('is_locked').defaultTo(false);
    table.integer('views_count').defaultTo(0);
    table.integer('replies_count').defaultTo(0);
    table.enum('status', ['active', 'archived']).defaultTo('active');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('forum_replies', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('content').notNullable();
    table.uuid('author_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('thread_id').references('id').inTable('forum_threads').onDelete('CASCADE');
    table.uuid('parent_reply_id').references('id').inTable('forum_replies').onDelete('CASCADE');
    table.boolean('is_solution').defaultTo(false);
    table.integer('likes_count').defaultTo(0);
    table.enum('status', ['active', 'deleted']).defaultTo('active');
    table.timestamps(true, true);
  });

  // SEÇÃO 7: NOTIFICAÇÕES E SISTEMAS
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.enum('type', ['info', 'warning', 'error', 'success']).defaultTo('info');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('sent_by').references('id').inTable('users').onDelete('SET NULL');
    table.boolean('is_read').defaultTo(false);
    table.json('metadata');
    table.timestamp('read_at');
    table.integer('user_id_legacy').nullable().comment('Original MySQL user ID for migration tracking');
    table.index('user_id_legacy');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('push_subscriptions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.text('endpoint').notNullable();
    table.text('p256dh_key').notNullable();
    table.text('auth_key').notNullable();
    table.string('user_agent');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_used');
    table.timestamps(true, true);
    table.unique(['user_id', 'endpoint']);
  });

  await knex.schema.createTable('queue_jobs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('queue_name').notNullable();
    table.string('job_type').notNullable();
    table.json('job_data');
    table.enum('status', ['pending', 'processing', 'completed', 'failed']).defaultTo('pending');
    table.text('error_message');
    table.integer('attempts').defaultTo(0);
    table.integer('max_attempts').defaultTo(3);
    table.timestamp('scheduled_at').defaultTo(knex.fn.now());
    table.timestamp('started_at');
    table.timestamp('completed_at');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('school_managers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
    table.enum('role', ['director', 'coordinator', 'supervisor']).defaultTo('coordinator');
    table.date('start_date').defaultTo(knex.fn.now());
    table.date('end_date');
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamps(true, true);
    table.unique(['user_id', 'school_id']);
  });

  await knex.schema.createTable('announcements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('content').notNullable();
    table.enum('type', ['general', 'urgent', 'academic', 'administrative']).defaultTo('general');
    table.uuid('author_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('institution_id').references('id').inTable('institutions').onDelete('CASCADE');
    table.uuid('school_id').references('id').inTable('schools').onDelete('SET NULL');
    table.uuid('class_id').references('id').inTable('classes').onDelete('SET NULL');
    table.boolean('is_published').defaultTo(false);
    table.timestamp('published_at');
    table.timestamp('expires_at');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('collections', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('description');
    table.enum('type', ['books', 'videos', 'documents', 'mixed']).defaultTo('mixed');
    table.uuid('created_by').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('institution_id').references('id').inTable('institutions').onDelete('CASCADE');
    table.boolean('is_public').defaultTo(false);
    table.integer('items_count').defaultTo(0);
    table.specificType('tags', 'text[]').defaultTo('{}');
    table.integer('created_by_legacy').nullable().comment('Original MySQL user ID for migration tracking');
    table.index('created_by_legacy');
    table.timestamps(true, true);
    table.unique(['name', 'institution_id']);
  });

  // SEÇÃO 8: CONFIGURAÇÕES AWS
  await knex.schema.createTable('aws_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('setting_key').unique().notNullable();
    table.text('setting_value').notNullable();
    table.text('description');
    table.boolean('is_encrypted').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('aws_connection_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('service_name').notNullable();
    table.string('operation').notNullable();
    table.enum('status', ['success', 'error', 'timeout']).notNullable();
    table.text('error_message');
    table.json('request_data');
    table.json('response_data');
    table.integer('duration_ms');
    table.string('aws_request_id');
    table.timestamps(true, true);
  });

  // SEÇÃO 9: TABELAS DO SISTEMA EDUCACIONAL
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
    table.integer('student_id_legacy').nullable().comment('Original MySQL user ID for migration tracking');
    table.index('student_id_legacy');
    table.timestamps(true, true);
    table.unique(['student_id', 'lesson_id']);
  });

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
    table.integer('user_id_legacy').nullable().comment('Original MySQL user ID for migration tracking');
    table.index('user_id_legacy');
    table.timestamps(true, true);
  });

  console.log('✅ Migration unificada executada com sucesso!');
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Revertendo migration unificada...');
  const tables = [
    'audit_logs', 'system_settings', 'student_progress', 'lessons', 'course_modules',
    'attendance', 'grades', 'activity_submissions', 'activities', 'collections',
    'announcements', 'school_managers', 'queue_jobs', 'push_subscriptions',
    'notifications', 'forum_replies', 'forum_threads', 'user_classes',
    'questions', 'quizzes', 'content', 'modules', 'courses', 'books', 'files',
    'classes', 'education_cycles', 'schools', 'users', 'role_permissions',
    'permissions', 'roles', 'institutions'
  ];

  for (const table of tables) {
    await knex.schema.dropTableIfExists(table);
  }

  console.log('✅ Migration unificada revertida com sucesso!');
}