'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function(knex) {
  // Deleta todos os registros existentes
  await knex('publishers').del();
  
  // Insere as editoras
  await knex('publishers').insert([
    {
      id: 1,
      name: 'Editora Saraiva',
      website: 'https://www.editorasaraiva.com.br',
      contact_email: 'contato@saraiva.com.br',
      contact_phone: '(11) 3613-3000',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Editora Moderna',
      website: 'https://www.moderna.com.br',
      contact_email: 'atendimento@moderna.com.br',
      contact_phone: '0800 17 2002',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'FTD Educação',
      website: 'https://www.ftd.com.br',
      contact_email: 'central.atendimento@ftd.com.br',
      contact_phone: '0800 772 2300',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'Editora Ática',
      website: 'https://www.atica.com.br',
      contact_email: 'atendimento@atica.com.br',
      contact_phone: '0800 115 152',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: 'Editora Scipione',
      website: 'https://www.scipione.com.br',
      contact_email: 'atendimento@scipione.com.br',
      contact_phone: '0800 16 10 60',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      name: 'Editora Positivo',
      website: 'https://www.editorapositivo.com.br',
      contact_email: 'sac@positivo.com.br',
      contact_phone: '0800 725 3536',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 7,
      name: 'SM Educação',
      website: 'https://www.smeducacao.com.br',
      contact_email: 'atendimento@smeducacao.com.br',
      contact_phone: '0800 725 5555',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 8,
      name: 'Editora do Brasil',
      website: 'https://www.editoradobrasil.com.br',
      contact_email: 'sac@editoradobrasil.com.br',
      contact_phone: '(11) 3226-0211',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 9,
      name: 'Pearson Education',
      website: 'https://www.pearson.com.br',
      contact_email: 'atendimento@pearson.com',
      contact_phone: '0800 011 0028',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 10,
      name: 'Editora Abril',
      website: 'https://www.abril.com.br',
      contact_email: 'sac@abril.com.br',
      contact_phone: '(11) 3037-2000',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};