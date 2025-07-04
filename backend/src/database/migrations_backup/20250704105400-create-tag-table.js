/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tag', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.datetime('date_created').notNullable();
    table.boolean('deleted').nullable();
    table.datetime('last_updated').notNullable();
    table.string('name', 255).nullable().unique('UK_1wdpsed5kna2y38hnbgrnhi5b');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tag');
};