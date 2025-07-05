/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('unit', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.datetime('date_created').nullable();
    table.boolean('deleted').nullable();
    table.bigInteger('institution_id').unsigned().notNullable().references('id').inTable('institution').withKeyName('FK7ia411vcl250lp5w8nn60oap6');
    table.datetime('last_updated').nullable();
    table.string('name', 255).notNullable();
    table.string('institution_name', 255).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('unit');
};