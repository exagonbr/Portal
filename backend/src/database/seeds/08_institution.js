/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('institution').del()
  await knex('institution').insert([
    {
      id: 1,
      accountable_contact: 'contato@sabercon.com',
      accountable_name: 'Admin SaberCon',
      company_name: 'SaberCon EdTech',
      contract_disabled: false,
      contract_term_end: new Date('2025-12-31'),
      contract_term_start: new Date('2023-01-01'),
      deleted: false,
      district: 'Centro',
      document: '12.345.678/0001-99',
      name: 'Escola SaberCon Digital',
      postal_code: '12345-000',
      state: 'SP',
      street: 'Rua do Saber, 123',
      has_library_platform: true,
      has_principal_platform: true,
      has_student_platform: true,
      date_created: new Date(),
      last_updated: new Date()
    }
  ]);
};