/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('profile_target_audience').del();
  
  // Inserir dados básicos
  await knex('profile_target_audience').insert([
    {
      name: 'Profile_target_audience Padrão 1',
      description: 'Registro padrão criado automaticamente',
      is_active: true
    },
    {
      name: 'Profile_target_audience Padrão 2',
      description: 'Segundo registro padrão criado automaticamente',
      is_active: true
    }
  ]);
  
  console.log('✅ Seed profile_target_audience executado com sucesso');
};