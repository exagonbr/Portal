/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_unit_class', function(table) {
    table.bigInteger('unit_class_id').unsigned().notNullable().references('id').inTable('unit_class').withKeyName('FKgomwj1cwo3dmckxhsln565g8s');
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('user').withKeyName('FK64kaax6729jw27uvumttqa75e');
    table.primary(['unit_class_id', 'user_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('user_unit_class');
};