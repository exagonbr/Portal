/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('public_tv_show', function(table) {
    table.bigInteger('public_tv_show_id').unsigned().notNullable().references('id').inTable('public').withKeyName('FKixr6sgigdei5lhinyouob58df');
    table.bigInteger('tv_show_id').unsigned().nullable().references('id').inTable('tv_show').withKeyName('FKojcarjxrtdirajjbpq65jnxw3');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('public_tv_show');
};