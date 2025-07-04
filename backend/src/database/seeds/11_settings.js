/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('settings').del()
  await knex('settings').insert([
    {
      id: 1,
      key: 'site_name',
      value: 'Portal Educacional',
      type: 'string',
      category: 'general',
      description: 'Nome do portal que aparece no título da página',
      is_public: true,
      is_editable: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      key: 'admin_email',
      value: 'admin@portal.edu.br',
      type: 'string',
      category: 'contact',
      description: 'Email principal do administrador do sistema',
      is_public: false,
      is_editable: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      key: 'allow_registration',
      value: 'true',
      type: 'boolean',
      category: 'security',
      description: 'Permitir que novos usuários se registrem',
      is_public: false,
      is_editable: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      key: 'maintenance_mode',
      value: 'false',
      type: 'boolean',
      category: 'system',
      description: 'Ativar modo de manutenção do sistema',
      is_public: false,
      is_editable: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      key: 'max_upload_size',
      value: '10485760',
      type: 'number',
      category: 'files',
      description: 'Tamanho máximo de upload em bytes (10MB)',
      is_public: false,
      is_editable: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      key: 'theme_color',
      value: '#1890ff',
      type: 'string',
      category: 'appearance',
      description: 'Cor principal do tema',
      is_public: true,
      is_editable: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};