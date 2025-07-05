/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('target_audiences').del();
  
  // Inserir públicos-alvo educacionais
  await knex('target_audiences').insert([
    {
      id: 1,
      name: 'Ensino Fundamental',
      description: 'Estudantes do 1º ao 9º ano do ensino fundamental',
      min_age: 6,
      max_age: 14,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Ensino Médio',
      description: 'Estudantes do 1º ao 3º ano do ensino médio',
      min_age: 15,
      max_age: 17,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'Jovens e Adultos',
      description: 'Educação para jovens e adultos (EJA)',
      min_age: 18,
      max_age: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'Professores',
      description: 'Conteúdo destinado a professores e educadores',
      min_age: 18,
      max_age: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
  
  console.log('✅ Seed target_audiences executado com sucesso - 4 públicos-alvo criados');
}; 