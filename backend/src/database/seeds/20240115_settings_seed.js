exports.seed = async function(knex) {
  // Limpar tabelas existentes
  await knex('email_settings').del();
  await knex('security_settings').del();
  await knex('general_settings').del();
  await knex('background_settings').del();
  await knex('aws_settings').del();

  // Inserir dados iniciais
  await knex('aws_settings').insert([
    {
      id: 1,
      access_key_id: '',
      secret_access_key: '',
      region: 'us-east-1',
      s3_bucket_name: '',
      cloudwatch_namespace: 'Portal/Metrics',
      update_interval: 30,
      enable_real_time_updates: true
    }
  ]);

  await knex('background_settings').insert([
    {
      id: 1,
      type: 'video',
      video_file: '/back_video1.mp4',
      custom_url: '',
      solid_color: '#1e3a8a'
    }
  ]);

  await knex('general_settings').insert([
    {
      id: 1,
      platform_name: 'Portal Educacional',
      system_url: 'https://portal.educacional.com',
      support_email: 'suporte@portal.educacional.com'
    }
  ]);

  await knex('security_settings').insert([
    {
      id: 1,
      min_password_length: 8,
      require_special_chars: true,
      require_numbers: true,
      two_factor_auth: 'optional',
      session_timeout: 30
    }
  ]);

  await knex('email_settings').insert([
    {
      id: 1,
      smtp_server: '',
      smtp_port: 587,
      encryption: 'tls',
      sender_email: '',
      sender_password: ''
    }
  ]);
}; 