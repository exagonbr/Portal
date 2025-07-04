/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('public_content').del()
  await knex('public_content').insert([
    {
      id: 1,
      title: 'Bem-vindo ao Portal Educacional',
      content: 'Conteúdo de boas-vindas para novos usuários do portal educacional.',
      content_type: 'page',
      slug: 'bem-vindo',
      featured_image: '/images/welcome.jpg',
      author_id: 1,
      is_published: true,
      published_at: new Date(),
      view_count: 0,
      metadata: JSON.stringify({ keywords: ['educação', 'portal', 'bem-vindo'] }),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      title: 'Sobre o Portal',
      content: 'Informações sobre o portal educacional e seus recursos.',
      content_type: 'page',
      slug: 'sobre',
      featured_image: '/images/about.jpg',
      author_id: 1,
      is_published: true,
      published_at: new Date(),
      view_count: 0,
      metadata: JSON.stringify({ keywords: ['sobre', 'informações', 'portal'] }),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      title: 'Novidades do Sistema',
      content: 'Últimas atualizações e melhorias implementadas no portal.',
      content_type: 'announcement',
      slug: 'novidades-sistema',
      featured_image: null,
      author_id: 1,
      is_published: true,
      published_at: new Date(),
      view_count: 0,
      metadata: JSON.stringify({ priority: 'high' }),
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};