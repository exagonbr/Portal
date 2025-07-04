/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('educational_stage_institution').del();
  
  // Inserir dados básicos
  await knex('educational_stage_institution').insert([
    {
      name: 'Educational_stage_institution Padrão 1',
      description: 'Registro padrão criado automaticamente',
      is_active: true
    },
    {
      name: 'Educational_stage_institution Padrão 2',
      description: 'Segundo registro padrão criado automaticamente',
      is_active: true
    }
  ]);
  
  console.log('✅ Seed educational_stage_institution executado com sucesso');
};