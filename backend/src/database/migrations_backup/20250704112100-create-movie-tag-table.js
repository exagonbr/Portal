/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('movie_tag', function(table) {
    table.bigInteger('movie_tags_id').unsigned().notNullable().references('id').inTable('video').withKeyName('FK3i7rqfqo1b9yjn5l8jbgkpq3r');
    table.bigInteger('tag_id').unsigned().nullable().references('id').inTable('tag').withKeyName('FK98ecn3v9aih6feassmb5tjjjj');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('movie_tag');
};