/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('educational_stage_user', function(table) {
    table.bigInteger('educational_stage_users_id').unsigned().notNullable().references('id').inTable('educational_stage').withKeyName('FKf1wu2l40lypnwk04b8711ncib');
    table.bigInteger('user_id').unsigned().nullable().references('id').inTable('user').withKeyName('FK7rks2f72sooxya3mvj33nd446');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('educational_stage_user');
};