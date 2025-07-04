/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('institution_tv_show').del();
  
  // Inserir dados básicos
  await knex('institution_tv_show').insert([
    {
      name: 'Institution_tv_show Padrão 1',
      description: 'Registro padrão criado automaticamente',
      is_active: true
    },
    {
      name: 'Institution_tv_show Padrão 2',
      description: 'Segundo registro padrão criado automaticamente',
      is_active: true
    }
  ]);
  
  console.log('✅ Seed institution_tv_show executado com sucesso');
};