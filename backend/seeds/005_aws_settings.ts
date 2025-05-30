import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletar dados existentes
  await knex('aws_settings').del();

  // Buscar um usuário admin para ser o criador das configurações padrão
  const adminUser = await knex('users')
    .join('roles', 'users.role_id', 'roles.id')
    .where('roles.name', 'admin')
    .select('users.id')
    .first();

  const defaultSettings = {
    id: knex.raw('gen_random_uuid()'),
    access_key_id: 'DEMO_ACCESS_KEY',
    secret_access_key: 'DEMO_SECRET_KEY',
    region: 'sa-east-1',
    s3_bucket_name: 'portal-educacional-storage',
    cloudwatch_namespace: 'Portal/Metrics',
    update_interval: 30,
    enable_real_time_updates: true,
    is_active: true,
    created_by: adminUser?.id || null,
    updated_by: adminUser?.id || null,
    created_at: new Date(),
    updated_at: new Date()
  };

  // Inserir configurações padrão
  await knex('aws_settings').insert(defaultSettings);
} 