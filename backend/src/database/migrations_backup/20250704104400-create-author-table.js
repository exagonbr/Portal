/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('author', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.text('description').notNullable();
    table.string('email', 255).nullable();
    table.boolean('is_active').defaultTo(true);
    table.string('name', 255).notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('author');
};