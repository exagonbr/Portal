'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  await knex.schema.createTable('users', function(table) {
    // Chave primária
    table.bigIncrements('id').primary();

    // Campos básicos da estrutura MySQL original
    table.bigInteger('version').nullable();
    table.boolean('account_expired').nullable().defaultTo(false);
    table.boolean('account_locked').nullable().defaultTo(false);
    table.string('address', 255).nullable();
    table.integer('amount_of_media_entries').nullable();
    table.datetime('date_created').nullable();
    table.boolean('deleted').nullable().defaultTo(false);
    table.string('email', 255).notNullable();
    table.boolean('enabled').nullable().defaultTo(true);
    table.string('full_name', 255).notNullable();
    table.boolean('invitation_sent').nullable().defaultTo(false);
    table.boolean('is_admin').notNullable().defaultTo(false);
    table.string('language', 255).nullable();
    table.datetime('last_updated').nullable();
    table.string('password', 255).nullable();
    table.boolean('password_expired').nullable().defaultTo(false);
    table.boolean('pause_video_on_click').nullable().defaultTo(false);
    table.string('phone', 255).nullable();
    table.boolean('reset_password').notNullable().defaultTo(true);
    table.string('username', 255).nullable();
    table.boolean('is_manager').notNullable().defaultTo(false);
    table.integer('type').nullable();
    table.string('certificate_path', 255).nullable();
    table.boolean('is_certified').defaultTo(false);
    table.boolean('is_student').notNullable().defaultTo(false);
    table.boolean('is_teacher').notNullable().defaultTo(false);
    table.bigInteger('institution_id').unsigned().nullable().references('id').inTable('institutions');
    table.bigInteger('role_id').unsigned().nullable().references('id').inTable('roles');
    table.string('subject', 255).nullable();
    table.bigInteger('subject_data_id').unsigned().nullable().references('id').inTable('teacher_subject');

    // Campos adicionais encontrados em algumas versões
    table.boolean('is_institution_manager').defaultTo(false);
    table.boolean('is_coordinator').defaultTo(false);
    table.boolean('is_guardian').defaultTo(false);

    // ===== CAMPOS OAUTH GOOGLE =====
    table.string('google_id', 255).unique().nullable();
    table.string('google_email', 255).nullable();
    table.string('google_name', 255).nullable();
    table.string('google_picture', 500).nullable();
    table.text('google_access_token').nullable();
    table.text('google_refresh_token').nullable();
    table.timestamp('google_token_expires_at').nullable();
    table.boolean('is_google_verified').defaultTo(false);
    table.timestamp('google_linked_at').nullable();

    // ===== CAMPOS DE PERFIL ADICIONAIS =====
    table.string('profile_image', 500).nullable();
    table.string('avatar', 500).nullable();
    table.string('avatar_url', 500).nullable();
    table.string('profile_picture', 500).nullable();
    table.text('bio').nullable();
    table.text('description').nullable();
    table.string('first_name', 255).nullable();
    table.string('last_name', 255).nullable();
    table.string('display_name', 255).nullable();
    table.string('locale', 10).nullable();
    table.string('timezone', 50).nullable();
    table.date('birth_date').nullable();
    table.string('gender', 20).nullable();
    table.boolean('phone_verified').defaultTo(false);
    table.boolean('email_verified').defaultTo(false);
    table.boolean('two_factor_enabled').defaultTo(false);

    // ===== CAMPOS DE CONTROLE E VERSIONAMENTO =====
    table.bigInteger('entity_version').defaultTo(1);
    table.integer('revision').defaultTo(0);

    // ===== CAMPOS DE STATUS E CONTROLE =====
    table.string('status', 50).defaultTo('active');
    table.string('account_status', 50).defaultTo('active');
    table.string('verification_status', 50).defaultTo('pending');
    table.timestamp('last_login_at').nullable();
    table.timestamp('last_activity_at').nullable();
    table.integer('login_count').defaultTo(0);
    table.integer('failed_login_attempts').defaultTo(0);
    table.timestamp('locked_until').nullable();

    // ===== CAMPOS DE CONFIGURAÇÕES =====
    table.json('preferences').nullable();
    table.json('settings').nullable();
    table.json('metadata').nullable();

    // ===== CAMPOS DE RELACIONAMENTO EXTRAS =====
    table.uuid('manager_id').nullable();
    table.uuid('department_id').nullable();
    table.uuid('organization_id').nullable();

    // ===== CAMPOS DE CONTATO ADICIONAIS =====
    table.string('mobile_phone', 50).nullable();
    table.string('work_phone', 50).nullable();
    table.string('alternative_email', 255).nullable();

    // ===== CAMPOS DE ENDEREÇO =====
    table.string('street_address', 255).nullable();
    table.string('city', 100).nullable();
    table.string('state', 100).nullable();
    table.string('postal_code', 20).nullable();
    table.string('country', 100).nullable();

    // ===== CAMPOS DE AUDITORIA ADICIONAIS =====
    table.uuid('created_by').nullable();
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at').nullable();
    table.uuid('deleted_by').nullable();

    // ===== CAMPOS DE TIMESTAMPS =====
    table.timestamps(true, true);
    
    // Índices únicos
    table.unique('email');
    table.unique('username');
    
    // Índices compostos e simples
    table.index('email');
    table.index('username');
    table.index('institution_id');
    table.index('role_id');
    table.index('google_id');
    table.index('google_email');
    table.index('is_google_verified');
    table.index('is_admin');
    table.index('is_manager');
    table.index('is_teacher');
    table.index('is_student');
    table.index('is_coordinator');
    table.index('is_guardian');
    table.index('enabled');
    table.index('deleted');
    table.index('account_expired');
    table.index('account_locked');
    table.index('status');
    table.index('account_status');
    table.index('last_login_at');
    table.index('last_activity_at');
    table.index('date_created');
    table.index('last_updated');
    table.index(['institution_id', 'role_id']);
    table.index(['email', 'enabled']);
    table.index(['status', 'deleted']);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('users');
}; 