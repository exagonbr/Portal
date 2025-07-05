'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  await knex.schema.createTable('user_classes', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.bigInteger('class_id').unsigned().notNullable().references('id').inTable('classes').onDelete('CASCADE');
    table.datetime('enrollment_date').notNullable();
    table.string('status', 20).defaultTo('active');
    table.unique(['user_id', 'class_id']);
    table.timestamps(true, true);
    
    // Índices
    table.index('user_id');
    table.index('class_id');
    table.index('status');
    table.index('enrollment_date');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('user_classes');
}; 