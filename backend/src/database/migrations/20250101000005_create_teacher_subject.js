'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  await knex.schema.createTable('teacher_subject', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).nullable();
    table.string('code', 20).nullable();
    table.string('description', 255).nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Índices
    table.index('name');
    table.index('code');
    table.index('is_active');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('teacher_subject');
}; 