/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tv_show', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.string('api_id', 255).nullable();
    table.bigInteger('backdrop_image_id').unsigned().nullable().references('id').inTable('file').withKeyName('FKqiq9xg4n812vtp9rea30golj1');
    table.string('backdrop_path', 255).nullable();
    table.datetime('contract_term_end').notNullable();
    table.datetime('date_created').notNullable();
    table.boolean('deleted').nullable();
    table.datetime('first_air_date').notNullable();
    table.string('imdb_id', 255).nullable();
    table.datetime('last_updated').notNullable();
    table.boolean('manual_input').nullable();
    table.bigInteger('manual_support_id').unsigned().nullable().references('id').inTable('file').withKeyName('FK419w2y927i5nrqyi0mlepr9yw');
    table.string('manual_support_path', 255).nullable();
    table.string('name', 255).notNullable();
    table.string('original_language', 255).nullable();
    table.text('overview', 'longtext').nullable();
    table.double('popularity').nullable();
    table.bigInteger('poster_image_id').unsigned().nullable().references('id').inTable('file').withKeyName('FKhtvvef5ipv07k0yxontrso6mt');
    table.string('poster_path', 255).nullable();
    table.text('producer', 'longtext').nullable();
    table.double('vote_average').nullable();
    table.integer('vote_count').nullable();
    table.string('total_load', 255).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tv_show');
};