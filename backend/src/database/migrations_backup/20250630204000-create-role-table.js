/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('role', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.string('authority', 255).nullable().unique('UK_irsamgnera6angm0prq1kemt2');
    table.string('display_name', 255).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('role');
};