/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('viewing_status', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.boolean('completed').nullable();
    table.integer('current_play_time').notNullable();
    table.datetime('date_created').nullable();
    table.datetime('last_updated').nullable();
    table.bigInteger('profile_id').unsigned().nullable().references('id').inTable('profile').withKeyName('FKchs1ekh1w5ymcc8u6q04sdcnn');
    table.integer('runtime').nullable();
    table.bigInteger('tv_show_id').unsigned().nullable().references('id').inTable('tv_show').withKeyName('FK430ta95ideyg47c4bkm7wq647');
    table.bigInteger('user_id').unsigned().nullable().references('id').inTable('user').withKeyName('FKh411yddvpymcx2wrldpndxg3l');
    table.bigInteger('video_id').unsigned().notNullable().references('id').inTable('video').withKeyName('FK991s44mgqyv4m4sumtm2lcpy');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('viewing_status');
};