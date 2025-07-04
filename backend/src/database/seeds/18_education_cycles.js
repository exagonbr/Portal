'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function(knex) {
  // Busca a primeira instituição para associar os ciclos
  const institution = await knex('institution').first();
  
  if (!institution) {
    console.log('Nenhuma instituição encontrada. Pulando seed de ciclos educacionais.');
    return;
  }

  // Deleta todos os registros existentes
  await knex('education_cycles').del();
  
  // Insere os ciclos educacionais
  await knex('education_cycles').insert([
    {
      id: 1,
      name: 'Educação Infantil',
      code: 'EI',
      description: 'Primeira etapa da educação básica',
      min_age: 0,
      max_age: 5,
      duration_years: 5,
      institution_id: institution.id,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Ensino Fundamental I',
      code: 'EF1',
      description: 'Anos iniciais do ensino fundamental (1º ao 5º ano)',
      min_age: 6,
      max_age: 10,
      duration_years: 5,
      institution_id: institution.id,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'Ensino Fundamental II',
      code: 'EF2',
      description: 'Anos finais do ensino fundamental (6º ao 9º ano)',
      min_age: 11,
      max_age: 14,
      duration_years: 4,
      institution_id: institution.id,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'Ensino Médio',
      code: 'EM',
      description: 'Última etapa da educação básica',
      min_age: 15,
      max_age: 17,
      duration_years: 3,
      institution_id: institution.id,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: 'Educação de Jovens e Adultos',
      code: 'EJA',
      description: 'Modalidade de ensino para jovens e adultos',
      min_age: 18,
      max_age: null,
      duration_years: 2,
      institution_id: institution.id,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      name: 'Ensino Técnico',
      code: 'ET',
      description: 'Formação técnica profissionalizante',
      min_age: 15,
      max_age: null,
      duration_years: 2,
      institution_id: institution.id,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};