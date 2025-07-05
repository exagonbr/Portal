'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function(knex) {
  // Limpar tabela institution
  await knex('institution').del();
  
  // Inserir instituições de teste
  await knex('institution').insert([
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
      has_student_platform: true
    },
    {
      id: 2,
      version: 1,
      accountable_contact: 'contato@escolamunicipal.edu.br',
      accountable_name: 'Diretor Municipal',
      company_name: 'Escola Municipal Santos Dumont',
      complement: 'Prédio Principal',
      contract_disabled: false,
      contract_invoice_num: 'INV-2025-002',
      contract_num: 2025002,
      contract_term_end: new Date('2025-12-31'),
      contract_term_start: new Date('2025-01-01'),
      date_created: new Date(),
      deleted: false,
      district: 'Vila Nova',
      document: '98.765.432/0001-10',
      invoice_date: new Date(),
      last_updated: new Date(),
      name: 'Escola Municipal Santos Dumont',
      postal_code: '04567-890',
      state: 'SP',
      street: 'Rua das Flores, 123',
      score: 85,
      has_library_platform: true,
      has_principal_platform: true,
      has_student_platform: true
    },
    {
      id: 3,
      version: 1,
      accountable_contact: 'diretoria@ifsp.edu.br',
      accountable_name: 'Reitor IFSP',
      company_name: 'Instituto Federal de São Paulo',
      complement: 'Campus São Paulo',
      contract_disabled: false,
      contract_invoice_num: 'INV-2025-003',
      contract_num: 2025003,
      contract_term_end: new Date('2025-12-31'),
      contract_term_start: new Date('2025-01-01'),
      date_created: new Date(),
      deleted: false,
      district: 'Bela Vista',
      document: '10.882.594/0001-65',
      invoice_date: new Date(),
      last_updated: new Date(),
      name: 'Instituto Federal de São Paulo',
      postal_code: '01308-000',
      state: 'SP',
      street: 'Rua Pedro Vicente, 625',
      score: 95,
      has_library_platform: true,
      has_principal_platform: true,
      has_student_platform: true
    }
  ]);
  
  console.log('✅ Dados de teste inseridos na tabela institution');
}; 