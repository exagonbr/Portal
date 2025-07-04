/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('genre', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.integer('api_id').notNullable();
    table.string('name', 255).notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('genre');
};