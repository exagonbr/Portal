/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('video_author', function(table) {
    table.bigInteger('video_authors_id').unsigned().notNullable().references('id').inTable('video').withKeyName('FKg3u34t7tlom9srgqpbe9nqbhw');
    table.bigInteger('author_id').unsigned().nullable().references('id').inTable('author').withKeyName('FK5wo7tx2yn8m5rym2w33xxedm9');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('video_author');
};