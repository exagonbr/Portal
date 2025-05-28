import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('quiz_attempts').del();
  await knex('questions').del();
  await knex('quizzes').del();
  await knex('lessons').del();
  await knex('modules').del();

  // Get course IDs
  const courses = await knex('courses').select('id', 'name');
  const getCourseId = (name: string) => courses.find(c => c.name === name)?.id;

  // Insert modules
  const modules = [
    {
      name: 'Introdução à Matemática',
      description: 'Conceitos fundamentais de matemática',
      order: 1,
      course_id: getCourseId('Matemática Avançada'),
      xp_reward: 100,
      is_completed: false,
      prerequisites: null
    },
    {
      name: 'Álgebra Básica',
      description: 'Introdução aos conceitos algébricos',
      order: 2,
      course_id: getCourseId('Matemática Avançada'),
      xp_reward: 150,
      is_completed: false,
      prerequisites: ['mod1']
    }
  ].filter(module => module.course_id);

  const insertedModules = await knex('modules').insert(modules).returning('*');

  // Create module lookup
  const moduleLookup = insertedModules.reduce((acc, module) => {
    acc[module.name] = module.id;
    return acc;
  }, {} as Record<string, string>);

  // Insert lessons
  const lessons = [
    {
      title: 'Números Naturais',
      content: 'Conteúdo sobre números naturais...',
      type: 'video',
      duration: '15 min',
      xp_reward: 25,
      is_completed: false,
      video_url: 'https://example.com/video1',
      order: 1,
      module_id: moduleLookup['Introdução à Matemática']
    },
    {
      title: 'Operações Básicas',
      content: 'Conteúdo sobre operações básicas...',
      type: 'reading',
      duration: '20 min',
      xp_reward: 30,
      is_completed: false,
      order: 2,
      module_id: moduleLookup['Introdução à Matemática']
    },
    {
      title: 'Quiz: Números Naturais',
      content: 'Quiz sobre números naturais',
      type: 'quiz',
      duration: '10 min',
      xp_reward: 45,
      is_completed: false,
      requirements: JSON.stringify([
        {
          type: 'lesson',
          lessonId: 'lesson1',
          description: 'Completar Números Naturais'
        }
      ]),
      order: 3,
      module_id: moduleLookup['Introdução à Matemática']
    },
    {
      title: 'Variáveis e Expressões',
      content: 'Conteúdo sobre variáveis e expressões...',
      type: 'video',
      duration: '25 min',
      xp_reward: 35,
      is_completed: false,
      video_url: 'https://example.com/video2',
      order: 1,
      module_id: moduleLookup['Álgebra Básica']
    },
    {
      title: 'Equações Lineares',
      content: 'Conteúdo sobre equações lineares...',
      type: 'reading',
      duration: '30 min',
      xp_reward: 40,
      is_completed: false,
      order: 2,
      module_id: moduleLookup['Álgebra Básica']
    }
  ].filter(lesson => lesson.module_id);

  const insertedLessons = await knex('lessons').insert(lessons).returning('*');

  // Insert quiz
  const quiz = {
    title: 'Avaliação: Números Naturais',
    description: 'Teste seus conhecimentos sobre números naturais e suas propriedades',
    time_limit: 30,
    passing_score: 70,
    attempts: 2,
    is_graded: true,
    course_id: getCourseId('Matemática Avançada'),
    module_id: moduleLookup['Introdução à Matemática']
  };

  const [insertedQuiz] = await knex('quizzes').insert(quiz).returning('*');

  // Insert questions
  const questions = [
    {
      quiz_id: insertedQuiz.id,
      type: 'multiple-choice',
      text: 'Qual dos seguintes números NÃO é um número natural?',
      options: ['0', '-1', '1', '2'],
      correct_answer: ['-1'],
      points: 2,
      explanation: 'Números naturais são inteiros não negativos (0, 1, 2, 3, ...)',
      order: 1
    },
    {
      quiz_id: insertedQuiz.id,
      type: 'true-false',
      text: 'Todo número natural tem um sucessor.',
      options: ['Verdadeiro', 'Falso'],
      correct_answer: ['Verdadeiro'],
      points: 1,
      explanation: 'Para qualquer número natural n, seu sucessor é n + 1',
      order: 2
    },
    {
      quiz_id: insertedQuiz.id,
      type: 'multiple-choice',
      text: 'Quais das seguintes propriedades se aplicam à adição de números naturais?',
      options: [
        'Comutativa e Associativa',
        'Apenas Comutativa',
        'Apenas Associativa',
        'Nenhuma das anteriores'
      ],
      correct_answer: ['Comutativa e Associativa'],
      points: 2,
      explanation: 'A adição de números naturais é tanto comutativa (a + b = b + a) quanto associativa ((a + b) + c = a + (b + c))',
      order: 3
    },
    {
      quiz_id: insertedQuiz.id,
      type: 'short-answer',
      text: 'Qual é o menor número natural?',
      correct_answer: ['0', 'zero'],
      points: 1,
      explanation: 'O conjunto dos números naturais começa em zero',
      order: 4
    }
  ];

  await knex('questions').insert(questions);
}
