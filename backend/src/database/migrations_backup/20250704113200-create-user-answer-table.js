/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_answer', function(table) {
    table.increments('id').primary();
    table.bigInteger('answer_id').unsigned().notNullable().references('id').inTable('answer').withKeyName('FKm321eamc0drwpxfkvyl9giypt');
    table.bigInteger('question_id').unsigned().notNullable().references('id').inTable('question').withKeyName('FKpsk90eok3ounaet92hku3gny1');
    table.bigInteger('version').nullable();
    table.datetime('date_created').notNullable();
    table.boolean('is_correct').nullable();
    table.datetime('last_updated').nullable();
    table.bigInteger('score').nullable();
    table.bigInteger('user_id').unsigned().nullable().references('id').inTable('user').withKeyName('FK7kw17ur9w2egkc51xua3yh0ux');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('user_answer');
};