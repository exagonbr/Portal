/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('generic_video_tag', function(table) {
    table.bigInteger('generic_video_tags_id').unsigned().notNullable().references('id').inTable('video').withKeyName('FKavrssxydpqb7vjbojy9qi4llg');
    table.bigInteger('tag_id').unsigned().nullable().references('id').inTable('tag').withKeyName('FK4bm87xwdlw8qowuoqvfjnug1u');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('generic_video_tag');
};