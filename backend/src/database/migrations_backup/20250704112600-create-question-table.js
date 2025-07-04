/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('question', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.datetime('date_created').notNullable();
    table.boolean('deleted').nullable();
    table.bigInteger('file_id').unsigned().nullable().references('id').inTable('file').withKeyName('FK6fsg3647bhqmogxrp2bqksnf3');
    table.datetime('last_updated').nullable();
    table.text('test').nullable();
    table.bigInteger('tv_show_id').unsigned().nullable().references('id').inTable('tv_show').withKeyName('FKipb1xls5sewyc2t3viqrdb57c');
    table.bigInteger('episode_id').unsigned().nullable().references('id').inTable('video').withKeyName('FKtb0navag1fdl13snk4y82r3wc');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('question');
};