/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('languages').del();
  
  // Inserir idiomas
  await knex('languages').insert([
    {
      id: 1,
      name: 'Português',
      code: 'pt-BR',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Inglês',
      code: 'en-US',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'Espanhol',
      code: 'es-ES',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
  
  console.log('✅ Seed languages executado com sucesso - 3 idiomas criados');
}; 