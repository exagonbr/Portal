/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('cookie_signed').del()
  await knex('cookie_signed').insert([
    {id: 1, cookie_value: 'cookie-de-teste-1', user_id: 1, created_at: new Date(), expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)},
    {id: 2, cookie_value: 'cookie-de-teste-2', user_id: 1, created_at: new Date(), expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)},
    {id: 3, cookie_value: 'cookie-de-teste-3', user_id: 1, created_at: new Date(), expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)}
  ]);
};