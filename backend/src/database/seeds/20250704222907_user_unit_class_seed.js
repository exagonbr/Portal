/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('user_unit_class').del();
  
  // Inserir dados básicos
  await knex('user_unit_class').insert([
    {
      name: 'User_unit_class Padrão 1',
      description: 'Registro padrão criado automaticamente',
      is_active: true
    },
    {
      name: 'User_unit_class Padrão 2',
      description: 'Segundo registro padrão criado automaticamente',
      is_active: true
    }
  ]);
  
  console.log('✅ Seed user_unit_class executado com sucesso');
};