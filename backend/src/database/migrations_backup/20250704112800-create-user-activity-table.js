/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_activity', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.string('browser', 255).nullable();
    table.datetime('date_created').notNullable();
    table.string('device', 255).nullable();
    table.string('ip_address', 255).nullable();
    table.datetime('last_updated').nullable();
    table.string('operating_system', 255).nullable();
    table.string('type', 255).nullable();
    table.bigInteger('user_id').unsigned().nullable().references('id').inTable('user').withKeyName('FKp78clcyf5okycdv9teohsr2kq');
    table.bigInteger('video_id').unsigned().nullable().references('id').inTable('video').withKeyName('FKh6m2guab7jgwi62w77iity57f');
    table.bigInteger('institution_id').unsigned().nullable().references('id').inTable('institution').withKeyName('FKp6hnl6pgb5xm0450lop9suw5p');
    table.bigInteger('unit_id').unsigned().nullable().references('id').inTable('unit').withKeyName('FKtatfwll62ntl6l69jwdi3tbnu');
    table.string('fullname', 255).nullable();
    table.string('institution_name', 255).nullable();
    table.boolean('is_certified').nullable();
    table.string('username', 255).nullable();
    table.text('units_data', 'longtext').nullable();
    table.text('user_data', 'longtext').nullable();
    table.boolean('populated').notNullable();
    table.string('role', 255).nullable();
    table.index(['institution_id', 'user_id', 'unit_id', 'is_certified'], 'index7');
    table.index(['user_id'], 'userIndex');
    table.index(['institution_id'], 'institutionIndex');
    table.index(['unit_id'], 'unitIndex');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('user_activity');
};