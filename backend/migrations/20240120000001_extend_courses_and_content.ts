import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Extend courses table
  await knex.schema.alterTable('courses', (table) => {
    table.enum('level', ['BASIC', 'PROFESSIONAL', 'SUPERIOR']).notNullable();
    table.string('cycle').notNullable();
    table.string('stage');
    table.string('duration');
    table.jsonb('schedule');
  });

  // Create course_teachers junction table
  await knex.schema.createTable('course_teachers', (table) => {
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.primary(['course_id', 'user_id']);
    table.timestamps(true, true);
  });

  // Create course_students junction table
  await knex.schema.createTable('course_students', (table) => {
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.primary(['course_id', 'user_id']);
    table.decimal('progress', 5, 2).defaultTo(0);
    table.jsonb('grades');
    table.timestamps(true, true);
  });

  // Extend books table
  await knex.schema.alterTable('books', (table) => {
    table.string('publisher');
    table.text('synopsis');
    table.string('duration');
    table.string('format');
    table.integer('page_count');
    table.string('thumbnail');
  });

  // Extend videos table
  await knex.schema.alterTable('videos', (table) => {
    table.string('duration').notNullable();
    table.decimal('progress', 5, 2).defaultTo(0);
  });

  // Create content_collections table
  await knex.schema.createTable('content_collections', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('synopsis');
    table.string('cover_image');
    table.string('support_material');
    table.integer('total_duration');
    table.string('subject');
    table.specificType('tags', 'text[]');
    table.uuid('created_by').references('id').inTable('users');
    table.timestamps(true, true);
  });

  // Create collection_modules table
  await knex.schema.createTable('collection_modules', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('collection_id').references('id').inTable('content_collections').onDelete('CASCADE');
    table.string('name').notNullable();
    table.text('description');
    table.string('cover_image');
    table.specificType('video_ids', 'text[]');
    table.integer('order').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('collection_modules');
  await knex.schema.dropTableIfExists('content_collections');

  await knex.schema.alterTable('videos', (table) => {
    table.dropColumn('duration');
    table.dropColumn('progress');
  });

  await knex.schema.alterTable('books', (table) => {
    table.dropColumn('publisher');
    table.dropColumn('synopsis');
    table.dropColumn('duration');
    table.dropColumn('format');
    table.dropColumn('page_count');
    table.dropColumn('thumbnail');
  });

  await knex.schema.dropTableIfExists('course_students');
  await knex.schema.dropTableIfExists('course_teachers');

  await knex.schema.alterTable('courses', (table) => {
    table.dropColumn('level');
    table.dropColumn('cycle');
    table.dropColumn('stage');
    table.dropColumn('duration');
    table.dropColumn('schedule');
  });
}
