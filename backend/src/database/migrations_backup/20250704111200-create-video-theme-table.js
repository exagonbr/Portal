/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('video_theme', function(table) {
    table.bigInteger('video_themes_id').unsigned().notNullable().references('id').inTable('video').withKeyName('FKke0bwc4y79u8oc4yooiia9dmg');
    table.bigInteger('theme_id').unsigned().nullable().references('id').inTable('theme').withKeyName('FKgq0ij5jt4ypry0a6d41s5n07c');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('video_theme');
};