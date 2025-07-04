/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('forgot_password').del()
  await knex('forgot_password').insert([
    {id: 1, email: 'user1@test.com'},
    {id: 2, email: 'user2@test.com'},
    {id: 3, email: 'user3@test.com'}
  ]);
};