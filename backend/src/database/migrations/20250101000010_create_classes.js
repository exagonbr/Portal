'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  await knex.schema.createTable('classes', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable();
    table.string('code', 20).notNullable();
    table.string('description', 255).nullable();
    table.integer('year').notNullable();
    table.integer('semester').notNullable();
    table.integer('max_students').notNullable();
    table.integer('current_students').defaultTo(0);
    table.bigInteger('unit_id').unsigned().notNullable().references('id').inTable('units');
    table.bigInteger('education_cycle_id').unsigned().notNullable().references('id').inTable('education_cycles');
    table.string('status', 20).defaultTo('active');
    table.timestamps(true, true);
    
    // Índices
    table.index('unit_id');
    table.index('education_cycle_id');
    table.index('code');
    table.index('name');
    table.index('year');
    table.index('semester');
    table.index('status');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('classes');
}; 