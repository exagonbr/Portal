'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  // Tabela de threads do fórum
  await knex.schema.createTable('forum_threads', function(table) {
    table.bigIncrements('id').primary();
    table.string('title', 500).notNullable();
    table.text('content').notNullable();
    table.bigInteger('author_id').unsigned().notNullable().references('id').inTable('user');
    table.bigInteger('course_id').unsigned().nullable().references('id').inTable('courses');
    table.bigInteger('class_id').unsigned().nullable().references('id').inTable('classes');
    table.string('category', 100).nullable();
    table.boolean('is_pinned').defaultTo(false);
    table.boolean('is_locked').defaultTo(false);
    table.boolean('is_announcement').defaultTo(false);
    table.integer('view_count').defaultTo(0);
    table.integer('reply_count').defaultTo(0);
    table.datetime('last_reply_at').nullable();
    table.bigInteger('last_reply_by').unsigned().nullable().references('id').inTable('user');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de respostas do fórum
  await knex.schema.createTable('forum_replies', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('thread_id').unsigned().notNullable().references('id').inTable('forum_threads').onDelete('CASCADE');
    table.bigInteger('author_id').unsigned().notNullable().references('id').inTable('user');
    table.text('content').notNullable();
    table.bigInteger('parent_reply_id').unsigned().nullable().references('id').inTable('forum_replies');
    table.boolean('is_solution').defaultTo(false);
    table.boolean('is_edited').defaultTo(false);
    table.datetime('edited_at').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de anúncios
  await knex.schema.createTable('announcements', function(table) {
    table.bigIncrements('id').primary();
    table.string('title', 500).notNullable();
    table.text('content').notNullable();
    table.bigInteger('author_id').unsigned().notNullable().references('id').inTable('user');
    table.string('target_type', 50).notNullable(); // all, institution, unit, class, course
    table.bigInteger('target_id').nullable();
    table.string('priority', 20).defaultTo('normal'); // low, normal, high, urgent
    table.datetime('publish_date').notNullable();
    table.datetime('expiry_date').nullable();
    table.boolean('requires_acknowledgment').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Tabela de confirmações de leitura de anúncios
  await knex.schema.createTable('announcement_acknowledgments', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('announcement_id').unsigned().notNullable().references('id').inTable('announcements').onDelete('CASCADE');
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('user');
    table.datetime('acknowledged_at').notNullable();
    table.unique(['announcement_id', 'user_id']);
  });

  // Tabela de mensagens de chat
  await knex.schema.createTable('chat_messages', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('sender_id').unsigned().notNullable().references('id').inTable('user');
    table.bigInteger('recipient_id').unsigned().nullable().references('id').inTable('user');
    table.bigInteger('group_id').nullable(); // Para futuro suporte a chat em grupo
    table.text('message').notNullable();
    table.string('message_type', 20).defaultTo('text'); // text, image, file, audio
    table.string('attachment_url', 500).nullable();
    table.boolean('is_read').defaultTo(false);
    table.datetime('read_at').nullable();
    table.boolean('is_edited').defaultTo(false);
    table.datetime('edited_at').nullable();
    table.boolean('is_deleted').defaultTo(false);
    table.datetime('deleted_at').nullable();
    table.timestamps(true, true);
  });

  // Tabela de notificações
  await knex.schema.createTable('notifications', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('user');
    table.string('type', 100).notNullable(); // announcement, forum_reply, grade_posted, assignment_due, etc
    table.string('title', 255).notNullable();
    table.text('message').notNullable();
    table.json('data').nullable(); // Dados adicionais em JSON
    table.string('action_url', 500).nullable();
    table.boolean('is_read').defaultTo(false);
    table.datetime('read_at').nullable();
    table.string('priority', 20).defaultTo('normal'); // low, normal, high
    table.datetime('expires_at').nullable();
    table.timestamps(true, true);
  });

  // Tabela de logs de notificações (para rastreamento de envios)
  await knex.schema.createTable('notification_logs', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('notification_id').unsigned().nullable().references('id').inTable('notifications');
    table.bigInteger('user_id').unsigned().nullable().references('id').inTable('user');
    table.string('channel', 50).notNullable(); // email, sms, push, in_app
    table.string('status', 50).notNullable(); // pending, sent, failed, bounced
    table.text('error_message').nullable();
    table.datetime('sent_at').nullable();
    table.json('metadata').nullable();
    table.timestamps(true, true);
  });

  // Tabela de preferências de notificação
  await knex.schema.createTable('notification_preferences', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('user');
    table.string('notification_type', 100).notNullable();
    table.boolean('email_enabled').defaultTo(true);
    table.boolean('sms_enabled').defaultTo(false);
    table.boolean('push_enabled').defaultTo(true);
    table.boolean('in_app_enabled').defaultTo(true);
    table.timestamps(true, true);
    table.unique(['user_id', 'notification_type']);
  });

  // Tabela de perfis de usuário (informações adicionais)
  await knex.schema.createTable('profiles', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('user').unique();
    table.string('avatar_url', 500).nullable();
    table.text('bio').nullable();
    table.date('birth_date').nullable();
    table.string('gender', 20).nullable();
    table.string('phone_secondary', 50).nullable();
    table.string('emergency_contact_name', 255).nullable();
    table.string('emergency_contact_phone', 50).nullable();
    table.string('emergency_contact_relationship', 100).nullable();
    table.json('social_links').nullable(); // {facebook: '', linkedin: '', etc}
    table.json('preferences').nullable(); // Preferências gerais do usuário
    table.string('timezone', 50).defaultTo('America/Sao_Paulo');
    table.string('locale', 10).defaultTo('pt-BR');
    table.timestamps(true, true);
  });

  // Tabela de sessões de usuário
  await knex.schema.createTable('user_sessions', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('user');
    table.string('session_token', 500).notNullable().unique();
    table.string('ip_address', 45).nullable();
    table.string('user_agent', 500).nullable();
    table.string('device_type', 50).nullable();
    table.string('browser', 50).nullable();
    table.string('os', 50).nullable();
    table.datetime('started_at').notNullable();
    table.datetime('last_activity_at').notNullable();
    table.datetime('expires_at').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Índices para melhor performance
  await knex.schema.table('forum_threads', function(table) {
    table.index(['is_active', 'is_pinned']);
    table.index('author_id');
    table.index('course_id');
    table.index('class_id');
  });

  await knex.schema.table('forum_replies', function(table) {
    table.index('thread_id');
    table.index('author_id');
  });

  await knex.schema.table('announcements', function(table) {
    table.index(['is_active', 'publish_date']);
    table.index(['target_type', 'target_id']);
  });

  await knex.schema.table('chat_messages', function(table) {
    table.index(['sender_id', 'recipient_id']);
    table.index(['is_read', 'recipient_id']);
  });

  await knex.schema.table('notifications', function(table) {
    table.index(['user_id', 'is_read']);
    table.index('type');
  });

  await knex.schema.table('user_sessions', function(table) {
    table.index(['user_id', 'is_active']);
    table.index('expires_at');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('user_sessions');
  await knex.schema.dropTableIfExists('profiles');
  await knex.schema.dropTableIfExists('notification_preferences');
  await knex.schema.dropTableIfExists('notification_logs');
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('chat_messages');
  await knex.schema.dropTableIfExists('announcement_acknowledgments');
  await knex.schema.dropTableIfExists('announcements');
  await knex.schema.dropTableIfExists('forum_replies');
  await knex.schema.dropTableIfExists('forum_threads');
};