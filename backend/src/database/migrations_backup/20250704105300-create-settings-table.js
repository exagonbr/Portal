/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('settings', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.string('default_value', 255).nullable();
    table.text('description').nullable();
    table.string('name', 255).nullable();
    table.boolean('required').nullable();
    table.string('settings_key', 255).notNullable();
    table.string('settings_type', 255).nullable();
    table.boolean('validation_required').nullable();
    table.string('value', 255).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('settings');
};