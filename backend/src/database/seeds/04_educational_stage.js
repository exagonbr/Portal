/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('educational_stages').del()
  await knex('educational_stages').insert([
    {
      id: 1,
      name: 'Educação Infantil',
      code: 'EI',
      description: 'Primeira etapa da educação básica',
      order_index: 1,
      min_age: 0,
      max_age: 5,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Ensino Fundamental I',
      code: 'EF1',
      description: 'Anos iniciais do ensino fundamental (1º ao 5º ano)',
      order_index: 2,
      min_age: 6,
      max_age: 10,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'Ensino Fundamental II',
      code: 'EF2',
      description: 'Anos finais do ensino fundamental (6º ao 9º ano)',
      order_index: 3,
      min_age: 11,
      max_age: 14,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'Ensino Médio',
      code: 'EM',
      description: 'Última etapa da educação básica',
      order_index: 4,
      min_age: 15,
      max_age: 17,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: 'Superior',
      code: 'SUP',
      description: 'Ensino superior',
      order_index: 5,
      min_age: 18,
      max_age: 24,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};