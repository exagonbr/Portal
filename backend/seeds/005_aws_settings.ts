export async function seed(knex: any): Promise<void> {
  // Deletar dados existentes
  await knex('aws_settings').del();

  console.log('⚙️ Inserindo configurações AWS padrão...');

  const defaultSettings = [
    {
      setting_key: 'AWS_ACCESS_KEY_ID',
      setting_value: 'DEMO_ACCESS_KEY',
      description: 'Chave de acesso AWS para demonstração',
      is_encrypted: true,
      is_active: true
    },
    {
      setting_key: 'AWS_SECRET_ACCESS_KEY',
      setting_value: 'DEMO_SECRET_KEY',
      description: 'Chave secreta AWS para demonstração',
      is_encrypted: true,
      is_active: true
    },
    {
      setting_key: 'AWS_REGION',
      setting_value: 'sa-east-1',
      description: 'Região AWS padrão (São Paulo)',
      is_encrypted: false,
      is_active: true
    },
    {
      setting_key: 'S3_BUCKET_NAME',
      setting_value: 'portal-educacional-storage',
      description: 'Nome do bucket S3 para armazenamento',
      is_encrypted: false,
      is_active: true
    },
    {
      setting_key: 'CLOUDWATCH_NAMESPACE',
      setting_value: 'Portal/Metrics',
      description: 'Namespace do CloudWatch para métricas',
      is_encrypted: false,
      is_active: true
    },
    {
      setting_key: 'UPDATE_INTERVAL',
      setting_value: '30',
      description: 'Intervalo de atualização em segundos',
      is_encrypted: false,
      is_active: true
    },
    {
      setting_key: 'ENABLE_REAL_TIME_UPDATES',
      setting_value: 'true',
      description: 'Habilitar atualizações em tempo real',
      is_encrypted: false,
      is_active: true
    }
  ];

  // Inserir configurações padrão
  await knex('aws_settings').insert(defaultSettings);
  
  console.log(`✅ ${defaultSettings.length} configurações AWS inseridas`);
} 