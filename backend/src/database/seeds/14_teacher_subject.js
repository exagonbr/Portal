/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('teacher_subject').del()
  await knex('teacher_subject').insert([
    {id: 1, name: 'Matemática'},
    {id: 2, name: 'Português'},
    {id: 3, name: 'História'}
  ]);
};