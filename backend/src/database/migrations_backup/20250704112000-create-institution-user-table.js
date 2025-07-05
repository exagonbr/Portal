/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('institution_user', function(table) {
    table.bigInteger('institution_users_id').unsigned().notNullable().references('id').inTable('institution').withKeyName('FK8mduvd4rwrne9anc0oqxo06j');
    table.bigInteger('user_id').unsigned().nullable().references('id').inTable('user').withKeyName('FKj2gxsfjhosvbembb60dqfxv70');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('institution_user');
};