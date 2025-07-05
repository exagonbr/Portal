/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tv_show_author', function(table) {
    table.increments('id').primary();
    table.bigInteger('tv_show_authors_id').unsigned().notNullable().references('id').inTable('tv_show').withKeyName('FKl1a6o3ai1dqayy5cq94ohntkk');
    table.bigInteger('author_id').unsigned().nullable().references('id').inTable('author').withKeyName('FK7e4usawnu8hxb1cpvgug47oi8');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tv_show_author');
};