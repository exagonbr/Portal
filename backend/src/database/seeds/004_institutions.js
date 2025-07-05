'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function(knex) {
  // Limpar tabela de institutions
  await knex('institutions').del();
  
  // Inserir instituições padrão
  await knex('institutions').insert([
    {
      id: 1,
      version: 1,
      accountable_contact: 'admin@sabercon.edu.br',
      accountable_name: 'Administrador Sabercon',
      company_name: 'Portal Sabercon LTDA',
      complement: 'Sala 101',
      contract_disabled: false,
      contract_invoice_num: 'INV-2025-001',
      contract_num: 2025001,
      contract_term_end: new Date('2025-12-31'),
      contract_term_start: new Date('2025-01-01'),
      date_created: new Date(),
      deleted: false,
      district: 'Centro',
      document: '12.345.678/0001-90',
      invoice_date: new Date(),
      last_updated: new Date(),
      name: 'Portal Sabercon - Sede',
      postal_code: '01310-100',
      state: 'SP',
      street: 'Av. Paulista, 1000',
      score: 100,
      has_library_platform: true,
      has_principal_platform: true,
      has_student_platform: true,
      type: 'headquarters',
      status: 'active',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 2,
      version: 1,
      accountable_contact: 'contato@ifsp.edu.br',
      accountable_name: 'Diretor IFSP',
      company_name: 'Instituto Federal de São Paulo',
      complement: 'Campus São Paulo',
      contract_disabled: false,
      contract_invoice_num: 'INV-2025-002',
      contract_num: 2025002,
      contract_term_end: new Date('2025-12-31'),
      contract_term_start: new Date('2025-01-01'),
      date_created: new Date(),
      deleted: false,
      district: 'Bela Vista',
      document: '10.882.594/0001-37',
      invoice_date: new Date(),
      last_updated: new Date(),
      name: 'Instituto Federal de São Paulo - IFSP',
      postal_code: '01308-060',
      state: 'SP',
      street: 'Rua Pedro Vicente, 625',
      score: 95,
      has_library_platform: true,
      has_principal_platform: true,
      has_student_platform: true,
      type: 'educational',
      status: 'active',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
}; 