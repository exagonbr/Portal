/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('education_periods').del()
  await knex('education_periods').insert([
    {id: 1, name: 'Manhã', year: 2025, start_date: new Date('2025-01-01'), end_date: new Date('2025-12-31'), institution_id: 1, is_active: true},
    {id: 2, name: 'Tarde', year: 2025, start_date: new Date('2025-01-01'), end_date: new Date('2025-12-31'), institution_id: 1, is_active: true},
    {id: 3, name: 'Noite', year: 2025, start_date: new Date('2025-01-01'), end_date: new Date('2025-12-31'), institution_id: 1, is_active: true}
  ]);
};