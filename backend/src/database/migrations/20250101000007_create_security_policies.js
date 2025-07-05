'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
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
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('security_policies');
}; 