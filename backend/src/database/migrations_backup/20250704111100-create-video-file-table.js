/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('video_file', function(table) {
    table.increments('id').primary();
    table.bigInteger('video_files_id').unsigned().notNullable().references('id').inTable('video').withKeyName('FKaeo3enkx0cm0tdyo8hx4gk77c');
    table.bigInteger('file_id').unsigned().nullable().references('id').inTable('file').withKeyName('FKowvkxe9nmiwxum3fiolslcf6c');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('video_file');
};