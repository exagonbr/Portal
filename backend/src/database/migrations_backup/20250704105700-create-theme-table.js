/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('theme', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.string('description', 255).notNullable();
    table.boolean('is_active').defaultTo(true);
    table.string('name', 255).notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('theme');
};