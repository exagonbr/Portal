'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  // 1. Criar tabelas base
  await knex.schema.createTable('institution', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.string('accountable_contact', 255).notNullable();
    table.string('accountable_name', 255).notNullable();
    table.string('company_name', 255).notNullable();
    table.string('complement', 255).nullable();
    table.boolean('contract_disabled').notNullable();
    table.string('contract_invoice_num', 255).nullable();
    table.bigInteger('contract_num').nullable();
    table.datetime('contract_term_end').notNullable();
    table.datetime('contract_term_start').notNullable();
    table.datetime('date_created').nullable();
    table.boolean('deleted').notNullable();
    table.string('district', 255).notNullable();
    table.string('document', 255).notNullable();
    table.datetime('invoice_date').nullable();
    table.datetime('last_updated').nullable();
    table.string('name', 255).notNullable();
    table.string('postal_code', 255).notNullable();
    table.string('state', 255).notNullable();
    table.string('street', 255).notNullable();
    table.bigInteger('score').nullable();
    table.boolean('has_library_platform').notNullable();
    table.boolean('has_principal_platform').notNullable();
    table.boolean('has_student_platform').notNullable();
  });

  await knex.schema.createTable('roles', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable().unique();
    table.string('description', 255).nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('permissions', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable().unique();
    table.string('resource', 255).notNullable();
    table.string('action', 255).notNullable();
    table.string('description', 255).nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('role_permissions', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('role_id').unsigned().notNullable().references('id').inTable('roles');
    table.bigInteger('permission_id').unsigned().notNullable().references('id').inTable('permissions');
    table.unique(['role_id', 'permission_id']);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('teacher_subject', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).nullable();
  });

  await knex.schema.createTable('user', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.boolean('account_expired').nullable();
    table.boolean('account_locked').nullable();
    table.string('address', 255).nullable();
    table.integer('amount_of_media_entries').nullable();
    table.datetime('date_created').nullable();
    table.boolean('deleted').nullable();
    table.string('email', 255).notNullable();
    table.boolean('enabled').nullable();
    table.string('full_name', 255).notNullable();
    table.boolean('invitation_sent').nullable();
    table.boolean('is_admin').notNullable();
    table.string('language', 255).nullable();
    table.datetime('last_updated').nullable();
    table.string('password', 255).nullable();
    table.boolean('password_expired').nullable();
    table.boolean('pause_video_on_click').nullable();
    table.string('phone', 255).nullable();
    table.boolean('reset_password').notNullable().defaultTo(true);
    table.string('username', 255).nullable().unique('UK_sb8bbouer5wak8vyiiy4pf2bx');
    table.boolean('is_manager').notNullable();
    table.integer('type').nullable();
    table.string('certificate_path', 255).nullable();
    table.boolean('is_certified').defaultTo(false);
    table.boolean('is_student').notNullable();
    table.boolean('is_teacher').notNullable();
    table.bigInteger('institution_id').unsigned().nullable().references('id').inTable('institution');
    table.bigInteger('role_id').unsigned().nullable().references('id').inTable('roles');
    table.string('subject', 255).nullable();
    table.bigInteger('subject_data_id').unsigned().nullable().references('id').inTable('teacher_subject');
  });

  await knex.schema.createTable('security_policies', function(table) {
    table.increments('id').primary();
    table.integer('password_min_length').defaultTo(8).notNullable();
    table.boolean('password_require_uppercase').defaultTo(true).notNullable();
    table.boolean('password_require_lowercase').defaultTo(true).notNullable();
    table.boolean('password_require_numbers').defaultTo(true).notNullable();
    table.boolean('password_require_special_chars').defaultTo(true).notNullable();
    table.integer('password_expiry_days').defaultTo(90).notNullable();
    table.integer('password_prevent_reuse').defaultTo(5).notNullable();
    table.integer('account_max_login_attempts').defaultTo(5).notNullable();
    table.integer('account_lockout_duration_minutes').defaultTo(30).notNullable();
    table.integer('account_session_timeout_minutes').defaultTo(30).notNullable();
    table.boolean('account_require_mfa').defaultTo(false).notNullable();
    table.integer('account_inactivity_lockout_days').defaultTo(60).notNullable();
    table.integer('data_retention_months').defaultTo(36).notNullable();
    table.boolean('data_encrypt_sensitive_data').defaultTo(true).notNullable();
    table.boolean('data_anonymize_deleted_users').defaultTo(true).notNullable();
    table.boolean('data_enable_audit_logging').defaultTo(true).notNullable();
    table.string('created_by').nullable();
    table.string('updated_by').nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('unit', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.datetime('date_created').nullable();
    table.boolean('deleted').nullable();
    table.bigInteger('institution_id').unsigned().notNullable().references('id').inTable('institution');
    table.datetime('last_updated').nullable();
    table.string('name', 255).notNullable();
    table.string('institution_name', 255).nullable();
  });

  await knex.schema.createTable('education_cycles', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable();
    table.string('code', 10).notNullable();
    table.string('description', 255).nullable();
    table.integer('min_age').nullable();
    table.integer('max_age').nullable();
    table.integer('duration_years').notNullable();
    table.bigInteger('institution_id').unsigned().notNullable().references('id').inTable('institution');
    table.string('status', 20).defaultTo('active');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('classes', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable();
    table.string('code', 20).notNullable();
    table.string('description', 255).nullable();
    table.integer('year').notNullable();
    table.integer('semester').notNullable();
    table.integer('max_students').notNullable();
    table.integer('current_students').defaultTo(0);
    table.bigInteger('unit_id').unsigned().notNullable().references('id').inTable('unit');
    table.bigInteger('education_cycle_id').unsigned().notNullable().references('id').inTable('education_cycles');
    table.string('status', 20).defaultTo('active');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('user_classes', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('user');
    table.bigInteger('class_id').unsigned().notNullable().references('id').inTable('classes');
    table.datetime('enrollment_date').notNullable();
    table.string('status', 20).defaultTo('active');
    table.unique(['user_id', 'class_id']);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('forgot_password', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.string('email', 255).nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('user_classes');
  await knex.schema.dropTableIfExists('classes');
  await knex.schema.dropTableIfExists('education_cycles');
  await knex.schema.dropTableIfExists('unit');
  await knex.schema.dropTableIfExists('security_policies');
  await knex.schema.dropTableIfExists('user');
  await knex.schema.dropTableIfExists('teacher_subject');
  await knex.schema.dropTableIfExists('role_permissions');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('roles');
  await knex.schema.dropTableIfExists('institution');
  await knex.schema.dropTableIfExists('forgot_password');
};