/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('unit_class', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.datetime('date_created').nullable();
    table.boolean('deleted').notNullable();
    table.bigInteger('institution_id').unsigned().notNullable().references('id').inTable('institution').withKeyName('FKhhifclx9qt8gilgfskownfr8c');
    table.datetime('last_updated').nullable();
    table.string('name', 255).notNullable();
    table.bigInteger('unit_id').unsigned().notNullable().references('id').inTable('unit').withKeyName('FK8jt54hexyqonvf429yvmf7pop');
    table.string('institution_name', 255).nullable();
    table.string('unit_name', 255).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('unit_class');
};