/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('profile').del();
  
  // Inserir dados básicos
  await knex('profile').insert([
    {
      name: 'Profile Padrão 1',
      description: 'Registro padrão criado automaticamente',
      is_active: true
    },
    {
      name: 'Profile Padrão 2',
      description: 'Segundo registro padrão criado automaticamente',
      is_active: true
    }
  ]);
  
  console.log('✅ Seed profile executado com sucesso');
};