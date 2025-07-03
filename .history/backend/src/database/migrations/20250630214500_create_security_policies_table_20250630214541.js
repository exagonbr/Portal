exports.up = function(knex) {
  return knex.schema
    // Criar nova tabela de políticas de segurança
    .createTable('security_policies', function(table) {
      table.increments('id').primary();
      
      // Política de Senhas
      table.integer('password_min_length').defaultTo(8).notNullable();
      table.boolean('password_require_uppercase').defaultTo(true).notNullable();
      table.boolean('password_require_lowercase').defaultTo(true).notNullable();
      table.boolean('password_require_numbers').defaultTo(true).notNullable();
      table.boolean('password_require_special_chars').defaultTo(true).notNullable();
      table.integer('password_expiry_days').defaultTo(90).notNullable();
      table.integer('password_prevent_reuse').defaultTo(5).notNullable();
      
      // Política de Contas e Sessões
      table.integer('account_max_login_attempts').defaultTo(5).notNullable();
      table.integer('account_lockout_duration_minutes').defaultTo(30).notNullable();
      table.integer('account_session_timeout_minutes').defaultTo(30).notNullable();
      table.boolean('account_require_mfa').defaultTo(false).notNullable();
      table.integer('account_inactivity_lockout_days').defaultTo(60).notNullable();
      
      // Política de Dados e Privacidade
      table.integer('data_retention_months').defaultTo(36).notNullable();
      table.boolean('data_encrypt_sensitive_data').defaultTo(true).notNullable();
      table.boolean('data_anonymize_deleted_users').defaultTo(true).notNullable();
      table.boolean('data_enable_audit_logging').defaultTo(true).notNullable();
      
      // Metadados
      table.string('created_by').nullable();
      table.string('updated_by').nullable();
      table.timestamps(true, true);
    })
    
    // Migrar dados da tabela antiga se existir
    .then(function() {
      return knex.schema.hasTable('security_settings').then(function(exists) {
        if (exists) {
          return knex('security_settings').first().then(function(oldSettings) {
            if (oldSettings) {
              return knex('security_policies').insert({
                id: 1,
                password_min_length: oldSettings.min_password_length || 8,
                password_require_uppercase: true,
                password_require_lowercase: true,
                password_require_numbers: oldSettings.require_numbers || true,
                password_require_special_chars: oldSettings.require_special_chars || true,
                password_expiry_days: 90,
                password_prevent_reuse: 5,
                account_max_login_attempts: 5,
                account_lockout_duration_minutes: 30,
                account_session_timeout_minutes: oldSettings.session_timeout || 30,
                account_require_mfa: oldSettings.two_factor_auth === 'required',
                account_inactivity_lockout_days: 60,
                data_retention_months: 36,
                data_encrypt_sensitive_data: true,
                data_anonymize_deleted_users: true,
                data_enable_audit_logging: true,
                created_by: 'system_migration'
              });
            }
          });
        }
      });
    });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('security_policies');
};