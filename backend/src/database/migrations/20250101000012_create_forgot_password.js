'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  await knex.schema.createTable('forgot_password', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.string('email', 255).nullable();
    table.string('token', 255).nullable();
    table.timestamp('expires_at').nullable();
    table.boolean('used').defaultTo(false);
    table.timestamps(true, true);
    
    // Índices
    table.index('email');
    table.index('token');
    table.index('expires_at');
    table.index('used');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('forgot_password');
}; 