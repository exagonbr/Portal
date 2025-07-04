/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('genre_tv_show').del();
  
  // Inserir dados básicos
  await knex('genre_tv_show').insert([
    {
      name: 'Genre_tv_show Padrão 1',
      description: 'Registro padrão criado automaticamente',
      is_active: true
    },
    {
      name: 'Genre_tv_show Padrão 2',
      description: 'Segundo registro padrão criado automaticamente',
      is_active: true
    }
  ]);
  
  console.log('✅ Seed genre_tv_show executado com sucesso');
};