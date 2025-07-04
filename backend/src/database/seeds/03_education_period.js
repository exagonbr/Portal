/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('education_period').del()
  await knex('education_period').insert([
    {id: 1, description: 'Manhã', is_active: true},
    {id: 2, description: 'Tarde', is_active: true},
    {id: 3, description: 'Noite', is_active: true}
  ]);
};