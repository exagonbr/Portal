/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('user_answer').del();
  
  // Inserir dados básicos
  await knex('user_answer').insert([
    {
      name: 'User_answer Padrão 1',
      description: 'Registro padrão criado automaticamente',
      is_active: true
    },
    {
      name: 'User_answer Padrão 2',
      description: 'Segundo registro padrão criado automaticamente',
      is_active: true
    }
  ]);
  
  console.log('✅ Seed user_answer executado com sucesso');
};