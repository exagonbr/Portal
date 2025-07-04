/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('tags').del()
  await knex('tags').insert([
    {
      id: 1,
      name: 'Educação',
      slug: 'educacao',
      category: 'geral',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Tecnologia',
      slug: 'tecnologia',
      category: 'geral',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'Ciências',
      slug: 'ciencias',
      category: 'disciplina',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'Matemática',
      slug: 'matematica',
      category: 'disciplina',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: 'História',
      slug: 'historia',
      category: 'disciplina',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      name: 'Geografia',
      slug: 'geografia',
      category: 'disciplina',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 7,
      name: 'Ensino Fundamental',
      slug: 'ensino-fundamental',
      category: 'nivel',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 8,
      name: 'Ensino Médio',
      slug: 'ensino-medio',
      category: 'nivel',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 9,
      name: 'Atividade',
      slug: 'atividade',
      category: 'tipo',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 10,
      name: 'Exercício',
      slug: 'exercicio',
      category: 'tipo',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};