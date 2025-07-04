'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function(knex) {
  // Busca a primeira instituição
  const institution = await knex('institution').first();
  
  if (!institution) {
    console.log('Nenhuma instituição encontrada. Pulando seed de escolas.');
    return;
  }

  // Deleta todos os registros existentes
  await knex('schools').del();
  
  // Insere as escolas
  await knex('schools').insert([
    {
      id: 1,
      name: 'Escola Municipal Dom Pedro I',
      code: 'EMDP1',
      type: 'public',
      level: 'elementary',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      postal_code: '01234-567',
      country: 'Brasil',
      phone: '(11) 3456-7890',
      email: 'contato@emdompedro.edu.br',
      website: 'https://www.emdompedro.edu.br',
      institution_id: institution.id,
      student_capacity: 500,
      current_students: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Colégio Estadual Santos Dumont',
      code: 'CESD',
      type: 'public',
      level: 'high',
      address: 'Avenida Brasil, 456',
      city: 'Rio de Janeiro',
      state: 'RJ',
      postal_code: '20000-000',
      country: 'Brasil',
      phone: '(21) 2345-6789',
      email: 'secretaria@cesantosdumont.edu.br',
      website: 'https://www.cesantosdumont.edu.br',
      institution_id: institution.id,
      student_capacity: 800,
      current_students: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'Instituto Educacional Monteiro Lobato',
      code: 'IEML',
      type: 'private',
      level: 'k12',
      address: 'Rua dos Estudantes, 789',
      city: 'Belo Horizonte',
      state: 'MG',
      postal_code: '30123-456',
      country: 'Brasil',
      phone: '(31) 3456-7890',
      email: 'atendimento@monteirolobato.edu.br',
      website: 'https://www.monteirolobato.edu.br',
      institution_id: institution.id,
      student_capacity: 1200,
      current_students: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'Escola Técnica Estadual José de Alencar',
      code: 'ETEJA',
      type: 'public',
      level: 'high',
      address: 'Rua da Tecnologia, 321',
      city: 'Curitiba',
      state: 'PR',
      postal_code: '80000-000',
      country: 'Brasil',
      phone: '(41) 3333-4444',
      email: 'secretaria@etejosealencar.edu.br',
      website: 'https://www.etejosealencar.edu.br',
      institution_id: institution.id,
      student_capacity: 600,
      current_students: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: 'Centro Educacional Paulo Freire',
      code: 'CEPF',
      type: 'private',
      level: 'middle',
      address: 'Alameda do Conhecimento, 555',
      city: 'Porto Alegre',
      state: 'RS',
      postal_code: '90000-000',
      country: 'Brasil',
      phone: '(51) 3222-3333',
      email: 'contato@cepaulofreire.edu.br',
      website: 'https://www.cepaulofreire.edu.br',
      institution_id: institution.id,
      student_capacity: 400,
      current_students: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      name: 'Escola Municipal Cecília Meireles',
      code: 'EMCM',
      type: 'public',
      level: 'elementary',
      address: 'Rua das Letras, 888',
      city: 'Salvador',
      state: 'BA',
      postal_code: '40000-000',
      country: 'Brasil',
      phone: '(71) 3456-7890',
      email: 'direcao@emceciliameireles.edu.br',
      website: 'https://www.emceciliameireles.edu.br',
      institution_id: institution.id,
      student_capacity: 350,
      current_students: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 7,
      name: 'Colégio Internacional Nova Era',
      code: 'CINE',
      type: 'private',
      level: 'k12',
      address: 'Avenida do Futuro, 1000',
      city: 'Brasília',
      state: 'DF',
      postal_code: '70000-000',
      country: 'Brasil',
      phone: '(61) 3333-4444',
      email: 'info@colegionovaera.edu.br',
      website: 'https://www.colegionovaera.edu.br',
      institution_id: institution.id,
      student_capacity: 1500,
      current_students: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 8,
      name: 'Escola Estadual Machado de Assis',
      code: 'EEMA',
      type: 'public',
      level: 'high',
      address: 'Praça da Literatura, 200',
      city: 'Recife',
      state: 'PE',
      postal_code: '50000-000',
      country: 'Brasil',
      phone: '(81) 3456-7890',
      email: 'secretaria@eemachadodeassis.edu.br',
      website: 'https://www.eemachadodeassis.edu.br',
      institution_id: institution.id,
      student_capacity: 700,
      current_students: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};