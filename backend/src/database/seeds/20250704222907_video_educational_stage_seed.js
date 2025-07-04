/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('video_educational_stage').del();
  
  // Inserir dados básicos
  await knex('video_educational_stage').insert([
    {
      name: 'Video_educational_stage Padrão 1',
      description: 'Registro padrão criado automaticamente',
      is_active: true
    },
    {
      name: 'Video_educational_stage Padrão 2',
      description: 'Segundo registro padrão criado automaticamente',
      is_active: true
    }
  ]);
  
  console.log('✅ Seed video_educational_stage executado com sucesso');
};