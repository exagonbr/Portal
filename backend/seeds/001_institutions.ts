import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('institutions').del();

  // Inserts seed entries
  await knex('institutions').insert([
    {
      id: '1',
      name: 'Escola Municipal São José',
      type: 'SCHOOL',
      characteristics: JSON.stringify([
        'Ensino fundamental completo',
        'Laboratório de matemática',
        'Professores especializados'
      ]),
      address: 'Rua das Escolas, 123',
      phone: '(11) 3333-4444',
      email: 'contato@escolasaojose.edu.br'
    },
    {
      id: '2',
      name: 'Colégio Estadual Dom Pedro II',
      type: 'COLLEGE',
      characteristics: JSON.stringify([
        'Foco em humanidades',
        'Biblioteca especializada'
      ]),
      address: 'Av. Dom Pedro II, 456',
      phone: '(21) 2222-3333',
      email: 'secretaria@dompedro.edu.br'
    },
    {
      id: '3',
      name: 'Centro de Treinamento TechDev',
      type: 'TECH_CENTER',
      characteristics: JSON.stringify([
        'Laboratórios equipados',
        'Instrutores experientes'
      ]),
      address: 'Rua da Tecnologia, 789',
      phone: '(31) 4444-5555',
      email: 'info@techdev.com.br'
    },
    {
      id: '4',
      name: 'Universidade Federal XYZ',
      type: 'UNIVERSITY',
      characteristics: JSON.stringify([
        'Convênios internacionais',
        'Professores nativos'
      ]),
      address: 'Campus Universitário, s/n',
      phone: '(41) 5555-6666',
      email: 'reitoria@ufxyz.edu.br'
    },
    {
      id: '5',
      name: 'Escola de Negócios Inova',
      type: 'TECH_CENTER',
      characteristics: JSON.stringify([
        'Cases reais',
        'Networking com profissionais da área'
      ]),
      address: 'Av. dos Negócios, 101',
      phone: '(51) 6666-7777',
      email: 'contato@inova.edu.br'
    },
    {
      id: 'inst1',
      name: 'Portal Corp',
      type: 'TECH_CENTER',
      characteristics: JSON.stringify([
        'Tecnologia educacional',
        'Plataforma digital',
        'Suporte 24/7'
      ]),
      address: 'Rua Portal, 100',
      phone: '(11) 9999-0000',
      email: 'contato@portalcorp.com.br'
    }
  ]);
}