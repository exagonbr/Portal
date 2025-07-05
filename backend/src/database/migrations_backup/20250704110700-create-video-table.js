/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('video', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.string('api_id', 255).nullable();
    table.datetime('date_created').nullable();
    table.boolean('deleted').nullable();
    table.string('imdb_id', 255).nullable();
    table.integer('intro_end').nullable();
    table.integer('intro_start').nullable();
    table.datetime('last_updated').nullable();
    table.string('original_language', 255).nullable();
    table.integer('outro_start').nullable();
    table.text('overview', 'longtext').nullable();
    table.double('popularity').nullable();
    table.integer('report_count').nullable();
    table.double('vote_average').nullable();
    table.integer('vote_count').nullable();
    table.string('class', 255).notNullable();
    table.string('backdrop_path', 255).nullable();
    table.bigInteger('poster_image_id').unsigned().nullable().references('id').inTable('file').withKeyName('FKdmt2j8r9a7xhrq2wuqpxt9xls');
    table.string('poster_path', 255).nullable();
    table.string('release_date', 255).nullable();
    table.string('title', 255).nullable();
    table.string('trailer_key', 255).nullable();
    table.bigInteger('backdrop_image_id').unsigned().nullable().references('id').inTable('file').withKeyName('FKqt9ct465gqv1a404cndxpri94');
    table.string('air_date', 255).nullable();
    table.string('episode_string', 255).nullable();
    table.integer('episode_number').nullable();
    table.string('name', 255).nullable();
    table.integer('season_episode_merged').nullable();
    table.integer('season_number').nullable();
    table.bigInteger('show_id').unsigned().nullable().references('id').inTable('tv_show').withKeyName('FKrul79flkblma2n8qi5ypad6n5');
    table.bigInteger('still_image_id').unsigned().nullable().references('id').inTable('file').withKeyName('FK95htu238ajbn5ylbiqnpc4cqt');
    table.string('still_path', 255).nullable();
    table.string('duration', 255).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('video');
};