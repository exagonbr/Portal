import type { Knex } from 'knex';

/**
 * 🔥 MIGRATION COMPLETA: MySQL → PostgreSQL
 * 
 * Esta migração executa:
 * 1. DROP CASCADE de todas as tabelas existentes
 * 2. Criação completa do schema PostgreSQL
 * 3. Seeding básico com dados padrão
 * 
 * ⚠️ ATENÇÃO: Esta migração irá APAGAR todos os dados existentes!
 */

export async function up(knex: Knex): Promise<void> {
  console.log('🔥 Iniciando migração completa MySQL → PostgreSQL...');
  
  // 🧹 PASSO 1: LIMPEZA COMPLETA (DROP CASCADE)
  console.log('🧹 Removendo todas as tabelas existentes...');
  
  const tables = [
    // Tabelas principais
    'users', 'user', 'roles', 'permissions', 'role_permissions',
    'institutions', 'instittution', 'schools', 'school',
    'education_cycles', 'classes', 'user_classes',
    
    // Conteúdo e arquivos
    'files', 'books', 'collections', 'courses', 'modules', 'content',
    'videos', 'documents', 'media_files',
    
    // Avaliações
    'quizzes', 'questions', 'answers', 'quiz_questions', 'quiz_answers',
    'quiz_submissions', 'quiz_results', 'assignments', 'submissions',
    
    // Comunicação
    'forum_threads', 'forum_replies', 'chats', 'chat_messages',
    'notifications', 'announcements', 'news',
    
    // Análise e logs
    'activity_logs', 'user_activities', 'analytics_sessions',
    'attendance_records', 'audit_logs', 'system_logs',
    'performance_metrics', 'aws_connection_logs',
    
    // Tracking e sessões
    'activity_sessions', 'user_sessions', 'student_progress',
    'reading_progress', 'quiz_attempts', 'course_enrollments',
    
    // Configurações
    'system_settings', 'aws_settings', 'email_templates',
    'notification_settings', 'user_preferences',
    
    // Tags e categorias
    'tags', 'categories', 'genres', 'themes', 'subjects',
    'tag_relations', 'content_tags',
    
    // Grupos e relacionamentos
    'user_groups', 'group_members', 'user_roles',
    'class_schedules', 'timetables',
    
    // Certificados e avaliações
    'certificates', 'grades', 'evaluations', 'feedback',
    
    // Migração e dados legados
    'migration_logs', 'data_mappings', 'legacy_data'
  ];
  
  for (const table of tables) {
    await knex.schema.dropTableIfExists(table);
  }
  
  console.log('✅ Limpeza completa finalizada');
  
  // 🏗️ PASSO 2: CRIAÇÃO DO SCHEMA COMPLETO
  console.log('🏗️ Criando schema PostgreSQL completo...');
  
  // === TABELAS FUNDAMENTAIS ===
  
  // 1. Roles (deve ser criada primeiro)
  await knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').unique().notNullable();
    table.string('code').unique().notNullable();
    table.text('description');
    table.json('permissions').defaultTo('{}');
    table.boolean('is_system').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Índices
    table.index(['name', 'is_active']);
    table.index('code');
  });
  
  // 2. Permissions
  await knex.schema.createTable('permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').unique().notNullable();
    table.string('code').unique().notNullable();
    table.text('description');
    table.string('resource').notNullable();
    table.string('action').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Índices
    table.index(['resource', 'action']);
    table.index('code');
  });
  
  // 3. Role Permissions
  await knex.schema.createTable('role_permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('role_id').references('id').inTable('roles').onDelete('CASCADE');
    table.uuid('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
    table.timestamps(true, true);
    
    // Constraint única
    table.unique(['role_id', 'permission_id']);
  });
  
  // 4. Institutions
  await knex.schema.createTable('institutions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('code').unique().notNullable();
    table.enum('type', ['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TECH_CENTER']).notNullable().defaultTo('SCHOOL');
    table.text('description');
    table.string('address');
    table.string('city');
    table.string('state');
    table.string('zip_code');
    table.string('phone');
    table.string('email');
    table.string('website');
    table.json('settings').defaultTo('{}');
    table.boolean('is_active').defaultTo(true);
    table.integer('institution_id_legacy').nullable().comment('Original MySQL institution ID');
    table.timestamps(true, true);
    
    // Índices
    table.index('code');
    table.index('institution_id_legacy');
    table.index(['type', 'is_active']);
  });
  
  // 5. Schools
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
    table.boolean('is_active').defaultTo(true);
    table.integer('school_id_legacy').nullable().comment('Original MySQL school ID');
    table.timestamps(true, true);
    
    // Constraints
    table.unique(['code', 'institution_id']);
    
    // Índices
    table.index('school_id_legacy');
    table.index(['institution_id', 'is_active']);
  });
  
  // 6. Users (principal)
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
    table.string('avatar_url');
    table.json('profile_data').defaultTo('{}');
    table.boolean('is_active').defaultTo(true);
    table.boolean('email_verified').defaultTo(false);
    table.timestamp('last_login');
    table.timestamp('password_changed_at');
    
    // Relacionamentos
    table.uuid('role_id').references('id').inTable('roles').onDelete('SET NULL');
    table.uuid('institution_id').references('id').inTable('institutions').onDelete('SET NULL');
    table.uuid('school_id').references('id').inTable('schools').onDelete('SET NULL');
    
    // Campos OAuth
    table.string('google_id').unique();
    table.string('microsoft_id').unique();
    table.string('provider').defaultTo('local');
    
    // Migração
    table.integer('user_id_legacy').nullable().comment('Original MySQL user ID');
    table.timestamps(true, true);
    
    // Índices
    table.index('email');
    table.index('user_id_legacy');
    table.index(['role_id', 'is_active']);
    table.index(['institution_id', 'is_active']);
    table.index(['google_id']);
    table.index(['provider', 'is_active']);
  });
  
  // === ESTRUTURA EDUCACIONAL ===
  
  // 7. Education Cycles
  await knex.schema.createTable('education_cycles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('code').notNullable();
    table.text('description');
    table.integer('min_age');
    table.integer('max_age');
    table.integer('duration_years');
    table.uuid('institution_id').references('id').inTable('institutions').onDelete('CASCADE');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Constraints
    table.unique(['code', 'institution_id']);
    
    // Índices
    table.index(['institution_id', 'is_active']);
  });
  
  // 8. Classes
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
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Constraints
    table.unique(['code', 'school_id', 'year']);
    
    // Índices
    table.index(['school_id', 'year', 'is_active']);
    table.index(['education_cycle_id', 'is_active']);
  });
  
  // 9. User Classes (relacionamento usuário-turma)
  await knex.schema.createTable('user_classes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('class_id').references('id').inTable('classes').onDelete('CASCADE');
    table.enum('role', ['student', 'teacher', 'assistant']).defaultTo('student');
    table.date('enrollment_date').defaultTo(knex.fn.now());
    table.enum('status', ['active', 'inactive', 'completed']).defaultTo('active');
    table.timestamps(true, true);
    
    // Constraints
    table.unique(['user_id', 'class_id']);
    
    // Índices
    table.index(['user_id', 'status']);
    table.index(['class_id', 'role']);
  });
  
  // === CONTEÚDO E ARQUIVOS ===
  
  // 10. Files
  await knex.schema.createTable('files', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('original_name', 255).notNullable();
    table.string('type', 50).notNullable();
    table.bigInteger('size').notNullable();
    table.string('size_formatted', 20).notNullable();
    table.string('bucket', 100);
    table.string('s3_key', 500);
    table.text('s3_url');
    table.text('local_path');
    table.text('description');
    table.enum('category', ['literario', 'professor', 'aluno', 'sistema']).notNullable().defaultTo('sistema');
    table.json('metadata').defaultTo('{}');
    table.string('checksum', 64);
    table.uuid('uploaded_by').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('institution_id').references('id').inTable('institutions').onDelete('SET NULL');
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_public').defaultTo(false);
    table.specificType('tags', 'text[]').defaultTo('{}');
    table.integer('download_count').defaultTo(0);
    table.timestamp('last_accessed');
    table.integer('file_id_legacy').nullable().comment('Original MySQL file ID');
    table.timestamps(true, true);
    
    // Índices
    table.index('type');
    table.index('category');
    table.index('uploaded_by');
    table.index('file_id_legacy');
    table.index(['institution_id', 'is_active']);
    table.index(['is_public', 'is_active']);
  });
  
  // 11. Collections
  await knex.schema.createTable('collections', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.string('slug').unique();
    table.text('description');
    table.string('thumbnail_url');
    table.string('banner_url');
    table.enum('type', ['course', 'series', 'book', 'magazine']).notNullable().defaultTo('course');
    table.enum('category', ['literario', 'educacional', 'entretenimento']).notNullable().defaultTo('educacional');
    table.json('metadata').defaultTo('{}');
    table.uuid('institution_id').references('id').inTable('institutions').onDelete('CASCADE');
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_featured').defaultTo(false);
    table.integer('view_count').defaultTo(0);
    table.decimal('rating', 3, 2).defaultTo(0);
    table.integer('rating_count').defaultTo(0);
    table.specificType('tags', 'text[]').defaultTo('{}');
    table.integer('collection_id_legacy').nullable().comment('Original MySQL collection ID');
    table.timestamps(true, true);
    
    // Índices
    table.index('slug');
    table.index('type');
    table.index('category');
    table.index('collection_id_legacy');
    table.index(['institution_id', 'is_active']);
    table.index(['is_featured', 'is_active']);
  });
  
  // 12. Books
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
    table.uuid('collection_id').references('id').inTable('collections').onDelete('SET NULL');
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_available').defaultTo(true);
    table.integer('view_count').defaultTo(0);
    table.decimal('rating', 3, 2).defaultTo(0);
    table.integer('rating_count').defaultTo(0);
    table.specificType('tags', 'text[]').defaultTo('{}');
    table.integer('book_id_legacy').nullable().comment('Original MySQL book ID');
    table.timestamps(true, true);
    
    // Índices
    table.index('isbn');
    table.index('author');
    table.index('category');
    table.index('book_id_legacy');
    table.index(['institution_id', 'is_active']);
    table.index(['is_available', 'is_active']);
  });
  
  // === CURSOS E MÓDULOS ===
  
  // 13. Courses
  await knex.schema.createTable('courses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.string('code').notNullable();
    table.string('slug').unique();
    table.text('description');
    table.text('objectives');
    table.text('requirements');
    table.integer('duration_hours');
    table.enum('difficulty_level', ['beginner', 'intermediate', 'advanced']).defaultTo('beginner');
    table.string('category');
    table.string('thumbnail_url');
    table.string('banner_url');
    table.decimal('price', 10, 2).defaultTo(0);
    table.uuid('teacher_id').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('institution_id').references('id').inTable('institutions').onDelete('CASCADE');
    table.uuid('collection_id').references('id').inTable('collections').onDelete('SET NULL');
    table.enum('status', ['draft', 'published', 'archived']).defaultTo('draft');
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_featured').defaultTo(false);
    table.integer('enrollment_count').defaultTo(0);
    table.integer('view_count').defaultTo(0);
    table.decimal('rating', 3, 2).defaultTo(0);
    table.integer('rating_count').defaultTo(0);
    table.specificType('tags', 'text[]').defaultTo('{}');
    table.integer('course_id_legacy').nullable().comment('Original MySQL course ID');
    table.timestamps(true, true);
    
    // Constraints
    table.unique(['code', 'institution_id']);
    
    // Índices
    table.index('slug');
    table.index('category');
    table.index('course_id_legacy');
    table.index(['institution_id', 'status']);
    table.index(['teacher_id', 'is_active']);
    table.index(['is_featured', 'is_active']);
  });
  
  // 14. Modules
  await knex.schema.createTable('modules', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('description');
    table.integer('order_index').notNullable();
    table.integer('duration_minutes');
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_locked').defaultTo(false);
    table.integer('module_id_legacy').nullable().comment('Original MySQL module ID');
    table.timestamps(true, true);
    
    // Índices
    table.index(['course_id', 'order_index']);
    table.index('module_id_legacy');
  });
  
  // 15. Content
  await knex.schema.createTable('content', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('description');
    table.enum('type', ['video', 'document', 'quiz', 'assignment', 'link', 'text']).notNullable();
    table.text('content_data');
    table.string('file_url');
    table.string('file_type');
    table.integer('file_size');
    table.integer('duration_seconds');
    table.integer('order_index').notNullable();
    table.uuid('module_id').references('id').inTable('modules').onDelete('CASCADE');
    table.uuid('file_id').references('id').inTable('files').onDelete('SET NULL');
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_free').defaultTo(false);
    table.integer('view_count').defaultTo(0);
    table.integer('content_id_legacy').nullable().comment('Original MySQL content ID');
    table.timestamps(true, true);
    
    // Índices
    table.index(['module_id', 'order_index']);
    table.index('type');
    table.index('content_id_legacy');
  });
  
  // === AVALIAÇÕES ===
  
  // 16. Quizzes
  await knex.schema.createTable('quizzes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('description');
    table.text('instructions');
    table.integer('time_limit_minutes');
    table.integer('max_attempts').defaultTo(1);
    table.decimal('passing_score', 5, 2).defaultTo(70.00);
    table.boolean('shuffle_questions').defaultTo(false);
    table.boolean('show_results').defaultTo(true);
    table.boolean('show_correct_answers').defaultTo(true);
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.uuid('module_id').references('id').inTable('modules').onDelete('CASCADE');
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.enum('status', ['draft', 'published', 'archived']).defaultTo('draft');
    table.boolean('is_active').defaultTo(true);
    table.integer('quiz_id_legacy').nullable().comment('Original MySQL quiz ID');
    table.timestamps(true, true);
    
    // Índices
    table.index(['course_id', 'status']);
    table.index(['module_id', 'is_active']);
    table.index('quiz_id_legacy');
  });
  
  // 17. Questions
  await knex.schema.createTable('questions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('question_text').notNullable();
    table.enum('type', ['multiple_choice', 'single_choice', 'true_false', 'short_answer', 'essay']).notNullable();
    table.json('options');
    table.json('correct_answers');
    table.decimal('points', 5, 2).defaultTo(1.00);
    table.text('explanation');
    table.integer('order_index').notNullable();
    table.uuid('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE');
    table.boolean('is_active').defaultTo(true);
    table.integer('question_id_legacy').nullable().comment('Original MySQL question ID');
    table.timestamps(true, true);
    
    // Índices
    table.index(['quiz_id', 'order_index']);
    table.index('type');
    table.index('question_id_legacy');
  });
  
  // 18. Answers
  await knex.schema.createTable('answers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('question_id').references('id').inTable('questions').onDelete('CASCADE');
    table.text('answer_text').notNullable();
    table.boolean('is_correct').defaultTo(false);
    table.integer('order_index').notNullable();
    table.decimal('points', 5, 2).defaultTo(0);
    table.text('explanation');
    table.json('metadata').defaultTo('{}');
    table.boolean('is_active').defaultTo(true);
    table.integer('answer_id_legacy').nullable().comment('Original MySQL answer ID');
    table.timestamps(true, true);
    
    // Índices
    table.index(['question_id', 'order_index']);
    table.index('is_correct');
    table.index('answer_id_legacy');
  });
  
  // 19. Quiz Submissions
  await knex.schema.createTable('quiz_submissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.json('answers_data');
    table.decimal('score', 5, 2).defaultTo(0);
    table.decimal('max_score', 5, 2).defaultTo(0);
    table.decimal('percentage', 5, 2).defaultTo(0);
    table.boolean('passed').defaultTo(false);
    table.timestamp('started_at');
    table.timestamp('completed_at');
    table.integer('time_spent_seconds');
    table.integer('attempt_number').defaultTo(1);
    table.enum('status', ['in_progress', 'completed', 'abandoned']).defaultTo('in_progress');
    table.json('metadata').defaultTo('{}');
    table.timestamps(true, true);
    
    // Índices
    table.index(['quiz_id', 'user_id']);
    table.index(['user_id', 'status']);
    table.index(['quiz_id', 'passed']);
  });
  
  // === PROGRESSO E TRACKING ===
  
  // 20. Student Progress
  await knex.schema.createTable('student_progress', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.uuid('module_id').references('id').inTable('modules').onDelete('CASCADE');
    table.uuid('content_id').references('id').inTable('content').onDelete('CASCADE');
    table.decimal('progress_percentage', 5, 2).defaultTo(0);
    table.boolean('is_completed').defaultTo(false);
    table.timestamp('started_at');
    table.timestamp('completed_at');
    table.integer('time_spent_seconds').defaultTo(0);
    table.integer('view_count').defaultTo(0);
    table.timestamp('last_accessed');
    table.json('metadata').defaultTo('{}');
    table.timestamps(true, true);
    
    // Constraints
    table.unique(['user_id', 'content_id']);
    
    // Índices
    table.index(['user_id', 'course_id']);
    table.index(['course_id', 'is_completed']);
    table.index(['user_id', 'is_completed']);
  });
  
  // 21. Activity Sessions
  await knex.schema.createTable('activity_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('sessionId').unique().notNullable();
    table.uuid('userId').references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('startTime').defaultTo(knex.fn.now());
    table.timestamp('endTime');
    table.integer('durationSeconds').defaultTo(0);
    table.integer('pageViews').defaultTo(0);
    table.integer('actionsCount').defaultTo(0);
    table.string('ipAddress');
    table.text('userAgent');
    table.json('deviceInfo').defaultTo('{}');
    table.boolean('isActive').defaultTo(true);
    table.timestamp('lastActivity').defaultTo(knex.fn.now());
    table.json('metadata').defaultTo('{}');
    table.timestamps(true, true);
    
    // Índices
    table.index('sessionId');
    table.index(['userId', 'isActive']);
    table.index('lastActivity');
  });
  
  // 22. Activity Logs
  await knex.schema.createTable('activity_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('session_id');
    table.string('activity_type').notNullable();
    table.string('entity_type');
    table.uuid('entity_id');
    table.string('action').notNullable();
    table.json('details').defaultTo('{}');
    table.string('ip_address');
    table.text('user_agent');
    table.string('browser');
    table.string('operating_system');
    table.string('device_info');
    table.string('location');
    table.timestamp('timestamp').defaultTo(knex.fn.now());
    table.timestamps(true, true);
    
    // Índices
    table.index(['user_id', 'timestamp']);
    table.index(['activity_type', 'timestamp']);
    table.index(['entity_type', 'entity_id']);
    table.index('session_id');
  });
  
  // === COMUNICAÇÃO ===
  
  // 23. Forum Threads
  await knex.schema.createTable('forum_threads', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('content').notNullable();
    table.uuid('author_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.uuid('class_id').references('id').inTable('classes').onDelete('CASCADE');
    table.boolean('is_pinned').defaultTo(false);
    table.boolean('is_locked').defaultTo(false);
    table.integer('views_count').defaultTo(0);
    table.integer('replies_count').defaultTo(0);
    table.enum('status', ['active', 'archived', 'deleted']).defaultTo('active');
    table.timestamps(true, true);
    
    // Índices
    table.index(['course_id', 'status']);
    table.index(['author_id', 'status']);
    table.index(['is_pinned', 'status']);
  });
  
  // 24. Forum Replies
  await knex.schema.createTable('forum_replies', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('content').notNullable();
    table.uuid('author_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('thread_id').references('id').inTable('forum_threads').onDelete('CASCADE');
    table.uuid('parent_reply_id').references('id').inTable('forum_replies').onDelete('CASCADE');
    table.boolean('is_answer').defaultTo(false);
    table.integer('votes_count').defaultTo(0);
    table.enum('status', ['active', 'deleted']).defaultTo('active');
    table.timestamps(true, true);
    
    // Índices
    table.index(['thread_id', 'status']);
    table.index(['author_id', 'status']);
    table.index(['parent_reply_id']);
  });
  
  // 25. Notifications
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.enum('type', ['info', 'success', 'warning', 'error', 'announcement']).defaultTo('info');
    table.string('action_url');
    table.boolean('is_read').defaultTo(false);
    table.boolean('is_important').defaultTo(false);
    table.timestamp('read_at');
    table.timestamp('expires_at');
    table.json('metadata').defaultTo('{}');
    table.timestamps(true, true);
    
    // Índices
    table.index(['user_id', 'is_read']);
    table.index(['type', 'is_important']);
    table.index('expires_at');
  });
  
  // === CONFIGURAÇÕES ===
  
  // 26. System Settings
  await knex.schema.createTable('system_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('key').unique().notNullable();
    table.text('value');
    table.text('description');
    table.enum('type', ['string', 'number', 'boolean', 'json', 'text']).defaultTo('string');
    table.string('category').defaultTo('general');
    table.boolean('is_public').defaultTo(false);
    table.boolean('is_system').defaultTo(false);
    table.uuid('updated_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);
    
    // Índices
    table.index('key');
    table.index(['category', 'is_public']);
  });
  
  // 27. Email Templates
  await knex.schema.createTable('email_templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').unique().notNullable();
    table.string('subject').notNullable();
    table.text('body_html').notNullable();
    table.text('body_text');
    table.string('language').defaultTo('pt-BR');
    table.json('variables').defaultTo('{}');
    table.boolean('is_active').defaultTo(true);
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);
    
    // Índices
    table.index('name');
    table.index(['language', 'is_active']);
  });
  
  console.log('✅ Schema PostgreSQL criado com sucesso!');
  
  // 🌱 PASSO 3: SEEDING BÁSICO
  console.log('🌱 Inserindo dados básicos...');
  
  // Inserir roles padrão
  const roles = [
    {
      id: '35f57500-9a89-4318-bc9f-9acad28c2fb6',
      name: 'SYSTEM_ADMIN',
      code: 'SYSTEM_ADMIN',
      description: 'Administrador do sistema',
      is_system: true,
      permissions: JSON.stringify(['*'])
    },
    {
      id: '45f57500-9a89-4318-bc9f-9acad28c2fb7',
      name: 'INSTITUTION_MANAGER',
      code: 'INSTITUTION_MANAGER',
      description: 'Gerenciador de instituição',
      is_system: true,
      permissions: JSON.stringify(['institution.*', 'user.*', 'course.*'])
    },
    {
      id: '55f57500-9a89-4318-bc9f-9acad28c2fb8',
      name: 'TEACHER',
      code: 'TEACHER',
      description: 'Professor',
      is_system: true,
      permissions: JSON.stringify(['course.read', 'course.create', 'student.read'])
    },
    {
      id: '65f57500-9a89-4318-bc9f-9acad28c2fb9',
      name: 'STUDENT',
      code: 'STUDENT',
      description: 'Estudante',
      is_system: true,
      permissions: JSON.stringify(['course.read', 'progress.read'])
    }
  ];
  
  await knex('roles').insert(roles);
  
  // Inserir instituição padrão
  const defaultInstitution = {
    id: '75f57500-9a89-4318-bc9f-9acad28c2fba',
    name: 'Instituição Migrada do MySQL',
    code: 'MYSQL_MIGRATED',
    type: 'SCHOOL',
    description: 'Instituição criada automaticamente durante migração MySQL → PostgreSQL',
    is_active: true
  };
  
  await knex('institutions').insert([defaultInstitution]);
  
  // Inserir escola padrão
  const defaultSchool = {
    id: '85f57500-9a89-4318-bc9f-9acad28c2fbb',
    name: 'Escola Migrada do MySQL',
    code: 'MYSQL_MIGRATED_SCHOOL',
    description: 'Escola criada automaticamente durante migração MySQL → PostgreSQL',
    institution_id: '75f57500-9a89-4318-bc9f-9acad28c2fba',
    is_active: true
  };
  
  await knex('schools').insert([defaultSchool]);
  
  // Inserir configurações do sistema
  const systemSettings = [
    {
      key: 'site_name',
      value: 'Portal Sabercon',
      description: 'Nome do site',
      type: 'string',
      category: 'general',
      is_public: true
    },
    {
      key: 'site_description',
      value: 'Plataforma educacional integrada',
      description: 'Descrição do site',
      type: 'text',
      category: 'general',
      is_public: true
    },
    {
      key: 'default_role_id',
      value: '55f57500-9a89-4318-bc9f-9acad28c2fb8',
      description: 'ID do role padrão para novos usuários',
      type: 'string',
      category: 'user',
      is_system: true
    },
    {
      key: 'default_institution_id',
      value: '75f57500-9a89-4318-bc9f-9acad28c2fba',
      description: 'ID da instituição padrão',
      type: 'string',
      category: 'institution',
      is_system: true
    },
    {
      key: 'default_school_id',
      value: '85f57500-9a89-4318-bc9f-9acad28c2fbb',
      description: 'ID da escola padrão',
      type: 'string',
      category: 'school',
      is_system: true
    }
  ];
  
  await knex('system_settings').insert(systemSettings);
  
  console.log('✅ Dados básicos inseridos com sucesso!');
  console.log('🎉 Migração MySQL → PostgreSQL concluída com sucesso!');
  
  console.log(`
📊 RESUMO DA MIGRAÇÃO:
  
✅ Tabelas criadas: 27
✅ Roles inseridos: 4
✅ Instituição padrão: 1
✅ Escola padrão: 1
✅ Configurações do sistema: 5

🔗 IDs Importantes:
  • Role SYSTEM_ADMIN: 35f57500-9a89-4318-bc9f-9acad28c2fb6
  • Role TEACHER: 55f57500-9a89-4318-bc9f-9acad28c2fb8
  • Role STUDENT: 65f57500-9a89-4318-bc9f-9acad28c2fb9
  • Instituição Padrão: 75f57500-9a89-4318-bc9f-9acad28c2fba
  • Escola Padrão: 85f57500-9a89-4318-bc9f-9acad28c2fbb

📝 Próximos passos:
  1. Execute a migração de dados MySQL usando a interface web
  2. Ajuste as configurações conforme necessário
  3. Teste o sistema com dados migrados
  `);
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Executando rollback da migração...');
  
  const tables = [
    'email_templates', 'system_settings', 'notifications', 'forum_replies', 'forum_threads',
    'activity_logs', 'activity_sessions', 'student_progress', 'quiz_submissions', 'answers',
    'questions', 'quizzes', 'content', 'modules', 'courses', 'books', 'collections', 'files',
    'user_classes', 'classes', 'education_cycles', 'schools', 'users', 'institutions',
    'role_permissions', 'permissions', 'roles'
  ];
  
  for (const table of tables) {
    await knex.schema.dropTableIfExists(table);
  }
  
  console.log('✅ Rollback concluído!');
}
