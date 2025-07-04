/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('generic_video_genre').del();
  
  // Inserir dados básicos
  await knex('generic_video_genre').insert([
    {
      name: 'Generic_video_genre Padrão 1',
      description: 'Registro padrão criado automaticamente',
      is_active: true
    },
    {
      name: 'Generic_video_genre Padrão 2',
      description: 'Segundo registro padrão criado automaticamente',
      is_active: true
    }
  ]);
  
  console.log('✅ Seed generic_video_genre executado com sucesso');
};