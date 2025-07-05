exports.up = function(knex) {
  return knex.schema
    // Tabela de configurações AWS
    .createTable('aws_settings', function(table) {
      table.increments('id').primary();
      table.string('access_key_id').notNullable();
      table.string('secret_access_key').notNullable();
      table.string('region').defaultTo('us-east-1');
      table.string('s3_bucket_name');
      table.string('cloudwatch_namespace').defaultTo('Portal/Metrics');
      table.integer('update_interval').defaultTo(30);
      table.boolean('enable_real_time_updates').defaultTo(true);
      table.timestamps(true, true);
    })
    
    // Tabela de configurações de plano de fundo
    .createTable('background_settings', function(table) {
      table.increments('id').primary();
      table.enum('type', ['video', 'url', 'color']).defaultTo('video');
      table.string('video_file').defaultTo('/back_video1.mp4');
      table.string('custom_url');
      table.string('solid_color').defaultTo('#1e3a8a');
      table.timestamps(true, true);
    })
    
    // Tabela de configurações gerais
    .createTable('general_settings', function(table) {
      table.increments('id').primary();
      table.string('platform_name').defaultTo('Portal Educacional');
      table.string('system_url').defaultTo('https://portal.educacional.com');
      table.string('support_email').defaultTo('suporte@portal.educacional.com');
      table.timestamps(true, true);
    })
    
    // Tabela de configurações de segurança
    .createTable('security_settings', function(table) {
      table.increments('id').primary();
      table.integer('min_password_length').defaultTo(8);
      table.boolean('require_special_chars').defaultTo(true);
      table.boolean('require_numbers').defaultTo(true);
      table.enum('two_factor_auth', ['optional', 'required', 'disabled']).defaultTo('optional');
      table.integer('session_timeout').defaultTo(30);
      table.timestamps(true, true);
    })
    
    // Tabela de configurações de email
    .createTable('email_settings', function(table) {
      table.increments('id').primary();
      table.string('smtp_server');
      table.integer('smtp_port').defaultTo(587);
      table.enum('encryption', ['tls', 'ssl', 'none']).defaultTo('tls');
      table.string('sender_email');
      table.string('sender_password');
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('email_settings')
    .dropTableIfExists('security_settings')
    .dropTableIfExists('general_settings')
    .dropTableIfExists('background_settings')
    .dropTableIfExists('aws_settings');
}; 