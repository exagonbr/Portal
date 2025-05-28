import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create chats table
  await knex.schema.createTable('chats', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.specificType('participants', 'text[]');
    table.text('last_message');
    table.timestamp('last_message_time');
    table.timestamps(true, true);
  });

  // Create chat_messages table
  await knex.schema.createTable('chat_messages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('chat_id').references('id').inTable('chats').onDelete('CASCADE');
    table.uuid('sender_id').references('id').inTable('users').onDelete('CASCADE');
    table.text('content').notNullable();
    table.specificType('read_by', 'text[]');
    table.timestamps(true, true);
  });

  // Create forum_threads table
  await knex.schema.createTable('forum_threads', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('content').notNullable();
    table.uuid('author_id').references('id').inTable('users').onDelete('CASCADE');
    table.specificType('tags', 'text[]');
    table.boolean('pinned').defaultTo(false);
    table.boolean('locked').defaultTo(false);
    table.integer('views').defaultTo(0);
    table.timestamps(true, true);
  });

  // Create forum_replies table
  await knex.schema.createTable('forum_replies', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('thread_id').references('id').inTable('forum_threads').onDelete('CASCADE');
    table.uuid('author_id').references('id').inTable('users').onDelete('CASCADE');
    table.text('content').notNullable();
    table.uuid('parent_reply_id').references('id').inTable('forum_replies').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // Extend annotations table with position data
  await knex.schema.alterTable('annotations', (table) => {
    table.jsonb('position');
  });

  // Extend highlights table with position and color data
  await knex.schema.alterTable('highlights', (table) => {
    table.jsonb('position');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('highlights', (table) => {
    table.dropColumn('position');
  });

  await knex.schema.alterTable('annotations', (table) => {
    table.dropColumn('position');
  });

  await knex.schema.dropTableIfExists('forum_replies');
  await knex.schema.dropTableIfExists('forum_threads');
  await knex.schema.dropTableIfExists('chat_messages');
  await knex.schema.dropTableIfExists('chats');
}
