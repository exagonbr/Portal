'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  // Tabela de autores
  await knex.schema.createTable('authors', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable();
    table.text('biography').nullable();
    table.string('photo_url', 500).nullable();
    table.string('nationality', 100).nullable();
    table.date('birth_date').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de editoras
  await knex.schema.createTable('publishers', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable();
    table.string('website', 500).nullable();
    table.string('contact_email', 255).nullable();
    table.string('contact_phone', 50).nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de gêneros
  await knex.schema.createTable('genres', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 100).notNullable();
    table.string('description', 500).nullable();
    table.string('slug', 100).notNullable().unique();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de idiomas
  await knex.schema.createTable('languages', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 100).notNullable();
    table.string('code', 10).notNullable().unique();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de tags
  await knex.schema.createTable('tags', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 100).notNullable();
    table.string('slug', 100).notNullable().unique();
    table.string('category', 50).nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de público-alvo
  await knex.schema.createTable('target_audiences', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 100).notNullable();
    table.string('description', 500).nullable();
    table.integer('min_age').nullable();
    table.integer('max_age').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de temas
  await knex.schema.createTable('themes', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 100).notNullable();
    table.string('description', 500).nullable();
    table.string('color_primary', 7).nullable();
    table.string('color_secondary', 7).nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de livros
  await knex.schema.createTable('books', function(table) {
    table.bigIncrements('id').primary();
    table.string('title', 500).notNullable();
    table.string('subtitle', 500).nullable();
    table.text('description').nullable();
    table.string('isbn', 20).nullable();
    table.integer('pages').nullable();
    table.date('publication_date').nullable();
    table.string('cover_url', 500).nullable();
    table.string('pdf_url', 500).nullable();
    table.decimal('price', 10, 2).nullable();
    table.bigInteger('author_id').unsigned().nullable().references('id').inTable('authors');
    table.bigInteger('publisher_id').unsigned().nullable().references('id').inTable('publishers');
    table.bigInteger('language_id').unsigned().nullable().references('id').inTable('languages');
    table.bigInteger('genre_id').unsigned().nullable().references('id').inTable('genres');
    table.bigInteger('target_audience_id').unsigned().nullable().references('id').inTable('target_audiences');
    table.boolean('is_featured').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.integer('view_count').defaultTo(0);
    table.decimal('rating', 3, 2).nullable();
    table.timestamps(true, true);
  });

  // Tabela de vídeos
  await knex.schema.createTable('videos', function(table) {
    table.bigIncrements('id').primary();
    table.string('title', 500).notNullable();
    table.text('description').nullable();
    table.string('url', 500).notNullable();
    table.string('thumbnail_url', 500).nullable();
    table.integer('duration_seconds').nullable();
    table.string('video_type', 50).nullable(); // youtube, vimeo, local, etc
    table.bigInteger('genre_id').unsigned().nullable().references('id').inTable('genres');
    table.bigInteger('target_audience_id').unsigned().nullable().references('id').inTable('target_audiences');
    table.bigInteger('language_id').unsigned().nullable().references('id').inTable('languages');
    table.boolean('is_featured').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.integer('view_count').defaultTo(0);
    table.decimal('rating', 3, 2).nullable();
    table.timestamps(true, true);
  });

  // Tabela de programas de TV
  await knex.schema.createTable('tv_shows', function(table) {
    table.bigIncrements('id').primary();
    table.string('title', 500).notNullable();
    table.text('description').nullable();
    table.string('poster_url', 500).nullable();
    table.integer('seasons').nullable();
    table.integer('episodes').nullable();
    table.date('first_air_date').nullable();
    table.date('last_air_date').nullable();
    table.string('status', 50).nullable(); // ongoing, ended, cancelled
    table.bigInteger('genre_id').unsigned().nullable().references('id').inTable('genres');
    table.bigInteger('target_audience_id').unsigned().nullable().references('id').inTable('target_audiences');
    table.bigInteger('language_id').unsigned().nullable().references('id').inTable('languages');
    table.boolean('is_featured').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.integer('view_count').defaultTo(0);
    table.decimal('rating', 3, 2).nullable();
    table.timestamps(true, true);
  });

  // Tabela de coleções
  await knex.schema.createTable('collections', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable();
    table.text('description').nullable();
    table.string('cover_url', 500).nullable();
    table.string('collection_type', 50).notNullable(); // books, videos, mixed
    table.bigInteger('created_by').unsigned().nullable().references('id').inTable('user');
    table.boolean('is_public').defaultTo(true);
    table.boolean('is_featured').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de itens da coleção
  await knex.schema.createTable('collection_items', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('collection_id').unsigned().notNullable().references('id').inTable('collections').onDelete('CASCADE');
    table.string('item_type', 50).notNullable(); // book, video, tv_show
    table.bigInteger('item_id').notNullable();
    table.integer('order_index').defaultTo(0);
    table.timestamps(true, true);
    table.unique(['collection_id', 'item_type', 'item_id']);
  });

  // Tabela de arquivos de mídia
  await knex.schema.createTable('media_files', function(table) {
    table.bigIncrements('id').primary();
    table.string('filename', 500).notNullable();
    table.string('original_name', 500).notNullable();
    table.string('mime_type', 100).notNullable();
    table.bigInteger('size_bytes').notNullable();
    table.string('storage_path', 1000).notNullable();
    table.string('url', 1000).nullable();
    table.string('entity_type', 50).nullable(); // book, video, user, etc
    table.bigInteger('entity_id').nullable();
    table.bigInteger('uploaded_by').unsigned().nullable().references('id').inTable('user');
    table.timestamps(true, true);
  });

  // Tabela de entradas de mídia (histórico de visualização)
  await knex.schema.createTable('media_entries', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('user');
    table.string('media_type', 50).notNullable(); // book, video, tv_show
    table.bigInteger('media_id').notNullable();
    table.datetime('last_accessed').notNullable();
    table.integer('progress_percentage').defaultTo(0);
    table.integer('time_spent_seconds').defaultTo(0);
    table.boolean('is_favorite').defaultTo(false);
    table.boolean('is_completed').defaultTo(false);
    table.decimal('user_rating', 3, 2).nullable();
    table.text('notes').nullable();
    table.timestamps(true, true);
    table.unique(['user_id', 'media_type', 'media_id']);
  });

  // Índices para melhor performance
  await knex.schema.table('books', function(table) {
    table.index(['is_active', 'is_featured']);
    table.index('author_id');
    table.index('genre_id');
  });

  await knex.schema.table('videos', function(table) {
    table.index(['is_active', 'is_featured']);
    table.index('genre_id');
  });

  await knex.schema.table('tv_shows', function(table) {
    table.index(['is_active', 'is_featured']);
    table.index('genre_id');
  });

  await knex.schema.table('media_entries', function(table) {
    table.index('user_id');
    table.index(['media_type', 'media_id']);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('media_entries');
  await knex.schema.dropTableIfExists('media_files');
  await knex.schema.dropTableIfExists('collection_items');
  await knex.schema.dropTableIfExists('collections');
  await knex.schema.dropTableIfExists('tv_shows');
  await knex.schema.dropTableIfExists('videos');
  await knex.schema.dropTableIfExists('books');
  await knex.schema.dropTableIfExists('themes');
  await knex.schema.dropTableIfExists('target_audiences');
  await knex.schema.dropTableIfExists('tags');
  await knex.schema.dropTableIfExists('languages');
  await knex.schema.dropTableIfExists('genres');
  await knex.schema.dropTableIfExists('publishers');
  await knex.schema.dropTableIfExists('authors');
};