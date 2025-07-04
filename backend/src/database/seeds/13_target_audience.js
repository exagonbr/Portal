/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('target_audiences').del()
  await knex('target_audiences').insert([
    {
      id: 1,
      name: 'Educação Infantil',
      description: 'Conteúdo para crianças em idade pré-escolar (0-5 anos)',
      min_age: 0,
      max_age: 5,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Ensino Fundamental I',
      description: 'Conteúdo para alunos do 1º ao 5º ano (6-10 anos)',
      min_age: 6,
      max_age: 10,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'Ensino Fundamental II',
      description: 'Conteúdo para alunos do 6º ao 9º ano (11-14 anos)',
      min_age: 11,
      max_age: 14,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'Ensino Médio',
      description: 'Conteúdo para alunos do ensino médio (15-17 anos)',
      min_age: 15,
      max_age: 17,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: 'Educação de Jovens e Adultos',
      description: 'Conteúdo para educação de jovens e adultos (EJA) - 18+ anos',
      min_age: 18,
      max_age: 99,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      name: 'Professores',
      description: 'Material de apoio para professores e educadores',
      min_age: 18,
      max_age: 99,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};