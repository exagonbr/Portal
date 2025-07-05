/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tv_show_target_audience', function(table) {
    table.bigInteger('tv_show_target_audiences_id').unsigned().nullable().references('id').inTable('tv_show').withKeyName('FK9bf1w1xxg6s9dsy513hwn9yv2');
    table.bigInteger('target_audience_id').unsigned().nullable().references('id').inTable('target_audience').withKeyName('FK2klba7xx014rwcorwnewx9vbk');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tv_show_target_audience');
};