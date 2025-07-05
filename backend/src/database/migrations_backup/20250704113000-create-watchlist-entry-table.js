/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('watchlist_entry', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.datetime('date_created').nullable();
    table.boolean('is_deleted').notNullable();
    table.datetime('last_updated').nullable();
    table.bigInteger('profile_id').unsigned().notNullable().references('id').inTable('profile').withKeyName('FKe1iby2ogwpkh8203b5gj8y745');
    table.bigInteger('tv_show_id').unsigned().nullable().references('id').inTable('tv_show').withKeyName('FKpt5vhgtw8oxuhks92mxuyduse');
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('user').withKeyName('FKos9l93j86bdgcnwe89pgl7ikm');
    table.bigInteger('video_id').unsigned().nullable().references('id').inTable('video').withKeyName('FK82ow1jc4sjoj9p9703e84ltn');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('watchlist_entry');
};