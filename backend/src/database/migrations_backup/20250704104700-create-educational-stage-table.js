/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('educational_stage', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.datetime('date_created').nullable();
    table.boolean('deleted').notNullable();
    table.boolean('grade_1').nullable();
    table.boolean('grade_2').nullable();
    table.boolean('grade_3').nullable();
    table.boolean('grade_4').nullable();
    table.boolean('grade_5').nullable();
    table.boolean('grade_6').nullable();
    table.boolean('grade_7').nullable();
    table.boolean('grade_8').nullable();
    table.boolean('grade_9').nullable();
    table.datetime('last_updated').nullable();
    table.string('name', 255).notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('educational_stage');
};