import type { Knex } from 'knex';

/**
 * MIGRATION CONSOLIDADA - LEGADO UNIFICADO
 * Esta migration unifica todas as migrations anteriores em uma única para facilitar
 * a manutenção e deployment em ambientes legados.
 * 
 * Baseada nas migrations:
 * - 20250129000001_create_complete_schema.ts
 * - 20250129000002_create_files_table.ts  
 * - 20250130000001_add_last_used_to_push_subscriptions.ts
 * - 20250131000001_add_school_id_to_users.ts
 * - 20250131000002_create_aws_settings_table.ts
 * - 20250131000003_create_aws_connection_logs_table.ts
 * - 20250131000004_enhance_files_books_relationship.ts
 */

export async function up(knex: Knex): Promise<void> {
  console.log('🚀 Executando migration consolidada do legado...');

  // ========== SEÇÃO 1: TABELAS FUNDAMENTAIS ==========
  
  // 1. Instituições (sem dependências)
  const hasInstitutions = await knex.schema.hasTable('institutions');
  if (!hasInstitutions) {
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
      table.timestamps(true, true);
    });
  }

  // 2. Roles (sem dependências)
  const hasRoles = await knex.schema.hasTable('roles');
  if (!hasRoles) {
    await knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable().unique();
    table.text('description');
    table.enum('type', ['system', 'custom']).notNullable().defaultTo('system');
    table.integer('user_count').defaultTo(0);
    table.enum('status', ['active', 'inactive']).defaultTo('active');
      table.timestamps(true, true);
    });
  }

  // 3. Permissões (sem dependências)
  const hasPermissions = await knex.schema.hasTable('permissions');
  if (!hasPermissions) {
    await knex.schema.createTable('permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable().unique();
    table.string('resource').notNullable();
    table.string('action').notNullable();
    table.text('description');
      table.timestamps(true, true);
    });
  }

  // 4. Role-Permissions (depende de roles e permissions)
  const hasRolePermissions = await knex.schema.hasTable('role_permissions');
  if (!hasRolePermissions) {
    await knex.schema.createTable('role_permissions', (table) => {
    table.uuid('role_id').references('id').inTable('roles').onDelete('CASCADE');
    table.uuid('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
      table.primary(['role_id', 'permission_id']);
      table.timestamps(true, true);
    });
  }

  // ========== SEÇÃO 2: USUÁRIOS E ESTRUTURA EDUCACIONAL ==========

  // 5. Usuários (depende de roles e institutions)
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) {
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
    table.string('endereco'); // Campo legado
    table.string('telefone'); // Campo legado
    table.string('usuario'); // Campo legado
    table.string('unidade_ensino'); // Campo legado
    table.boolean('is_active').defaultTo(true);
    table.uuid('role_id').references('id').inTable('roles').onDelete('SET NULL');
    table.uuid('institution_id').references('id').inTable('institutions').onDelete('SET NULL');
    table.timestamps(true, true);
    });
  }

  // 6. Escolas (depende de institutions)
  const hasSchools = await knex.schema.hasTable('schools');
  if (!hasSchools) {
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
  }

  // Adicionar a referência school_id aos usuários agora que schools existe
  const hasSchoolIdColumn = await knex.schema.hasColumn('users', 'school_id');
  if (!hasSchoolIdColumn) {
    await knex.schema.alterTable('users', (table) => {
      table.uuid('school_id').references('id').inTable('schools').onDelete('SET NULL');
    });
  }

  // 7. Ciclos educacionais (depende de institutions)
  const hasEducationCycles = await knex.schema.hasTable('education_cycles');
  if (!hasEducationCycles) {
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
  }

  // 8. Turmas (depende de schools e education_cycles)
  const hasClasses = await knex.schema.hasTable('classes');
  if (!hasClasses) {
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
  }

  // ========== SEÇÃO 3: CONTEÚDO E ARQUIVOS ==========

  // 9. Arquivos (tabela completa com todas as melhorias)
  const hasFiles = await knex.schema.hasTable('files');
  if (!hasFiles) {
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
      table.timestamps(true, true);
    });
  }

  // 10. Livros (com referência a files)
  const hasBooks = await knex.schema.hasTable('books');
  if (!hasBooks) {
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
      table.uuid('file_id').references('id').inTable('files').onDelete('SET NULL'); // Adicionado
      table.enum('status', ['available', 'unavailable']).defaultTo('available');
      table.timestamps(true, true);
    });
  }

  // Atualizar files para referenciar books (relacionamento bidirecional)
  const hasLinkedBookIdColumn = await knex.schema.hasColumn('files', 'linked_book_id');
  if (!hasLinkedBookIdColumn) {
    await knex.schema.alterTable('files', (table) => {
      table.uuid('linked_book_id').references('id').inTable('books').onDelete('SET NULL');
    });
  }

  // ========== SEÇÃO 4: CURSOS E EDUCAÇÃO ==========

  // 11. Cursos
  const hasCourses = await knex.schema.hasTable('courses');
  if (!hasCourses) {
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
  }

  // 12. Módulos
  const hasModules = await knex.schema.hasTable('modules');
  if (!hasModules) {
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
  }

  // 13. Conteúdo
  const hasContent = await knex.schema.hasTable('content');
  if (!hasContent) {
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
  }

  // ========== SEÇÃO 5: AVALIAÇÕES ==========

  // 14. Quizzes
  const hasQuizzes = await knex.schema.hasTable('quizzes');
  if (!hasQuizzes) {
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
  }

  // 15. Questões
  const hasQuestions = await knex.schema.hasTable('questions');
  if (!hasQuestions) {
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
  }

  // ========== SEÇÃO 6: RELACIONAMENTOS E INTERAÇÕES ==========

  // 16. User-Classes
  const hasUserClasses = await knex.schema.hasTable('user_classes');
  if (!hasUserClasses) {
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
  }

  // 17. Forum Threads
  const hasForumThreads = await knex.schema.hasTable('forum_threads');
  if (!hasForumThreads) {
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
  }

  // 18. Forum Replies
  const hasForumReplies = await knex.schema.hasTable('forum_replies');
  if (!hasForumReplies) {
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
  }

  // ========== SEÇÃO 7: NOTIFICAÇÕES E SISTEMAS ==========

  // 19. Notificações
  const hasNotifications = await knex.schema.hasTable('notifications');
  if (!hasNotifications) {
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
      table.timestamps(true, true);
    });
  }

  // 20. Push Subscriptions (com last_used adicionado)
  const hasPushSubscriptions = await knex.schema.hasTable('push_subscriptions');
  if (!hasPushSubscriptions) {
    await knex.schema.createTable('push_subscriptions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.text('endpoint').notNullable();
      table.text('p256dh_key').notNullable();
      table.text('auth_key').notNullable();
      table.string('user_agent');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('last_used'); // Adicionado
      table.timestamps(true, true);
      table.unique(['user_id', 'endpoint']);
    });
  }

  // 21. Queue Jobs
  const hasQueueJobs = await knex.schema.hasTable('queue_jobs');
  if (!hasQueueJobs) {
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
  }

  // 22. School Managers
  const hasSchoolManagers = await knex.schema.hasTable('school_managers');
  if (!hasSchoolManagers) {
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
  }

  // 23. Announcements
  const hasAnnouncements = await knex.schema.hasTable('announcements');
  if (!hasAnnouncements) {
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
  }

  // 24. Collections
  const hasCollections = await knex.schema.hasTable('collections');
  if (!hasCollections) {
    await knex.schema.createTable('collections', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.text('description');
      table.enum('type', ['books', 'videos', 'documents', 'mixed']).defaultTo('mixed');
      table.uuid('created_by').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('institution_id').references('id').inTable('institutions').onDelete('CASCADE');
      table.boolean('is_public').defaultTo(false);
      table.integer('items_count').defaultTo(0);
      table.timestamps(true, true);
    });
  }

  // ========== SEÇÃO 8: CONFIGURAÇÕES AWS ==========

  // 25. AWS Settings
  const hasAwsSettings = await knex.schema.hasTable('aws_settings');
  if (!hasAwsSettings) {
    await knex.schema.createTable('aws_settings', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('setting_key').unique().notNullable();
      table.text('setting_value').notNullable();
      table.text('description');
      table.boolean('is_encrypted').defaultTo(false);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // 26. AWS Connection Logs
  const hasAwsConnectionLogs = await knex.schema.hasTable('aws_connection_logs');
  if (!hasAwsConnectionLogs) {
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
  }

  // ========== SEÇÃO 9: ÍNDICES DE PERFORMANCE ==========

  // Índices para users
  const hasUsersEmailIndex = await knex.raw(`
    SELECT to_regclass('public.users_email_index') IS NOT NULL AS exists;
  `);
  if (!hasUsersEmailIndex.rows[0].exists) {
    await knex.schema.alterTable('users', (table) => {
      table.index(['email'], 'users_email_index');
    });
  }
  const hasUsersRoleIdIndex = await knex.raw(`
    SELECT to_regclass('public.users_role_id_index') IS NOT NULL AS exists;
  `);
  if (!hasUsersRoleIdIndex.rows[0].exists) {
    await knex.schema.alterTable('users', (table) => {
      table.index(['role_id'], 'users_role_id_index');
    });
  }
  const hasUsersInstitutionIdIndex = await knex.raw(`
    SELECT to_regclass('public.users_institution_id_index') IS NOT NULL AS exists;
  `);
  if (!hasUsersInstitutionIdIndex.rows[0].exists) {
    await knex.schema.alterTable('users', (table) => {
      table.index(['institution_id'], 'users_institution_id_index');
    });
  }
  const hasUsersSchoolIdIndex = await knex.raw(`
    SELECT to_regclass('public.users_school_id_index') IS NOT NULL AS exists;
  `);
  if (!hasUsersSchoolIdIndex.rows[0].exists) {
    await knex.schema.alterTable('users', (table) => {
      table.index(['school_id'], 'users_school_id_index');
    });
  }
  const hasUsersIsActiveIndex = await knex.raw(`
    SELECT to_regclass('public.users_is_active_index') IS NOT NULL AS exists;
  `);
  if (!hasUsersIsActiveIndex.rows[0].exists) {
    await knex.schema.alterTable('users', (table) => {
      table.index(['is_active'], 'users_is_active_index');
    });
  }

  // Índices para files
  const hasFilesCategoryIndex = await knex.raw(`
    SELECT to_regclass('public.files_category_index') IS NOT NULL AS exists;
  `);
  if (!hasFilesCategoryIndex.rows[0].exists) {
    await knex.schema.alterTable('files', (table) => {
      table.index(['category'], 'files_category_index');
    });
  }
  const hasFilesBucketIndex = await knex.raw(`
    SELECT to_regclass('public.files_bucket_index') IS NOT NULL AS exists;
  `);
  if (!hasFilesBucketIndex.rows[0].exists) {
    await knex.schema.alterTable('files', (table) => {
      table.index(['bucket'], 'files_bucket_index');
    });
  }
  const hasFilesS3KeyIndex = await knex.raw(`
    SELECT to_regclass('public.files_s3_key_index') IS NOT NULL AS exists;
  `);
  if (!hasFilesS3KeyIndex.rows[0].exists) {
    await knex.schema.alterTable('files', (table) => {
      table.index(['s3_key'], 'files_s3_key_index');
    });
  }
  const hasFilesTypeIndex = await knex.raw(`
    SELECT to_regclass('public.files_type_index') IS NOT NULL AS exists;
  `);
  if (!hasFilesTypeIndex.rows[0].exists) {
    await knex.schema.alterTable('files', (table) => {
      table.index(['type'], 'files_type_index');
    });
  }
  const hasFilesUploadedByIndex = await knex.raw(`
    SELECT to_regclass('public.files_uploaded_by_index') IS NOT NULL AS exists;
  `);
  if (!hasFilesUploadedByIndex.rows[0].exists) {
    await knex.schema.alterTable('files', (table) => {
      table.index(['uploaded_by'], 'files_uploaded_by_index');
    });
  }
  const hasFilesIsActiveIndex = await knex.raw(`
    SELECT to_regclass('public.files_is_active_index') IS NOT NULL AS exists;
  `);
  if (!hasFilesIsActiveIndex.rows[0].exists) {
    await knex.schema.alterTable('files', (table) => {
      table.index(['is_active'], 'files_is_active_index');
    });
  }
  const hasFilesCreatedAtIndex = await knex.raw(`
    SELECT to_regclass('public.files_created_at_index') IS NOT NULL AS exists;
  `);
  if (!hasFilesCreatedAtIndex.rows[0].exists) {
    await knex.schema.alterTable('files', (table) => {
      table.index(['created_at'], 'files_created_at_index');
    });
  }
  const hasFilesLinkedBookIdIndex = await knex.raw(`
    SELECT to_regclass('public.files_linked_book_id_index') IS NOT NULL AS exists;
  `);
  if (!hasFilesLinkedBookIdIndex.rows[0].exists) {
    await knex.schema.alterTable('files', (table) => {
      table.index(['linked_book_id'], 'files_linked_book_id_index');
    });
  }

  // Índices para courses
  const hasCoursesTeacherIdIndex = await knex.raw(`
    SELECT to_regclass('public.courses_teacher_id_index') IS NOT NULL AS exists;
  `);
  if (!hasCoursesTeacherIdIndex.rows[0].exists) {
    await knex.schema.alterTable('courses', (table) => {
      table.index(['teacher_id'], 'courses_teacher_id_index');
    });
  }
  const hasCoursesInstitutionIdIndex = await knex.raw(`
    SELECT to_regclass('public.courses_institution_id_index') IS NOT NULL AS exists;
  `);
  if (!hasCoursesInstitutionIdIndex.rows[0].exists) {
    await knex.schema.alterTable('courses', (table) => {
      table.index(['institution_id'], 'courses_institution_id_index');
    });
  }
  const hasCoursesStatusIndex = await knex.raw(`
    SELECT to_regclass('public.courses_status_index') IS NOT NULL AS exists;
  `);
  if (!hasCoursesStatusIndex.rows[0].exists) {
    await knex.schema.alterTable('courses', (table) => {
      table.index(['status'], 'courses_status_index');
    });
  }

  // Índices para classes
  const hasClassesSchoolIdIndex = await knex.raw(`
    SELECT to_regclass('public.classes_school_id_index') IS NOT NULL AS exists;
  `);
  if (!hasClassesSchoolIdIndex.rows[0].exists) {
    await knex.schema.alterTable('classes', (table) => {
      table.index(['school_id'], 'classes_school_id_index');
    });
  }
  const hasClassesEducationCycleIdIndex = await knex.raw(`
    SELECT to_regclass('public.classes_education_cycle_id_index') IS NOT NULL AS exists;
  `);
  if (!hasClassesEducationCycleIdIndex.rows[0].exists) {
    await knex.schema.alterTable('classes', (table) => {
      table.index(['education_cycle_id'], 'classes_education_cycle_id_index');
    });
  }
  const hasClassesYearIndex = await knex.raw(`
    SELECT to_regclass('public.classes_year_index') IS NOT NULL AS exists;
  `);
  if (!hasClassesYearIndex.rows[0].exists) {
    await knex.schema.alterTable('classes', (table) => {
      table.index(['year'], 'classes_year_index');
    });
  }

  // Índices para notifications
  const hasNotificationsUserIdIndex = await knex.raw(`
    SELECT to_regclass('public.notifications_user_id_index') IS NOT NULL AS exists;
  `);
  if (!hasNotificationsUserIdIndex.rows[0].exists) {
    await knex.schema.alterTable('notifications', (table) => {
      table.index(['user_id'], 'notifications_user_id_index');
    });
  }
  const hasNotificationsIsReadIndex = await knex.raw(`
    SELECT to_regclass('public.notifications_is_read_index') IS NOT NULL AS exists;
  `);
  if (!hasNotificationsIsReadIndex.rows[0].exists) {
    await knex.schema.alterTable('notifications', (table) => {
      table.index(['is_read'], 'notifications_is_read_index');
    });
  }
  const hasNotificationsCreatedAtIndex = await knex.raw(`
    SELECT to_regclass('public.notifications_created_at_index') IS NOT NULL AS exists;
  `);
  if (!hasNotificationsCreatedAtIndex.rows[0].exists) {
    await knex.schema.alterTable('notifications', (table) => {
      table.index(['created_at'], 'notifications_created_at_index');
    });
  }

  // Índice GIN para tags (PostgreSQL específico)
  const hasFilesTagsGinIndex = await knex.raw(`
    SELECT to_regclass('public.idx_files_tags') IS NOT NULL AS exists;
  `);
  if (!hasFilesTagsGinIndex.rows[0].exists) {
    await knex.raw('CREATE INDEX idx_files_tags ON files USING gin(tags)');
  }

  // ========== SEÇÃO 10: VIEWS E FUNÇÕES ==========

  // Drop views if they exist before creating
  await knex.raw('DROP VIEW IF EXISTS v_files_summary');
  await knex.raw('DROP VIEW IF EXISTS v_files_with_books');

  // View para resumo de arquivos
  await knex.raw(`
    CREATE VIEW v_files_summary AS
    SELECT 
        category,
        COUNT(*) as total_files,
        COUNT(*) FILTER (WHERE is_active = true) as active_files,
        SUM(size) as total_size,
        pg_size_pretty(SUM(size)) as total_size_formatted
    FROM files
    GROUP BY category;
  `);

  // View para arquivos com livros
  await knex.raw(`
    CREATE VIEW v_files_with_books AS
    SELECT 
        f.id,
        f.name,
        f.original_name,
        f.type,
        f.size,
        f.size_formatted,
        f.bucket,
        f.s3_key,
        f.s3_url,
        f.description,
        f.category,
        f.metadata,
        f.tags,
        f.is_active,
        f.created_at,
        f.updated_at,
        f.linked_book_id,
        f.linked_at,
        b.id as book_id,
        b.title as book_title,
        b.author as book_author,
        b.publisher as book_publisher,
        b.status as book_status,
        CASE 
            WHEN b.id IS NOT NULL THEN true 
            ELSE false 
        END as has_book_reference
    FROM files f
    LEFT JOIN books b ON f.linked_book_id = b.id OR b.file_id = f.id
    WHERE f.is_active = true;
  `);

  // Função para arquivos órfãos
  await knex.raw(`
    CREATE OR REPLACE FUNCTION find_orphan_s3_files(p_s3_keys TEXT[])
    RETURNS TABLE(s3_key TEXT) AS $$
    BEGIN
        RETURN QUERY
        SELECT unnest(p_s3_keys) AS s3_key
        EXCEPT
        SELECT files.s3_key FROM files WHERE files.is_active = true;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Função para vincular arquivo a livro
  await knex.raw(`
    CREATE OR REPLACE FUNCTION link_file_to_book(
        p_file_id UUID,
        p_book_id UUID
    )
    RETURNS BOOLEAN AS $$
    DECLARE
        file_exists BOOLEAN := false;
        book_exists BOOLEAN := false;
    BEGIN
        SELECT EXISTS(SELECT 1 FROM files WHERE id = p_file_id AND is_active = true) INTO file_exists;
        SELECT EXISTS(SELECT 1 FROM books WHERE id = p_book_id) INTO book_exists;
        
        IF NOT file_exists THEN
            RAISE EXCEPTION 'Arquivo não encontrado ou não está ativo';
        END IF;
        
        IF NOT book_exists THEN
            RAISE EXCEPTION 'Livro não encontrado';
        END IF;
        
        UPDATE files 
        SET 
            linked_book_id = p_book_id,
            linked_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_file_id;
        
        UPDATE books 
        SET 
            file_id = p_file_id,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_book_id;
        
        RETURN true;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Função para desvincular arquivo de livro
  await knex.raw(`
    CREATE OR REPLACE FUNCTION unlink_file_from_book(p_file_id UUID)
    RETURNS BOOLEAN AS $$
    DECLARE
        linked_book_id UUID;
    BEGIN
        SELECT files.linked_book_id INTO linked_book_id 
        FROM files 
        WHERE id = p_file_id;
        
        UPDATE files 
        SET 
            linked_book_id = NULL,
            linked_at = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_file_id;
        
        IF linked_book_id IS NOT NULL THEN
            UPDATE books 
            SET 
                file_id = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = linked_book_id;
        END IF;
        
        RETURN true;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Trigger para atualização automática de updated_at em files
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_files_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Drop trigger if exists before creating
  await knex.raw('DROP TRIGGER IF EXISTS trigger_files_updated_at ON files');

  await knex.raw(`
    CREATE TRIGGER trigger_files_updated_at
        BEFORE UPDATE ON files
        FOR EACH ROW
        EXECUTE FUNCTION update_files_updated_at();
  `);

  console.log('✅ Migration consolidada do legado executada com sucesso!');
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Revertendo migration consolidada...');

  // Remover funções e triggers
  await knex.raw('DROP TRIGGER IF EXISTS trigger_files_updated_at ON files');
  await knex.raw('DROP FUNCTION IF EXISTS update_files_updated_at()');
  await knex.raw('DROP FUNCTION IF EXISTS unlink_file_from_book(UUID)');
  await knex.raw('DROP FUNCTION IF EXISTS link_file_to_book(UUID, UUID)');
  await knex.raw('DROP FUNCTION IF EXISTS find_orphan_s3_files(TEXT[])');
  
  // Remover views
  await knex.raw('DROP VIEW IF EXISTS v_files_with_books');
  await knex.raw('DROP VIEW IF EXISTS v_files_summary');

  // Remover tabelas na ordem inversa
  const tables = [
    'aws_connection_logs',
    'aws_settings',
    'collections',
    'announcements',
    'school_managers',
    'queue_jobs',
    'push_subscriptions',
    'notifications',
    'forum_replies',
    'forum_threads',
    'user_classes',
    'questions',
    'quizzes',
    'content',
    'modules',
    'courses',
    'books',
    'files',
    'classes',
    'education_cycles',
    'schools',
    'users',
    'role_permissions',
    'permissions',
    'roles',
    'institutions'
  ];

  for (const table of tables) {
    await knex.schema.dropTableIfExists(table);
  }

  console.log('✅ Migration consolidada revertida com sucesso!');
} 