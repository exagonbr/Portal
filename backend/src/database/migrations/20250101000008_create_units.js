'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  await knex.schema.createTable('units', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.datetime('date_created').nullable();
    table.boolean('deleted').nullable().defaultTo(false);
    table.bigInteger('institution_id').unsigned().notNullable().references('id').inTable('institutions');
    table.datetime('last_updated').nullable();
    table.string('name', 255).notNullable();
    table.string('institution_name', 255).nullable();
    table.string('code', 20).nullable();
    table.string('type', 50).nullable();
    table.string('description', 255).nullable();
    table.string('status', 50).defaultTo('active');
    table.timestamps(true, true);
    
    // Índices
    table.index('institution_id');
    table.index('name');
    table.index('code');
    table.index('type');
    table.index('status');
    table.index('deleted');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('units');
}; 