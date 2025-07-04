/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('education_period').del();
  
  // Inserir dados básicos
  await knex('education_period').insert([
    {
      name: 'Education_period Padrão 1',
      description: 'Registro padrão criado automaticamente',
      is_active: true
    },
    {
      name: 'Education_period Padrão 2',
      description: 'Segundo registro padrão criado automaticamente',
      is_active: true
    }
  ]);
  
  console.log('✅ Seed education_period executado com sucesso');
};