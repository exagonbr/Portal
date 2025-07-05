/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_genre', function(table) {
    table.bigInteger('user_favorite_genres_id').unsigned().notNullable().references('id').inTable('user').withKeyName('FKix586n7j5uhikl2xjphhnvowi');
    table.bigInteger('genre_id').unsigned().nullable().references('id').inTable('genre').withKeyName('FKlb3fah6md6bkhq152n73vc3r1');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('user_genre');
};