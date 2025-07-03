/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('schools', function(table) {
    table.enum('type', ['elementary', 'middle', 'high', 'technical']).nullable();
    table.text('description').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('schools', function(table) {
    table.dropColumn('type');
    table.dropColumn('description');
  });
}; 