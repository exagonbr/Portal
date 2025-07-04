/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('public_tv_show').del();
  
  // Inserir dados básicos
  await knex('public_tv_show').insert([
    {
      name: 'Public_tv_show Padrão 1',
      description: 'Registro padrão criado automaticamente',
      is_active: true
    },
    {
      name: 'Public_tv_show Padrão 2',
      description: 'Segundo registro padrão criado automaticamente',
      is_active: true
    }
  ]);
  
  console.log('✅ Seed public_tv_show executado com sucesso');
};