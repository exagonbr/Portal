'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  await knex.schema.createTable('education_cycles', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable();
    table.string('code', 10).notNullable();
    table.string('description', 255).nullable();
    table.integer('min_age').nullable();
    table.integer('max_age').nullable();
    table.integer('duration_years').notNullable();
    table.bigInteger('institution_id').unsigned().notNullable().references('id').inTable('institutions');
    table.string('status', 20).defaultTo('active');
    table.timestamps(true, true);
    
    // Índices
    table.index('institution_id');
    table.index('code');
    table.index('name');
    table.index('status');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('education_cycles');
}; 