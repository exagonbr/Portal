/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('answer').del();
  
  // Inserir dados básicos
  await knex('answer').insert([
    {
      name: 'Answer Padrão 1',
      description: 'Registro padrão criado automaticamente',
      is_active: true
    },
    {
      name: 'Answer Padrão 2',
      description: 'Segundo registro padrão criado automaticamente',
      is_active: true
    }
  ]);
  
  console.log('✅ Seed answer executado com sucesso');
};