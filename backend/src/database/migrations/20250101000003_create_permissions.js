'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  await knex.schema.createTable('permissions', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable().unique();
    table.string('resource', 255).notNullable();
    table.string('action', 255).notNullable();
    table.string('description', 255).nullable();
    table.timestamps(true, true);
    
    // Índices
    table.index('name');
    table.index('resource');
    table.index('action');
    table.index(['resource', 'action']);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('permissions');
}; 