/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.boolean('account_expired').nullable();
    table.boolean('account_locked').nullable();
    table.string('address', 255).nullable();
    table.integer('amount_of_media_entries').nullable();
    table.datetime('date_created').nullable();
    table.boolean('deleted').nullable();
    table.string('email', 255).notNullable();
    table.boolean('enabled').nullable();
    table.string('full_name', 255).notNullable();
    table.boolean('invitation_sent').nullable();
    table.boolean('is_admin').notNullable();
    table.string('language', 255).nullable();
    table.datetime('last_updated').nullable();
    table.string('password', 255).nullable();
    table.boolean('password_expired').nullable();
    table.boolean('pause_video_on_click').nullable();
    table.string('phone', 255).nullable();
    table.boolean('reset_password').notNullable().defaultTo(true);
    table.string('username', 255).nullable().unique('UK_sb8bbouer5wak8vyiiy4pf2bx');
    table.boolean('is_manager').notNullable();
    table.integer('type').nullable();
    table.string('certificate_path', 255).nullable();
    table.boolean('is_certified').defaultTo(false);
    table.boolean('is_student').notNullable();
    table.boolean('is_teacher').notNullable();
    table.bigInteger('institution_id').unsigned().nullable().references('id').inTable('institution').withKeyName('FKjbkkfl7f3ffm66dmg5aw4yfv3');
    table.bigInteger('role_id').unsigned().nullable().references('id').inTable('roles').withKeyName('FK_user_role');
    table.string('subject', 255).nullable();
    table.bigInteger('subject_data_id').unsigned().nullable().references('id').inTable('teacher_subject').withKeyName('FKhfr500wywt00410o71iotd6nn');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('user');
};