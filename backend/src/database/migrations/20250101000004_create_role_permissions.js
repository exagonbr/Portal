'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  await knex.schema.createTable('role_permissions', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('role_id').unsigned().notNullable().references('id').inTable('roles').onDelete('CASCADE');
    table.bigInteger('permission_id').unsigned().notNullable().references('id').inTable('permissions').onDelete('CASCADE');
    table.unique(['role_id', 'permission_id']);
    table.timestamps(true, true);
    
    // Índices
    table.index('role_id');
    table.index('permission_id');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('role_permissions');
}; 