import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('courses').del();

  // Inserts seed entries
  await knex('courses').insert([
    {
      id: '1',
      name: 'Matemática Avançada',
      description: 'Curso de matemática avançada para ensino médio',
      level: 'BASIC',
      cycle: 'Anos Finais',
      stage: '9º ano',
      institution_id: '1',
      duration: '1 ano letivo',
      schedule: JSON.stringify({
        startDate: '2024-02-01',
        endDate: '2024-12-15',
        classDays: ['Segunda', 'Quarta', 'Sexta'],
        classTime: '14:00 - 15:30'
      }),
      teachers: JSON.stringify(['t1']),
      students: JSON.stringify(['s1', 's2']),
      is_active: true
    },
    {
      id: '2',
      name: 'História do Brasil Colônia',
      description: 'Curso sobre o período colonial brasileiro.',
      level: 'BASIC',
      cycle: 'Ensino Médio',
      stage: '1º ano',
      institution_id: '2',
      duration: '6 meses',
      schedule: JSON.stringify({
        startDate: '2024-03-01',
        endDate: '2024-08-30',
        classDays: ['Terça', 'Quinta'],
        classTime: '09:00 - 10:30'
      }),
      teachers: JSON.stringify(['t2']),
      students: JSON.stringify(['s2']),
      is_active: true
    },
    {
      id: '3',
      name: 'Introdução à Programação com Python',
      description: 'Curso introdutório de programação utilizando a linguagem Python.',
      level: 'PROFESSIONAL',
      cycle: 'Profissionalizante',
      stage: 'N/A',
      institution_id: '3',
      duration: '3 meses',
      schedule: JSON.stringify({
        startDate: '2024-01-15',
        endDate: '2024-04-15',
        classDays: ['Segunda', 'Quarta'],
        classTime: '19:00 - 21:00'
      }),
      teachers: JSON.stringify(['t1', 't2']),
      students: JSON.stringify(['s1']),
      is_active: true
    },
    {
      id: '4',
      name: 'Inglês Instrumental',
      description: 'Curso de inglês focado em leitura e interpretação de textos técnicos.',
      level: 'SUPERIOR',
      cycle: 'Superior',
      stage: 'N/A',
      institution_id: '4',
      duration: '1 semestre',
      schedule: JSON.stringify({
        startDate: '2024-02-10',
        endDate: '2024-06-30',
        classDays: ['Sexta'],
        classTime: '10:00 - 12:00'
      }),
      teachers: JSON.stringify(['t2']),
      students: JSON.stringify(['s1', 's2']),
      is_active: true
    },
    {
      id: '5',
      name: 'Gestão de Projetos Ágeis',
      description: 'Curso sobre metodologias ágeis para gerenciamento de projetos.',
      level: 'PROFESSIONAL',
      cycle: 'Profissionalizante',
      stage: 'N/A',
      institution_id: '5',
      duration: '2 meses',
      schedule: JSON.stringify({
        startDate: '2024-05-01',
        endDate: '2024-06-30',
        classDays: ['Terça', 'Quinta'],
        classTime: '18:30 - 20:30'
      }),
      teachers: JSON.stringify(['t1']),
      students: JSON.stringify(['s1']),
      is_active: true
    }
  ]);
}