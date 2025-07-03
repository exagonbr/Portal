import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Criar tabela de instituições primeiro (não tem dependências)
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

  // 2. Criar tabela de roles (não tem dependências)
  await knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable().unique();
    table.text('description');
    table.enum('type', ['system', 'custom']).notNullable().defaultTo('system');
    table.integer('user_count').defaultTo(0);
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamps(true, true);
  });

  // 3. Criar tabela de permissões (não tem dependências)
  await knex.schema.createTable('permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable().unique();
    table.string('resource').notNullable();
    table.string('action').notNullable();
    table.text('description');
    table.timestamps(true, true);
  });

  // 4. Criar tabela de junção role_permissions
  await knex.schema.createTable('role_permissions', (table) => {
    table.uuid('role_id').references('id').inTable('roles').onDelete('CASCADE');
    table.uuid('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
    table.primary(['role_id', 'permission_id']);
    table.timestamps(true, true);
  });

  // 5. Criar tabela de usuários (depende de roles e institutions)
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
    table.string('endereco');
    table.string('telefone');
    table.string('usuario');
    table.string('unidade_ensino');
    table.boolean('is_active').defaultTo(true);
    table.uuid('role_id').references('id').inTable('roles').onDelete('SET NULL');
    table.uuid('institution_id').references('id').inTable('institutions').onDelete('SET NULL');
    table.timestamps(true, true);
  });

  // 6. Criar tabela de escolas (depende de institutions)
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

  // 7. Criar tabela de ciclos educacionais (depende de institutions)
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

  // 8. Criar tabela de turmas (depende de schools e education_cycles)
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

  // 9. Criar tabela de cursos (depende de users para teacher_id)
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

  // 10. Criar tabela de módulos (depende de courses)
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

  // 11. Criar tabela de conteúdo (depende de modules)
  await knex.schema.createTable('content', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('description');
    table.enum('type', ['video', 'document', 'quiz', 'assignment', 'link']).notNullable();
    table.text('content_data'); // JSON data specific to content type
    table.string('file_url');
    table.string('file_type');
    table.integer('file_size');
    table.integer('duration_seconds');
    table.integer('order_index').notNullable();
    table.uuid('module_id').references('id').inTable('modules').onDelete('CASCADE');
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamps(true, true);
  });

  // 12. Criar tabela de livros
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
    table.enum('status', ['available', 'unavailable']).defaultTo('available');
    table.timestamps(true, true);
  });

  // 13. Criar tabela de quizzes (depende de courses)
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

  // 14. Criar tabela de questões (depende de quizzes)
  await knex.schema.createTable('questions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('question_text').notNullable();
    table.enum('type', ['multiple_choice', 'true_false', 'short_answer', 'essay']).notNullable();
    table.json('options'); // For multiple choice questions
    table.json('correct_answers');
    table.decimal('points', 5, 2).defaultTo(1.00);
    table.text('explanation');
    table.integer('order_index').notNullable();
    table.uuid('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // 15. Criar tabela de associação user_classes (depende de users e classes)
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

  // 16. Criar tabela de fórum threads
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

  // 17. Criar tabela de fórum replies
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

  // 18. Criar tabela de notificações
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.enum('type', ['info', 'warning', 'error', 'success']).defaultTo('info');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('sent_by').references('id').inTable('users').onDelete('SET NULL');
    table.boolean('is_read').defaultTo(false);
    table.json('metadata'); // Additional data for the notification
    table.timestamp('read_at');
    table.timestamps(true, true);
  });

  // 19. Criar tabela de push subscriptions
  await knex.schema.createTable('push_subscriptions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.text('endpoint').notNullable();
    table.text('p256dh_key').notNullable();
    table.text('auth_key').notNullable();
    table.string('user_agent');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    table.unique(['user_id', 'endpoint']);
  });

  // 20. Criar tabela de jobs de queue
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

  // 21. Criar tabela de school managers
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

  // 22. Criar tabela de announcements
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

  // 23. Criar tabela de collections
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

  // Criar índices para melhor performance
  await knex.schema.alterTable('users', (table) => {
    table.index(['email']);
    table.index(['role_id']);
    table.index(['institution_id']);
    table.index(['is_active']);
  });

  await knex.schema.alterTable('courses', (table) => {
    table.index(['teacher_id']);
    table.index(['institution_id']);
    table.index(['status']);
  });

  await knex.schema.alterTable('classes', (table) => {
    table.index(['school_id']);
    table.index(['education_cycle_id']);
    table.index(['year']);
  });

  await knex.schema.alterTable('notifications', (table) => {
    table.index(['user_id']);
    table.index(['is_read']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  // Remover tabelas na ordem inversa para evitar problemas de chave estrangeira
  const tables = [
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
    'books',
    'content',
    'modules',
    'courses',
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
}