/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('educational_stage_institution', function(table) {
    table.bigInteger('educational_stage_institions_id').unsigned().notNullable().references('id').inTable('educational_stage').withKeyName('FK7nlvva819vqirt14fq2t315bv');
    table.bigInteger('institution_id').unsigned().nullable().references('id').inTable('institution').withKeyName('FKm1sdakytfkk07pvmvcybv144b');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('educational_stage_institution');
};