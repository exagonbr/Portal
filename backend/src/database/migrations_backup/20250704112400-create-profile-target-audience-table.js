/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('profile_target_audience', function(table) {
    table.bigInteger('profile_target_audiences_id').unsigned().nullable().references('id').inTable('profile').withKeyName('FKitls9nf888dkg5pij5jjivl8k');
    table.bigInteger('target_audience_id').unsigned().nullable().references('id').inTable('target_audience').withKeyName('FK6wt5d1u8xh4f2lavlyvro29x4');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('profile_target_audience');
};