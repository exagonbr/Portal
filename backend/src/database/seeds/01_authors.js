/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('authors').del()
  await knex('authors').insert([
    {
      id: 1,
      name: 'Machado de Assis',
      biography: 'Escritor brasileiro, fundador da Academia Brasileira de Letras',
      nationality: 'Brasileiro',
      birth_date: '1839-06-21',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Clarice Lispector',
      biography: 'Escritora e jornalista brasileira de origem ucraniana',
      nationality: 'Brasileira',
      birth_date: '1920-12-10',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'Paulo Coelho',
      biography: 'Escritor, letrista e jornalista brasileiro',
      nationality: 'Brasileiro',
      birth_date: '1947-08-24',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};