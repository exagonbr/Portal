import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('users').del();

  // Hash das senhas
  const defaultPassword = await bcrypt.hash('password123', 12);

  // Inserts seed entries
  await knex('users').insert([
    {
      id: 'admin1',
      name: 'ADM',
      email: 'admin@portal.com',
      password: defaultPassword,
      role: 'admin',
      institution: 'inst1',
      endereco: 'Rua Principal, 123',
      telefone: '(11) 99999-9999',
      usuario: 'adminuser',
      unidade_ensino: 'Sede Administrativa',
      is_active: true
    },
    {
      id: '1',
      name: 'Julia Costa',
      email: 'julia.c@edu.com',
      password: defaultPassword,
      role: 'student',
      institution: '1',
      endereco: 'Av. Brasil, 456',
      telefone: '(21) 98888-8888',
      usuario: 'juliac',
      unidade_ensino: 'Unidade Centro',
      is_active: true
    },
    {
      id: '2',
      name: 'Professor Ricardo',
      email: 'ricardo.oliveira@edu.com',
      password: defaultPassword,
      role: 'teacher',
      institution: '1',
      endereco: 'Rua das Palmeiras, 789',
      telefone: '(31) 97777-7777',
      usuario: 'ricardoprof',
      unidade_ensino: 'Unidade Centro',
      is_active: true
    },
    {
      id: 'manager1',
      name: 'Marina Silva',
      email: 'manager@portal.com',
      password: defaultPassword,
      role: 'manager',
      institution: 'inst1',
      endereco: 'Alameda dos Anjos, 101',
      telefone: '(41) 96666-6666',
      usuario: 'usermanager',
      unidade_ensino: 'Sede Operacional',
      is_active: true
    },
    {
      id: '3',
      name: 'Ana Santos',
      email: 'ana.santos@edu.com',
      password: defaultPassword,
      role: 'teacher',
      institution: '2',
      endereco: 'Travessa da Paz, 202',
      telefone: '(51) 95555-5555',
      usuario: 'anasprof',
      unidade_ensino: 'Unidade Norte',
      is_active: true
    },
    {
      id: '4',
      name: 'Pedro Santos',
      email: 'pedro.s@edu.com',
      password: defaultPassword,
      role: 'student',
      institution: '2',
      endereco: 'Rua da Esperança, 303',
      telefone: '(61) 94444-4444',
      usuario: 'pedros',
      unidade_ensino: 'Unidade Norte',
      is_active: true
    },
    {
      id: '5',
      name: 'Carlos Moreira',
      email: 'carlos.m@edu.com',
      password: defaultPassword,
      role: 'student',
      institution: '1',
      endereco: 'Avenida Central, 404',
      telefone: '(71) 93333-3333',
      usuario: 'carlosm',
      unidade_ensino: 'Unidade Centro',
      is_active: true
    },
    {
      id: '6',
      name: 'Lucia Ferreira',
      email: 'lucia.f@edu.com',
      password: defaultPassword,
      role: 'teacher',
      institution: '4',
      endereco: 'Praça da Liberdade, 505',
      telefone: '(81) 92222-2222',
      usuario: 'luciafprof',
      unidade_ensino: 'Campus Principal',
      is_active: true
    },
    {
      id: '7',
      name: 'Roberto Alves',
      email: 'roberto.a@edu.com',
      password: defaultPassword,
      role: 'student',
      institution: '4',
      endereco: 'Rua Universitária, 606',
      telefone: '(91) 91111-1111',
      usuario: 'robertoa',
      unidade_ensino: 'Campus Principal',
      is_active: true
    }
  ]);
}