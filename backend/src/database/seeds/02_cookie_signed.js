/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('cookie_signed').del()
  await knex('cookie_signed').insert([
    {id: 1, cookie: 'cookie-de-teste-1'},
    {id: 2, cookie: 'cookie-de-teste-2'},
    {id: 3, cookie: 'cookie-de-teste-3'}
  ]);
};