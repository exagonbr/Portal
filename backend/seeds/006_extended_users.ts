import type { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing users
  await knex('users').del();

  // Get institution and role IDs
  const institutions = await knex('institutions').select('id', 'name');
  const roles = await knex('roles').select('id', 'name');

  const getInstitutionId = (name: string) => institutions.find(i => i.name === name)?.id;
  const getRoleId = (name: string) => roles.find(r => r.name === name)?.id;

  // Hash password
  const defaultPassword = await bcrypt.hash('password123', 12);

  // Insert users without explicit IDs (let database generate UUIDs)
  const users = [
    {
      name: 'ADM',
      email: 'admin@portal.com',
      password: defaultPassword,
      role_id: getRoleId('Administrador'),
      institution_id: getInstitutionId('Portal Corp'),
      endereco: 'Rua Principal, 123',
      telefone: '(11) 99999-9999',
      usuario: 'adminuser',
      unidade_ensino: 'Sede Administrativa'
    },
    {
      name: 'Julia Costa',
      email: 'julia.c@edu.com',
      password: defaultPassword,
      role_id: getRoleId('Aluno'),
      institution_id: getInstitutionId('Escola Municipal São José'),
      endereco: 'Av. Brasil, 456',
      telefone: '(21) 98888-8888',
      usuario: 'juliac',
      unidade_ensino: 'Unidade Centro'
    },
    {
      name: 'Professor Ricardo',
      email: 'ricardo.oliveira@edu.com',
      password: defaultPassword,
      role_id: getRoleId('Professor'),
      institution_id: getInstitutionId('Escola Municipal São José'),
      endereco: 'Rua das Palmeiras, 789',
      telefone: '(31) 97777-7777',
      usuario: 'ricardoprof',
      unidade_ensino: 'Unidade Centro'
    },
    {
      name: 'Marina Silva',
      email: 'manager@portal.com',
      password: defaultPassword,
      role_id: getRoleId('Gestor'),
      institution_id: getInstitutionId('Portal Corp'),
      endereco: 'Alameda dos Anjos, 101',
      telefone: '(41) 96666-6666',
      usuario: 'usermanager',
      unidade_ensino: 'Sede Operacional'
    },
    {
      name: 'Ana Santos',
      email: 'ana.santos@edu.com',
      password: defaultPassword,
      role_id: getRoleId('Professor'),
      institution_id: getInstitutionId('Colégio Estadual Dom Pedro II'),
      endereco: 'Travessa da Paz, 202',
      telefone: '(51) 95555-5555',
      usuario: 'anasprof',
      unidade_ensino: 'Unidade Norte'
    },
    {
      name: 'Pedro Santos',
      email: 'pedro.s@edu.com',
      password: defaultPassword,
      role_id: getRoleId('Aluno'),
      institution_id: getInstitutionId('Colégio Estadual Dom Pedro II'),
      endereco: 'Rua da Esperança, 303',
      telefone: '(61) 94444-4444',
      usuario: 'pedros',
      unidade_ensino: 'Unidade Norte'
    },
    {
      name: 'Carlos Moreira',
      email: 'carlos.m@edu.com',
      password: defaultPassword,
      role_id: getRoleId('Aluno'),
      institution_id: getInstitutionId('Escola Municipal São José'),
      endereco: 'Avenida Central, 404',
      telefone: '(71) 93333-3333',
      usuario: 'carlosm',
      unidade_ensino: 'Unidade Centro'
    },
    {
      name: 'Lucia Ferreira',
      email: 'lucia.f@edu.com',
      password: defaultPassword,
      role_id: getRoleId('Professor'),
      institution_id: getInstitutionId('Universidade Federal XYZ'),
      endereco: 'Praça da Liberdade, 505',
      telefone: '(81) 92222-2222',
      usuario: 'luciafprof',
      unidade_ensino: 'Campus Principal'
    },
    {
      name: 'Roberto Alves',
      email: 'roberto.a@edu.com',
      password: defaultPassword,
      role_id: getRoleId('Aluno'),
      institution_id: getInstitutionId('Universidade Federal XYZ'),
      endereco: 'Rua Universitária, 606',
      telefone: '(91) 91111-1111',
      usuario: 'robertoa',
      unidade_ensino: 'Campus Principal'
    }
  ];

  await knex('users').insert(users);
}
