/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('genre_movie', function(table) {
    table.bigInteger('genre_movies_id').unsigned().notNullable().references('id').inTable('genre').withKeyName('FKmk4h07d5mutpsq89sssedqopg');
    table.bigInteger('movie_id').unsigned().nullable().references('id').inTable('video').withKeyName('FKpswwu1oom9o357bj0u00wdc6g');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('genre_movie');
};