/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('notification_queue', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.datetime('date_created').notNullable();
    table.string('description', 255).nullable();
    table.boolean('is_completed').nullable();
    table.datetime('last_updated').notNullable();
    table.bigInteger('movie_id').unsigned().nullable().references('id').inTable('video').withKeyName('FKgsh7esfaqqpm6c3aq6twqnkjh');
    table.bigInteger('tv_show_id').unsigned().nullable().references('id').inTable('tv_show').withKeyName('FK6sx3f2e4ve3wfsrtbgd4cuvvw');
    table.string('type', 255).nullable();
    table.bigInteger('video_to_play_id').unsigned().nullable().references('id').inTable('video').withKeyName('FKacds5fexnhhlhia4uye5t446g');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('notification_queue');
};