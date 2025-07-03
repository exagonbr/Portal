exports.seed = async function(knex) {
  // Limpar tabela existente
  await knex('security_policies').del();

  // Inserir configurações padrão de segurança
  await knex('security_policies').insert([
    {
      id: 1,
      
      // Política de Senhas - valores padrão da tela
      password_min_length: 8,
      password_require_uppercase: true,
      password_require_lowercase: true,
      password_require_numbers: true,
      password_require_special_chars: true,
      password_expiry_days: 90,
      password_prevent_reuse: 5,
      
      // Política de Contas e Sessões - valores padrão da tela
      account_max_login_attempts: 5,
      account_lockout_duration_minutes: 30,
      account_session_timeout_minutes: 30,
      account_require_mfa: false,
      account_inactivity_lockout_days: 60,
      
      // Política de Dados e Privacidade - valores padrão da tela
      data_retention_months: 36,
      data_encrypt_sensitive_data: true,
      data_anonymize_deleted_users: true,
      data_enable_audit_logging: true,
      
      // Metadados
      created_by: 'system_seed',
      updated_by: 'system_seed',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
  
  console.log('✅ Configurações de segurança inseridas com sucesso!');
  console.log('📋 Políticas configuradas:');
  console.log('   🔐 Política de Senhas: Tamanho mínimo 8, maiúscula/minúscula/números/especiais obrigatórios');
  console.log('   👤 Política de Contas: Máximo 5 tentativas, bloqueio 30min, sessão 30min');
  console.log('   🛡️  Política de Dados: Retenção 36 meses, criptografia e auditoria habilitadas');
};