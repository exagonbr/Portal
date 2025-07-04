/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('profile', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.string('avatar_color', 255).nullable();
    table.boolean('is_child').nullable();
    table.boolean('is_deleted').nullable();
    table.string('profile_language', 255).nullable();
    table.string('profile_name', 255).nullable();
    table.bigInteger('user_id').unsigned().nullable().references('id').inTable('user').withKeyName('FKawh070wpue34wqvytjqr4hj5e');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('profile');
};