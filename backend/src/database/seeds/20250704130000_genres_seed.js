/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('genres').del();
  
  // Inserir gêneros educacionais
  await knex('genres').insert([
    {
      id: 1,
      name: 'Matemática',
      description: 'Conteúdos relacionados a matemática e cálculos',
      slug: 'matematica',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Ciências',
      description: 'Física, Química, Biologia e Ciências Naturais',
      slug: 'ciencias',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'História',
      description: 'História do Brasil e História Geral',
      slug: 'historia',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'Língua Portuguesa',
      description: 'Gramática, Literatura e Redação',
      slug: 'lingua-portuguesa',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: 'Arte e Cultura',
      description: 'Artes, Música, Teatro e Cultura Brasileira',
      slug: 'arte-cultura',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      name: 'Educação Financeira',
      description: 'Finanças Pessoais e Educação Econômica',
      slug: 'educacao-financeira',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 7,
      name: 'Tecnologia',
      description: 'Programação, Informática e Tecnologia',
      slug: 'tecnologia',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 8,
      name: 'Filosofia',
      description: 'Filosofia e Pensamento Crítico',
      slug: 'filosofia',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
  
  console.log('✅ Seed genres executado com sucesso - 8 gêneros criados');
}; 