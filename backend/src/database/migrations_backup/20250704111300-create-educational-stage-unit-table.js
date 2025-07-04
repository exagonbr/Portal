/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('educational_stage_unit', function(table) {
    table.bigInteger('educational_stage_units_id').unsigned().notNullable().references('id').inTable('educational_stage').withKeyName('FKqugrb3x2j2qb4u26dilg7ob64');
    table.bigInteger('unit_id').unsigned().nullable().references('id').inTable('unit').withKeyName('FK7111f3v6xtprheq8v4b6bcguo');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('educational_stage_unit');
};