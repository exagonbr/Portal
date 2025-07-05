/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('video_education_period', function(table) {
    table.bigInteger('video_periods_id').unsigned().notNullable().references('id').inTable('video').withKeyName('FKtf6qhleqjiokvs7ayyoa6d6ko');
    table.bigInteger('education_period_id').unsigned().nullable().references('id').inTable('education_period').withKeyName('FK6pukxmmg55a7stabang88i500');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('video_education_period');
};