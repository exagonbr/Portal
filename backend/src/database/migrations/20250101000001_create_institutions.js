'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  await knex.schema.createTable('institutions', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.string('accountable_contact', 255).notNullable();
    table.string('accountable_name', 255).notNullable();
    table.string('company_name', 255).notNullable();
    table.string('complement', 255).nullable();
    table.boolean('contract_disabled').notNullable().defaultTo(false);
    table.string('contract_invoice_num', 255).nullable();
    table.bigInteger('contract_num').nullable();
    table.datetime('contract_term_end').notNullable();
    table.datetime('contract_term_start').notNullable();
    table.datetime('date_created').nullable();
    table.boolean('deleted').notNullable().defaultTo(false);
    table.string('district', 255).notNullable();
    table.string('document', 255).notNullable();
    table.datetime('invoice_date').nullable();
    table.datetime('last_updated').nullable();
    table.string('name', 255).notNullable();
    table.string('postal_code', 255).notNullable();
    table.string('state', 255).notNullable();
    table.string('street', 255).notNullable();
    table.bigInteger('score').nullable();
    table.boolean('has_library_platform').notNullable().defaultTo(false);
    table.boolean('has_principal_platform').notNullable().defaultTo(false);
    table.boolean('has_student_platform').notNullable().defaultTo(false);
    table.string('type', 50).nullable();
    table.string('status', 50).defaultTo('active');
    table.timestamps(true, true);
    
    // Índices
    table.index('name');
    table.index('document');
    table.index('status');
    table.index('deleted');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('institutions');
}; 