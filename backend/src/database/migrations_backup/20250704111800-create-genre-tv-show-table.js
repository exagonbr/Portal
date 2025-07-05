/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('genre_tv_show', function(table) {
    table.bigInteger('genre_tv_show_id').unsigned().notNullable().references('id').inTable('genre').withKeyName('FK5sdf2x76jxoc7e960flse3i8j');
    table.bigInteger('tv_show_id').unsigned().nullable().references('id').inTable('tv_show').withKeyName('FK4dcvmc049cd3b2ktllc854gra');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('genre_tv_show');
};