/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('institution_tv_show', function(table) {
    table.bigInteger('tv_show_id').unsigned().notNullable().references('id').inTable('tv_show').withKeyName('FK5evk1aa64cmwgs7h5i6rdinnb');
    table.bigInteger('institution_id').unsigned().notNullable().references('id').inTable('institution').withKeyName('FKs939x6dnsh4g2o9c1ddd7hbcc');
    table.primary(['tv_show_id', 'institution_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('institution_tv_show');
};