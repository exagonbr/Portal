/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('generic_video_genre', function(table) {
    table.bigInteger('generic_video_genre_id').unsigned().notNullable().references('id').inTable('video').withKeyName('FKscwbnjvnypu9imcpxng9abmmd');
    table.bigInteger('genre_id').unsigned().nullable().references('id').inTable('genre').withKeyName('FKaunk0hced72e8hlp8sd4lq4y8');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('generic_video_genre');
};