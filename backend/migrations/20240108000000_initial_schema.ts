import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create institutions table
  await knex.schema.createTable('institutions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('code').notNullable().unique();
    table.enum('type', ['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TECH_CENTER']).notNullable();
    table.text('characteristics');
    table.string('address');
    table.string('phone');
    table.string('email');
    table.timestamps(true, true);
  });

  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('name').notNullable();
    table.enum('role', ['admin', 'teacher', 'student']).notNullable();
    table.uuid('institution_id').references('id').inTable('institutions').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // Create courses table
  await knex.schema.createTable('courses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('description');
    table.uuid('institution_id').references('id').inTable('institutions').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // Create modules table
  await knex.schema.createTable('modules', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('description');
    table.integer('order').notNullable();
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // Create lessons table
  await knex.schema.createTable('lessons', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('content').notNullable();
    table.integer('order').notNullable();
    table.uuid('module_id').references('id').inTable('modules').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // Create books table
  await knex.schema.createTable('books', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.string('author').notNullable();
    table.string('isbn').notNullable();
    table.string('file_path').notNullable();
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // Create videos table
  await knex.schema.createTable('videos', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('description');
    table.string('file_path').notNullable();
    table.string('thumbnail_path');
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // Create annotations table
  await knex.schema.createTable('annotations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('content').notNullable();
    table.integer('page_number').notNullable();
    table.uuid('book_id').references('id').inTable('books').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // Create highlights table
  await knex.schema.createTable('highlights', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('content').notNullable();
    table.integer('page_number').notNullable();
    table.string('color').notNullable();
    table.uuid('book_id').references('id').inTable('books').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // Create user_progress table
  await knex.schema.createTable('user_progress', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('lesson_id').references('id').inTable('lessons').onDelete('CASCADE');
    table.decimal('progress_percentage', 5, 2).notNullable().defaultTo(0);
    table.boolean('completed').notNullable().defaultTo(false);
    table.timestamps(true, true);
    table.unique(['user_id', 'lesson_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_progress');
  await knex.schema.dropTableIfExists('highlights');
  await knex.schema.dropTableIfExists('annotations');
  await knex.schema.dropTableIfExists('videos');
  await knex.schema.dropTableIfExists('books');
  await knex.schema.dropTableIfExists('lessons');
  await knex.schema.dropTableIfExists('modules');
  await knex.schema.dropTableIfExists('courses');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('institutions');
}
