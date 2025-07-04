/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('certificate', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.datetime('date_created').notNullable();
    table.datetime('last_updated').nullable();
    table.string('path', 255).nullable();
    table.bigInteger('score').nullable();
    table.bigInteger('tv_show_id').unsigned().nullable().references('id').inTable('tv_show').withKeyName('FK1nuimt9bvw0lvxwrkxesofwag');
    table.bigInteger('user_id').unsigned().nullable().references('id').inTable('user').withKeyName('FKp2ure8wwndmepxyj2ey8r3lb2');
    table.string('document', 255).nullable();
    table.string('license_code', 255).nullable();
    table.string('tv_show_name', 255).nullable();
    table.boolean('recreate').defaultTo(true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('certificate');
};