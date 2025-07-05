/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('teacher_subject', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.boolean('is_child').nullable();
    table.boolean('is_deleted').nullable();
    table.string('name', 255).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('teacher_subject');
};