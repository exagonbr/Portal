/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('report', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.bigInteger('created_by_id').unsigned().nullable().references('id').inTable('user').withKeyName('FKa3xfru7eswjidybn49g9qko6s');
    table.datetime('date_created').notNullable();
    table.string('error_code', 255).nullable();
    table.datetime('last_updated').notNullable();
    table.boolean('resolved').nullable();
    table.bigInteger('video_id').unsigned().nullable().references('id').inTable('video').withKeyName('FK5m7uvxjylkhb6g5j3yqh4ldpf');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('report');
};