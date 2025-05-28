import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data (disable foreign key checks for truncation)
  await knex.raw('SET session_replication_role = replica');

  await knex('course_students').del()
  await knex('course_teachers').del()
  await knex('courses').del()

  await knex.raw('SET session_replication_role = DEFAULT'); 


  // Get institution IDs
  const institutions = await knex('institutions').select('id', 'name');
  const getInstitutionId = (name: string) => institutions.find(i => i.name === name)?.id;

  // Insert extended courses (without explicit IDs)
  const courses = [
    {
      name: 'Matemática Avançada',
      description: 'Curso de matemática avançada para ensino médio',
      level: 'BASIC',
      cycle: 'Anos Finais',
      stage: '9º ano',
      institution_id: getInstitutionId('Escola Municipal São José'),
      duration: '1 ano letivo',
      schedule: JSON.stringify({
        startDate: '2024-02-01',
        endDate: '2024-12-15',
        classDays: ['Segunda', 'Quarta', 'Sexta'],
        classTime: '14:00 - 15:30'
      })
    },
    {
      name: 'História do Brasil Colônia',
      description: 'Curso sobre o período colonial brasileiro.',
      level: 'BASIC',
      cycle: 'Ensino Médio',
      stage: '1º ano',
      institution_id: getInstitutionId('Colégio Estadual Dom Pedro II'),
      duration: '6 meses',
      schedule: JSON.stringify({
        startDate: '2024-03-01',
        endDate: '2024-08-30',
        classDays: ['Terça', 'Quinta'],
        classTime: '09:00 - 10:30'
      })
    },
    {
      name: 'Introdução à Programação com Python',
      description: 'Curso introdutório de programação utilizando a linguagem Python.',
      level: 'PROFESSIONAL',
      cycle: 'Profissionalizante',
      stage: 'N/A',
      institution_id: getInstitutionId('Centro de Treinamento TechDev'),
      duration: '3 meses',
      schedule: JSON.stringify({
        startDate: '2024-01-15',
        endDate: '2024-04-15',
        classDays: ['Segunda', 'Quarta'],
        classTime: '19:00 - 21:00'
      })
    },
    {
      name: 'Inglês Instrumental',
      description: 'Curso de inglês focado em leitura e interpretação de textos técnicos.',
      level: 'SUPERIOR',
      cycle: 'Superior',
      stage: 'N/A',
      institution_id: getInstitutionId('Universidade Federal XYZ'),
      duration: '1 semestre',
      schedule: JSON.stringify({
        startDate: '2024-02-10',
        endDate: '2024-06-30',
        classDays: ['Sexta'],
        classTime: '10:00 - 12:00'
      })
    },
    {
      name: 'Gestão de Projetos Ágeis',
      description: 'Curso sobre metodologias ágeis para gerenciamento de projetos.',
      level: 'PROFESSIONAL',
      cycle: 'Profissionalizante',
      stage: 'N/A',
      institution_id: getInstitutionId('Escola de Negócios Inova'),
      duration: '2 meses',
      schedule: JSON.stringify({
        startDate: '2024-05-01',
        endDate: '2024-06-30',
        classDays: ['Terça', 'Quinta'],
        classTime: '18:30 - 20:30'
      })
    }
  ];

  const insertedCourses = await knex('courses').insert(courses).returning('*');

  // Get users for relationships
  const users = await knex('users').select('id', 'name', 'email');
  const getUserId = (email: string) => users.find(u => u.email === email)?.id;

  // Create course lookup by name
  const courseLookup = insertedCourses.reduce((acc, course) => {
    acc[course.name] = course.id;
    return acc;
  }, {} as Record<string, string>);

  // Insert course-teacher relationships
  const courseTeachers = [
    { course_id: courseLookup['Matemática Avançada'], user_id: getUserId('ricardo.oliveira@edu.com') },
    { course_id: courseLookup['História do Brasil Colônia'], user_id: getUserId('ana.santos@edu.com') },
    { course_id: courseLookup['Introdução à Programação com Python'], user_id: getUserId('lucia.f@edu.com') },
    { course_id: courseLookup['Inglês Instrumental'], user_id: getUserId('lucia.f@edu.com') },
    { course_id: courseLookup['Gestão de Projetos Ágeis'], user_id: getUserId('ana.santos@edu.com') }
  ].filter(ct => ct.course_id && ct.user_id);

  if (courseTeachers.length > 0) {
    await knex('course_teachers').insert(courseTeachers);
  }

  // Insert course-student relationships
  const courseStudents = [
    { 
      course_id: courseLookup['Matemática Avançada'], 
      user_id: getUserId('julia.c@edu.com'), 
      progress: 85.0,
      grades: JSON.stringify({
        assignments: 90,
        tests: 85,
        participation: 95
      })
    },
    { 
      course_id: courseLookup['História do Brasil Colônia'], 
      user_id: getUserId('pedro.s@edu.com'), 
      progress: 78.0,
      grades: JSON.stringify({
        assignments: 75,
        tests: 80,
        participation: 85
      })
    },
    { 
      course_id: courseLookup['Introdução à Programação com Python'], 
      user_id: getUserId('carlos.m@edu.com'), 
      progress: 70.0,
      grades: JSON.stringify({
        assignments: 70,
        tests: 75,
        participation: 80
      })
    },
    { 
      course_id: courseLookup['Inglês Instrumental'], 
      user_id: getUserId('roberto.a@edu.com'), 
      progress: 90.0,
      grades: JSON.stringify({
        assignments: 95,
        tests: 88,
        participation: 92
      })
    },
    { 
      course_id: courseLookup['Gestão de Projetos Ágeis'], 
      user_id: getUserId('roberto.a@edu.com'), 
      progress: 88.0,
      grades: JSON.stringify({
        assignments: 90,
        tests: 85,
        participation: 90
      })
    }
  ].filter(cs => cs.course_id && cs.user_id);

  if (courseStudents.length > 0) {
    await knex('course_students').insert(courseStudents);
  }
}
