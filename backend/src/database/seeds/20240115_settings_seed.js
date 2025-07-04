exports.seed = async function(knex) {
  // Essas tabelas não existem mais no novo schema
  // Vamos apenas retornar sem fazer nada
  // Os settings agora são gerenciados pela tabela 'settings' genérica
  
  // Se quisermos migrar esses dados para a tabela settings, podemos fazer:
  try {
    // Verificar se já existem essas configurações
    const existingSettings = await knex('settings').where('category', 'email').first();
    
    if (!existingSettings) {
      // Inserir configurações de email como settings genéricos
      await knex('settings').insert([
        {
          key: 'smtp_server',
          value: '',
          type: 'string',
          category: 'email',
          description: 'Servidor SMTP para envio de emails',
          is_public: false,
          is_editable: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          key: 'smtp_port',
          value: '587',
          type: 'number',
          category: 'email',
          description: 'Porta do servidor SMTP',
          is_public: false,
          is_editable: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          key: 'smtp_encryption',
          value: 'tls',
          type: 'string',
          category: 'email',
          description: 'Tipo de criptografia (tls/ssl)',
          is_public: false,
          is_editable: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          key: 'sender_email',
          value: '',
          type: 'string',
          category: 'email',
          description: 'Email remetente padrão',
          is_public: false,
          is_editable: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    }
  } catch (error) {
    // Ignorar erros se as tabelas não existirem
    console.log('Settings de email já configurados ou erro ao inserir:', error.message);
  }
};