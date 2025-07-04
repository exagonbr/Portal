'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  // Tabela de escolas
  await knex.schema.createTable('schools', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable();
    table.string('code', 50).notNullable().unique();
    table.string('type', 50).nullable(); // public, private, charter
    table.string('level', 100).nullable(); // elementary, middle, high, k12
    table.string('address', 500).nullable();
    table.string('city', 100).nullable();
    table.string('state', 50).nullable();
    table.string('postal_code', 20).nullable();
    table.string('country', 50).defaultTo('Brasil');
    table.string('phone', 50).nullable();
    table.string('email', 255).nullable();
    table.string('website', 500).nullable();
    table.bigInteger('institution_id').unsigned().notNullable().references('id').inTable('institution');
    table.integer('student_capacity').nullable();
    table.integer('current_students').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de gerentes de escola
  await knex.schema.createTable('school_managers', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('school_id').unsigned().notNullable().references('id').inTable('schools');
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('user');
    table.string('role', 50).notNullable(); // principal, vice_principal, coordinator
    table.date('start_date').notNullable();
    table.date('end_date').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    table.unique(['school_id', 'user_id', 'role']);
  });

  // Tabela de configurações
  await knex.schema.createTable('settings', function(table) {
    table.bigIncrements('id').primary();
    table.string('key', 255).notNullable().unique();
    table.text('value').nullable();
    table.string('type', 50).notNullable(); // string, number, boolean, json
    table.string('category', 100).nullable();
    table.string('description', 500).nullable();
    table.boolean('is_public').defaultTo(false);
    table.boolean('is_editable').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de arquivos
  await knex.schema.createTable('files', function(table) {
    table.bigIncrements('id').primary();
    table.string('filename', 500).notNullable();
    table.string('original_name', 500).notNullable();
    table.string('mime_type', 100).notNullable();
    table.bigInteger('size_bytes').notNullable();
    table.string('storage_path', 1000).notNullable();
    table.string('url', 1000).nullable();
    table.string('entity_type', 50).nullable();
    table.bigInteger('entity_id').nullable();
    table.bigInteger('uploaded_by').unsigned().nullable().references('id').inTable('user');
    table.string('category', 50).nullable(); // document, image, video, audio, other
    table.boolean('is_public').defaultTo(false);
    table.timestamps(true, true);
  });

  // Tabela de períodos educacionais
  await knex.schema.createTable('education_periods', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 100).notNullable();
    table.integer('year').notNullable();
    table.integer('semester').nullable();
    table.integer('quarter').nullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.bigInteger('institution_id').unsigned().notNullable().references('id').inTable('institution');
    table.boolean('is_current').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de estágios educacionais
  await knex.schema.createTable('educational_stages', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 100).notNullable();
    table.string('code', 20).notNullable();
    table.string('description', 500).nullable();
    table.integer('order_index').notNullable();
    table.integer('min_age').nullable();
    table.integer('max_age').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de cookies assinados (para autenticação)
  await knex.schema.createTable('cookie_signed', function(table) {
    table.bigIncrements('id').primary();
    table.string('cookie_value', 500).notNullable();
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('user');
    table.datetime('created_at').notNullable();
    table.datetime('expires_at').notNullable();
    table.string('ip_address', 45).nullable();
    table.string('user_agent', 500).nullable();
    table.boolean('is_valid').defaultTo(true);
    table.index('cookie_value');
    table.index(['user_id', 'is_valid']);
  });

  // Tabela pública (para conteúdo público)
  await knex.schema.createTable('public_content', function(table) {
    table.bigIncrements('id').primary();
    table.string('title', 500).notNullable();
    table.text('content').nullable();
    table.string('content_type', 50).notNullable(); // article, page, announcement
    table.string('slug', 255).notNullable().unique();
    table.string('featured_image', 500).nullable();
    table.bigInteger('author_id').unsigned().nullable().references('id').inTable('user');
    table.boolean('is_published').defaultTo(false);
    table.datetime('published_at').nullable();
    table.integer('view_count').defaultTo(0);
    table.json('metadata').nullable();
    table.timestamps(true, true);
  });

  // Tabela de relacionamento usuário-papel (user_role)
  await knex.schema.createTable('user_roles', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('user');
    table.bigInteger('role_id').unsigned().notNullable().references('id').inTable('roles');
    table.bigInteger('institution_id').unsigned().nullable().references('id').inTable('institution');
    table.bigInteger('unit_id').unsigned().nullable().references('id').inTable('unit');
    table.datetime('assigned_at').notNullable();
    table.datetime('expires_at').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    table.unique(['user_id', 'role_id', 'institution_id', 'unit_id']);
  });

  // Tabela de turmas de unidade (unit_class)
  await knex.schema.createTable('unit_classes', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('unit_id').unsigned().notNullable().references('id').inTable('unit');
    table.bigInteger('class_id').unsigned().notNullable().references('id').inTable('classes');
    table.string('period', 50).nullable(); // morning, afternoon, evening, full_time
    table.string('room', 50).nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    table.unique(['unit_id', 'class_id']);
  });

  // Tabela de módulos de vídeo
  await knex.schema.createTable('video_modules', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable();
    table.text('description').nullable();
    table.bigInteger('course_id').unsigned().nullable().references('id').inTable('courses');
    table.integer('order_index').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de coleções de vídeo
  await knex.schema.createTable('video_collections', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable();
    table.text('description').nullable();
    table.string('thumbnail_url', 500).nullable();
    table.bigInteger('created_by').unsigned().nullable().references('id').inTable('user');
    table.boolean('is_public').defaultTo(true);
    table.boolean('is_featured').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de vídeos em coleções
  await knex.schema.createTable('video_collection_items', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('collection_id').unsigned().notNullable().references('id').inTable('video_collections').onDelete('CASCADE');
    table.bigInteger('video_id').unsigned().notNullable().references('id').inTable('videos');
    table.integer('order_index').defaultTo(0);
    table.timestamps(true, true);
    table.unique(['collection_id', 'video_id']);
  });

  // Tabela de TV Shows completos (metadados adicionais)
  await knex.schema.createTable('tv_show_complete', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('tv_show_id').unsigned().notNullable().references('id').inTable('tv_shows');
    table.string('imdb_id', 20).nullable();
    table.string('tmdb_id', 20).nullable();
    table.json('cast').nullable();
    table.json('crew').nullable();
    table.json('networks').nullable();
    table.json('production_companies').nullable();
    table.text('synopsis').nullable();
    table.json('awards').nullable();
    table.timestamps(true, true);
  });

  // Índices adicionais
  await knex.schema.table('schools', function(table) {
    table.index('institution_id');
    table.index('is_active');
  });

  await knex.schema.table('files', function(table) {
    table.index(['entity_type', 'entity_id']);
    table.index('uploaded_by');
  });

  await knex.schema.table('education_periods', function(table) {
    table.index(['institution_id', 'is_current']);
  });

  await knex.schema.table('user_roles', function(table) {
    table.index('user_id');
    table.index('role_id');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('tv_show_complete');
  await knex.schema.dropTableIfExists('video_collection_items');
  await knex.schema.dropTableIfExists('video_collections');
  await knex.schema.dropTableIfExists('video_modules');
  await knex.schema.dropTableIfExists('unit_classes');
  await knex.schema.dropTableIfExists('user_roles');
  await knex.schema.dropTableIfExists('public_content');
  await knex.schema.dropTableIfExists('cookie_signed');
  await knex.schema.dropTableIfExists('educational_stages');
  await knex.schema.dropTableIfExists('education_periods');
  await knex.schema.dropTableIfExists('files');
  await knex.schema.dropTableIfExists('settings');
  await knex.schema.dropTableIfExists('school_managers');
  await knex.schema.dropTableIfExists('schools');
};