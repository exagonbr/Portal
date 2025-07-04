'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function(knex) {
  // Busca a primeira instituição
  const institution = await knex('institution').first();
  
  if (!institution) {
    console.log('Nenhuma instituição encontrada. Pulando seed de períodos educacionais.');
    return;
  }

  // Deleta todos os registros existentes
  await knex('education_periods').del();
  
  const currentYear = new Date().getFullYear();
  
  // Insere os períodos educacionais
  await knex('education_periods').insert([
    {
      id: 1,
      name: `1º Semestre de ${currentYear}`,
      year: currentYear,
      semester: 1,
      quarter: null,
      start_date: new Date(currentYear, 1, 1), // 1 de fevereiro
      end_date: new Date(currentYear, 6, 31), // 31 de julho
      institution_id: institution.id,
      is_current: new Date() >= new Date(currentYear, 1, 1) && new Date() <= new Date(currentYear, 6, 31),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: `2º Semestre de ${currentYear}`,
      year: currentYear,
      semester: 2,
      quarter: null,
      start_date: new Date(currentYear, 7, 1), // 1 de agosto
      end_date: new Date(currentYear, 11, 20), // 20 de dezembro
      institution_id: institution.id,
      is_current: new Date() >= new Date(currentYear, 7, 1) && new Date() <= new Date(currentYear, 11, 20),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: `1º Bimestre de ${currentYear}`,
      year: currentYear,
      semester: 1,
      quarter: 1,
      start_date: new Date(currentYear, 1, 1), // 1 de fevereiro
      end_date: new Date(currentYear, 3, 30), // 30 de abril
      institution_id: institution.id,
      is_current: new Date() >= new Date(currentYear, 1, 1) && new Date() <= new Date(currentYear, 3, 30),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: `2º Bimestre de ${currentYear}`,
      year: currentYear,
      semester: 1,
      quarter: 2,
      start_date: new Date(currentYear, 4, 1), // 1 de maio
      end_date: new Date(currentYear, 6, 31), // 31 de julho
      institution_id: institution.id,
      is_current: new Date() >= new Date(currentYear, 4, 1) && new Date() <= new Date(currentYear, 6, 31),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: `3º Bimestre de ${currentYear}`,
      year: currentYear,
      semester: 2,
      quarter: 3,
      start_date: new Date(currentYear, 7, 1), // 1 de agosto
      end_date: new Date(currentYear, 9, 30), // 30 de outubro
      institution_id: institution.id,
      is_current: new Date() >= new Date(currentYear, 7, 1) && new Date() <= new Date(currentYear, 9, 30),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      name: `4º Bimestre de ${currentYear}`,
      year: currentYear,
      semester: 2,
      quarter: 4,
      start_date: new Date(currentYear, 10, 1), // 1 de novembro
      end_date: new Date(currentYear, 11, 20), // 20 de dezembro
      institution_id: institution.id,
      is_current: new Date() >= new Date(currentYear, 10, 1) && new Date() <= new Date(currentYear, 11, 20),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    // Períodos do ano anterior (para histórico)
    {
      id: 7,
      name: `1º Semestre de ${currentYear - 1}`,
      year: currentYear - 1,
      semester: 1,
      quarter: null,
      start_date: new Date(currentYear - 1, 1, 1),
      end_date: new Date(currentYear - 1, 6, 31),
      institution_id: institution.id,
      is_current: false,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 8,
      name: `2º Semestre de ${currentYear - 1}`,
      year: currentYear - 1,
      semester: 2,
      quarter: null,
      start_date: new Date(currentYear - 1, 7, 1),
      end_date: new Date(currentYear - 1, 11, 20),
      institution_id: institution.id,
      is_current: false,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};