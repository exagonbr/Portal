/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('video_educational_stage', function(table) {
    table.bigInteger('video_stages_id').unsigned().notNullable().references('id').inTable('video').withKeyName('FKab18bv5ki0wpy7oxpbbjwfk2c');
    table.bigInteger('educational_stage_id').unsigned().nullable().references('id').inTable('educational_stage').withKeyName('FKodr2ah2qlutj6ftnuu57ykuf0');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('video_educational_stage');
};