import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('🚀 Verificando tabela system_settings...');

    const hasSystemSettings = await knex.schema.hasTable('system_settings');
  if (!hasSystemSettings) {
    console.log('📋 Criando tabela system_settings...');
    await knex.schema.createTable('system_settings', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('key').unique().notNullable();
      table.text('value');
      table.string('type').defaultTo('string').comment('string, number, boolean, json');
      table.text('description');
      table.string('category').defaultTo('general').comment('general, appearance, aws, email, notifications, security');
      table.boolean('is_public').defaultTo(false).comment('Se pode ser acessado por usuários não-admin');
      table.boolean('is_encrypted').defaultTo(false).comment('Se o valor deve ser criptografado');
      table.timestamps(true, true);
      
      // Índices para performance
      table.index(['category']);
      table.index(['is_public']);
      table.index(['key', 'category']);
    });
  } else {
    console.log('⚠️  Tabela system_settings já existe, verificando colunas...');
    
    // Verificar e adicionar colunas que faltam
    const hasIsEncrypted = await knex.schema.hasColumn('system_settings', 'is_encrypted');
    if (!hasIsEncrypted) {
      console.log('➕ Adicionando coluna is_encrypted...');
      await knex.schema.alterTable('system_settings', (table) => {
        table.boolean('is_encrypted').defaultTo(false).comment('Se o valor deve ser criptografado');
      });
    }
    
    const hasIsPublic = await knex.schema.hasColumn('system_settings', 'is_public');
    if (!hasIsPublic) {
      console.log('➕ Adicionando coluna is_public...');
      await knex.schema.alterTable('system_settings', (table) => {
        table.boolean('is_public').defaultTo(false).comment('Se pode ser acessado por usuários não-admin');
      });
    }
    
    const hasDescription = await knex.schema.hasColumn('system_settings', 'description');
    if (!hasDescription) {
      console.log('➕ Adicionando coluna description...');
      await knex.schema.alterTable('system_settings', (table) => {
        table.text('description');
      });
    }
    
    const hasCategory = await knex.schema.hasColumn('system_settings', 'category');
    if (!hasCategory) {
      console.log('➕ Adicionando coluna category...');
      await knex.schema.alterTable('system_settings', (table) => {
        table.string('category').defaultTo('general');
      });
    }
    
    const hasType = await knex.schema.hasColumn('system_settings', 'type');
    if (!hasType) {
      console.log('➕ Adicionando coluna type...');
      await knex.schema.alterTable('system_settings', (table) => {
        table.string('type').defaultTo('string');
      });
    }
    
    console.log('✅ Tabela system_settings atualizada!');
  }

  // Verificar e inserir configurações padrão
  console.log('📝 Verificando configurações padrão...');
  
  const defaultSettings = [
    // Configurações Gerais
    { key: 'site_name', value: 'Portal Educacional', type: 'string', category: 'general', description: 'Nome do sistema', is_public: true },
    { key: 'site_title', value: 'Portal Educacional - Sistema de Gestão', type: 'string', category: 'general', description: 'Título do sistema', is_public: true },
    { key: 'site_url', value: 'https://portal.educacional.com', type: 'string', category: 'general', description: 'URL do sistema', is_public: true },
    { key: 'site_description', value: 'Sistema completo de gestão educacional', type: 'string', category: 'general', description: 'Descrição do sistema', is_public: true },
    { key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'general', description: 'Modo de manutenção', is_public: false },
    
    // Configurações de Aparência
    { key: 'logo_light', value: '/logo-light.png', type: 'string', category: 'appearance', description: 'Logo para tema claro', is_public: true },
    { key: 'logo_dark', value: '/logo-dark.png', type: 'string', category: 'appearance', description: 'Logo para tema escuro', is_public: true },
    { key: 'background_type', value: 'video', type: 'string', category: 'appearance', description: 'Tipo de background (video, image, color)', is_public: true },
    { key: 'main_background', value: '/back_video4.mp4', type: 'string', category: 'appearance', description: 'Background principal', is_public: true },
    { key: 'primary_color', value: '#1e3a8a', type: 'string', category: 'appearance', description: 'Cor primária', is_public: true },
    { key: 'secondary_color', value: '#3b82f6', type: 'string', category: 'appearance', description: 'Cor secundária', is_public: true },
    
    // Configurações AWS
    { key: 'aws_access_key', value: 'AKIAYKBH43KYB2DJUQJL', type: 'string', category: 'aws', description: 'AWS Access Key ID', is_public: false, is_encrypted: true },
    { key: 'aws_secret_key', value: 'GXpEEWBptV5F52NprsclOgU5ziolVNsGgY0JNeC7', type: 'string', category: 'aws', description: 'AWS Secret Access Key', is_public: false, is_encrypted: true },
    { key: 'aws_region', value: 'sa-east-1', type: 'string', category: 'aws', description: 'Região AWS', is_public: false },
    { key: 'aws_bucket_main', value: '', type: 'string', category: 'aws', description: 'Bucket principal', is_public: false },
    { key: 'aws_bucket_backup', value: '', type: 'string', category: 'aws', description: 'Bucket de backup', is_public: false },
    { key: 'aws_bucket_media', value: '', type: 'string', category: 'aws', description: 'Bucket de mídia', is_public: false },
    
    // Configurações de Email
    { key: 'email_smtp_host', value: 'smtp.gmail.com', type: 'string', category: 'email', description: 'Servidor SMTP', is_public: false },
    { key: 'email_smtp_port', value: '587', type: 'number', category: 'email', description: 'Porta SMTP', is_public: false },
    { key: 'email_smtp_user', value: 'sabercon@sabercon.com.br', type: 'string', category: 'email', description: 'Usuário SMTP', is_public: false },
    { key: 'email_smtp_password', value: 'Mayta#P1730*K', type: 'string', category: 'email', description: 'Senha SMTP', is_public: false, is_encrypted: true },
    { key: 'email_smtp_secure', value: 'true', type: 'boolean', category: 'email', description: 'Usar TLS/SSL', is_public: false },
    { key: 'email_from_name', value: 'Portal Educacional - Sabercon', type: 'string', category: 'email', description: 'Nome do remetente', is_public: false },
    { key: 'email_from_address', value: 'noreply@sabercon.com.br', type: 'string', category: 'email', description: 'Email do remetente', is_public: false },
    
    // Configurações de Notificações
    { key: 'notifications_email_enabled', value: 'true', type: 'boolean', category: 'notifications', description: 'Notificações por email habilitadas', is_public: false },
    { key: 'notifications_sms_enabled', value: 'false', type: 'boolean', category: 'notifications', description: 'Notificações por SMS habilitadas', is_public: false },
    { key: 'notifications_push_enabled', value: 'true', type: 'boolean', category: 'notifications', description: 'Notificações push habilitadas', is_public: false },
    { key: 'notifications_digest_frequency', value: 'daily', type: 'string', category: 'notifications', description: 'Frequência do resumo de notificações', is_public: false },
    
    // Configurações de Segurança
    { key: 'security_min_password_length', value: '8', type: 'number', category: 'security', description: 'Tamanho mínimo da senha', is_public: false },
    { key: 'security_require_special_chars', value: 'true', type: 'boolean', category: 'security', description: 'Exigir caracteres especiais', is_public: false },
    { key: 'security_require_numbers', value: 'true', type: 'boolean', category: 'security', description: 'Exigir números', is_public: false },
    { key: 'security_session_timeout', value: '30', type: 'number', category: 'security', description: 'Timeout da sessão (minutos)', is_public: false },
    { key: 'security_two_factor_enabled', value: 'false', type: 'boolean', category: 'security', description: 'Autenticação de dois fatores habilitada', is_public: false }
  ];

  for (const setting of defaultSettings) {
    // Verificar se a configuração já existe
    const existingSetting = await knex('system_settings')
      .where('key', setting.key)
      .first();
    
    if (!existingSetting) {
      console.log(`➕ Adicionando configuração: ${setting.key}`);
      await knex('system_settings').insert({
        id: knex.raw('gen_random_uuid()'),
        key: setting.key,
        value: setting.value,
        type: setting.type,
        category: setting.category,
        description: setting.description,
        is_public: setting.is_public,
        is_encrypted: setting.is_encrypted || false,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now()
      });
    } else {
      console.log(`⚠️  Configuração ${setting.key} já existe, pulando...`);
    }
  }

  console.log('✅ Tabela system_settings criada com sucesso!');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('system_settings');
} 