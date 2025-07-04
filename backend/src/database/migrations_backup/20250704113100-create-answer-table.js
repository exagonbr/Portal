/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('answer', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.datetime('date_created').notNullable();
    table.boolean('deleted').nullable();
    table.boolean('is_correct').nullable();
    table.datetime('last_updated').nullable();
    table.bigInteger('question_id').unsigned().nullable().references('id').inTable('question').withKeyName('FK8frr4bcabmmeyyu60qt7iiblo');
    table.text('reply').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('answer');
};