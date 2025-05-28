import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('collection_modules').del();
  await knex('content_collections').del();

  // Get user IDs
  const users = await knex('users').select('id', 'email');
  const getUserId = (email: string) => users.find(u => u.email === email)?.id;

  // Insert content collections
  const collections = [
    {
      name: 'Matemática Fundamental',
      synopsis: 'Uma coleção abrangente de conteúdo matemático para o ensino fundamental.',
      cover_image: 'https://example.com/images/math-collection.jpg',
      support_material: 'https://example.com/materials/math-support.pdf',
      total_duration: 1200, // 20 hours in minutes
      subject: 'Matemática',
      tags: ['matemática', 'ensino fundamental', 'álgebra', 'geometria'],
      created_by: getUserId('ricardo.oliveira@edu.com')
    },
    {
      name: 'História do Brasil',
      synopsis: 'Explore a rica história do Brasil desde o período colonial até os dias atuais.',
      cover_image: 'https://example.com/images/history-collection.jpg',
      support_material: 'https://example.com/materials/history-support.pdf',
      total_duration: 900, // 15 hours in minutes
      subject: 'História',
      tags: ['história', 'brasil', 'colônia', 'império', 'república'],
      created_by: getUserId('ana.santos@edu.com')
    },
    {
      name: 'Programação Básica',
      synopsis: 'Introdução à programação com foco em lógica e algoritmos.',
      cover_image: 'https://example.com/images/programming-collection.jpg',
      support_material: 'https://example.com/materials/programming-support.pdf',
      total_duration: 1800, // 30 hours in minutes
      subject: 'Computação',
      tags: ['programação', 'algoritmos', 'lógica', 'python'],
      created_by: getUserId('lucia.f@edu.com')
    }
  ].filter(collection => collection.created_by);

  const insertedCollections = await knex('content_collections').insert(collections).returning('*');

  // Create collection lookup
  const collectionLookup = insertedCollections.reduce((acc, collection) => {
    acc[collection.name] = collection.id;
    return acc;
  }, {} as Record<string, string>);

  // Get video IDs
  const videos = await knex('videos').select('id', 'title');
  const getVideoIds = (titles: string[]) => 
    titles.map(title => videos.find(v => v.title === title)?.id).filter(Boolean);

  // Insert collection modules
  const modules = [
    {
      collection_id: collectionLookup['Matemática Fundamental'],
      name: 'Introdução à Álgebra',
      description: 'Conceitos básicos de álgebra e operações matemáticas.',
      cover_image: 'https://example.com/images/algebra-module.jpg',
      video_ids: getVideoIds([
        'Matemática: Cálculo Diferencial - Aula 1',
        'Matemática: Geometria Plana - Aula 2'
      ]),
      order: 1
    },
    {
      collection_id: collectionLookup['Matemática Fundamental'],
      name: 'Geometria Básica',
      description: 'Fundamentos de geometria plana e espacial.',
      cover_image: 'https://example.com/images/geometry-module.jpg',
      video_ids: getVideoIds([
        'Matemática: Geometria Plana - Aula 2'
      ]),
      order: 2
    },
    {
      collection_id: collectionLookup['História do Brasil'],
      name: 'Brasil Colônia',
      description: 'O período colonial brasileiro e suas características.',
      cover_image: 'https://example.com/images/colonial-module.jpg',
      video_ids: getVideoIds([
        'História: Período Colonial - Aula 1',
        'História: Economia Colonial - Aula 2'
      ]),
      order: 1
    },
    {
      collection_id: collectionLookup['Programação Básica'],
      name: 'Lógica de Programação',
      description: 'Introdução à lógica de programação e algoritmos.',
      cover_image: 'https://example.com/images/logic-module.jpg',
      video_ids: getVideoIds([
        'Programação: Introdução ao Python - Aula 1',
        'Programação: Estruturas de Dados - Aula 2'
      ]),
      order: 1
    }
  ].filter(module => module.collection_id);

  await knex('collection_modules').insert(modules);
}
