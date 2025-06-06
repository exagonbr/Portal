import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Criar tabela system_settings se não existir
  const hasSystemSettingsTable = await knex.schema.hasTable('system_settings');
  if (!hasSystemSettingsTable) {
    await knex.schema.createTable('system_settings', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('key').unique().notNullable();
      table.jsonb('value').notNullable();
      table.string('category').notNullable();
      table.text('description');
      table.timestamps(true, true);
      
      // Índices
      table.index('category');
    });

    // Inserir configurações padrão apenas se a tabela foi criada
    const defaultSettings = [
    // AWS Settings
    { key: 'aws_access_key', value: '"AKIAYKBH43KYB2DJUQJL"', category: 'aws', description: 'AWS Access Key ID' },
    { key: 'aws_secret_key', value: '"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"', category: 'aws', description: 'AWS Secret Access Key' },
    { key: 'aws_region', value: '"sa-east-1"', category: 'aws', description: 'AWS Region' },
    { key: 'aws_bucket_main', value: '""', category: 'aws', description: 'Bucket principal para arquivos' },
    { key: 'aws_bucket_backup', value: '""', category: 'aws', description: 'Bucket para backups' },
    { key: 'aws_bucket_media', value: '""', category: 'aws', description: 'Bucket para mídia' },

    // Email Settings
    { key: 'email_smtp_host', value: '""', category: 'email', description: 'Servidor SMTP' },
    { key: 'email_smtp_port', value: '587', category: 'email', description: 'Porta SMTP' },
    { key: 'email_smtp_user', value: '""', category: 'email', description: 'Usuário SMTP' },
    { key: 'email_smtp_password', value: '""', category: 'email', description: 'Senha SMTP' },
    { key: 'email_smtp_secure', value: 'true', category: 'email', description: 'Usar TLS/SSL' },
    { key: 'email_from_name', value: '"Portal Educacional"', category: 'email', description: 'Nome do remetente' },
    { key: 'email_from_address', value: '""', category: 'email', description: 'Email do remetente' },

    // General Settings
    { key: 'site_name', value: '"Portal Educacional"', category: 'general', description: 'Nome do sistema' },
    { key: 'site_title', value: '"Sistema de Gestão Educacional"', category: 'general', description: 'Título do sistema' },
    { key: 'site_url', value: '"http://localhost:3000"', category: 'general', description: 'URL do sistema' },
    { key: 'site_description', value: '"Sistema completo de gestão educacional"', category: 'general', description: 'Descrição do sistema' },
    { key: 'maintenance_mode', value: 'false', category: 'general', description: 'Modo de manutenção' },

    // Appearance Settings
    { key: 'logo_light', value: '"/logo-light.png"', category: 'appearance', description: 'Logo para tema claro' },
    { key: 'logo_dark', value: '"/logo-dark.png"', category: 'appearance', description: 'Logo para tema escuro' },
    { key: 'main_background', value: '"/back_video1.mp4"', category: 'appearance', description: 'Background da área principal' },
    { key: 'background_type', value: '"video"', category: 'appearance', description: 'Tipo de background (video/image/color)' },
    { key: 'primary_color', value: '"#1e3a8a"', category: 'appearance', description: 'Cor primária' },
    { key: 'secondary_color', value: '"#3b82f6"', category: 'appearance', description: 'Cor secundária' },

    // Notification Settings
    { key: 'notifications_email_enabled', value: 'true', category: 'notifications', description: 'Notificações por email' },
    { key: 'notifications_sms_enabled', value: 'false', category: 'notifications', description: 'Notificações por SMS' },
    { key: 'notifications_push_enabled', value: 'false', category: 'notifications', description: 'Notificações push' },
    { key: 'notifications_digest_frequency', value: '"daily"', category: 'notifications', description: 'Frequência do resumo' }
    ];

    await knex('system_settings').insert(defaultSettings);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('system_settings');
} 