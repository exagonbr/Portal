/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('watchlist_entry').del();
  
  // Inserir dados básicos
  await knex('watchlist_entry').insert([
    {
      name: 'Watchlist_entry Padrão 1',
      description: 'Registro padrão criado automaticamente',
      is_active: true
    },
    {
      name: 'Watchlist_entry Padrão 2',
      description: 'Segundo registro padrão criado automaticamente',
      is_active: true
    }
  ]);
  
  console.log('✅ Seed watchlist_entry executado com sucesso');
};