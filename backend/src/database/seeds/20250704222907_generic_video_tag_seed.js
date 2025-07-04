/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('generic_video_tag').del();
  
  // Inserir dados básicos
  await knex('generic_video_tag').insert([
    {
      name: 'Generic_video_tag Padrão 1',
      description: 'Registro padrão criado automaticamente',
      is_active: true
    },
    {
      name: 'Generic_video_tag Padrão 2',
      description: 'Segundo registro padrão criado automaticamente',
      is_active: true
    }
  ]);
  
  console.log('✅ Seed generic_video_tag executado com sucesso');
};