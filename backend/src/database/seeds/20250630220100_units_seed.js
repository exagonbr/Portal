/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('unit').del();
  
  // Inserts seed entries
  await knex('unit').insert([
    {
      id: 1,
      version: 1,
      date_created: new Date(),
      deleted: false,
      institution_id: 1,
      last_updated: new Date(),
      name: 'Escola Municipal João Silva',
      institution_name: 'Prefeitura Municipal de São Paulo'
    },
    {
      id: 2,
      version: 1,
      date_created: new Date(),
      deleted: false,
      institution_id: 1,
      last_updated: new Date(),
      name: 'Colégio Estadual Maria Santos',
      institution_name: 'Secretaria de Educação do Estado'
    },
    {
      id: 3,
      version: 1,
      date_created: new Date(),
      deleted: false,
      institution_id: 2,
      last_updated: new Date(),
      name: 'Campus Central - Universidade Federal',
      institution_name: 'Universidade Federal de São Paulo'
    },
    {
      id: 4,
      version: 1,
      date_created: new Date(),
      deleted: false,
      institution_id: 2,
      last_updated: new Date(),
      name: 'Campus Norte - Extensão',
      institution_name: 'Universidade Federal de São Paulo'
    },
    {
      id: 5,
      version: 1,
      date_created: new Date(),
      deleted: true,
      institution_id: 1,
      last_updated: new Date(),
      name: 'Escola Desativada',
      institution_name: 'Prefeitura Municipal de São Paulo'
    }
  ]);
};