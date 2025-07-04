/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_role', function(table) {
    table.bigInteger('role_id').unsigned().notNullable().references('id').inTable('role').withKeyName('FKa68196081fvovjhkek5m97n3y');
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('user').withKeyName('FK859n2jvi8ivhui0rl0esws6o');
    table.primary(['role_id', 'user_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('user_role');
};