/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_unit', function(table) {
    table.bigInteger('unit_id').unsigned().notNullable().references('id').inTable('unit').withKeyName('FKem441hutu0khnaxw8wnh6w8w5');
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('user').withKeyName('FKb4ko38mh5xlaayircjpa8ltpx');
    table.primary(['unit_id', 'user_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('user_unit');
};