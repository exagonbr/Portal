/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('genres').del()
  await knex('genres').insert([
    {
      id: 1,
      name: 'Educacional',
      description: 'Conteúdo educativo e didático',
      slug: 'educacional',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Literatura',
      description: 'Obras literárias e ficção',
      slug: 'literatura',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'Ciências',
      description: 'Conteúdo científico e pesquisa',
      slug: 'ciencias',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'História',
      description: 'Conteúdo histórico e documentários',
      slug: 'historia',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: 'Infantil',
      description: 'Conteúdo para crianças',
      slug: 'infantil',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      name: 'Documentário',
      description: 'Documentários educativos',
      slug: 'documentario',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};