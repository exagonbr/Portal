/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('file', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.string('content_type', 255).nullable();
    table.datetime('date_created').notNullable();
    table.string('extension', 255).nullable();
    table.string('external_link', 255).nullable();
    table.boolean('is_default').nullable();
    table.boolean('is_public').nullable();
    table.string('label', 255).nullable();
    table.datetime('last_updated').notNullable();
    table.string('local_file', 255).nullable();
    table.string('name', 255).nullable();
    table.string('original_filename', 255).nullable();
    table.string('quality', 4).nullable();
    table.string('sha256hex', 64).nullable();
    table.bigInteger('size').nullable();
    table.string('subtitle_label', 255).nullable();
    table.string('subtitle_src_lang', 255).nullable();
    table.boolean('is_subtitled').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('file');
};