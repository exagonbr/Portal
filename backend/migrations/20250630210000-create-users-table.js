/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Verificar se a tabela já existe
  const exists = await knex.schema.hasTable('users');
  
  if (!exists) {
    return knex.schema.createTable('users', function(table) {
      // Chave primária com auto incremento
      table.bigIncrements('id').primary();
      
      // Campos básicos
      table.bigInteger('version').nullable();
      table.boolean('account_expired').nullable();
      table.boolean('account_locked').nullable();
      table.string('address', 255).nullable();
      table.integer('amount_of_media_entries').nullable();
      table.timestamp('date_created').defaultTo(knex.fn.now());
      table.boolean('deleted').nullable();
      table.string('email', 255).notNullable();
      table.boolean('enabled').nullable();
      table.string('full_name', 255).notNullable();
      table.boolean('invitation_sent').nullable();
      table.boolean('is_admin').notNullable();
      table.string('language', 255).nullable();
      table.timestamp('last_updated').defaultTo(knex.fn.now());
      table.string('password', 255).nullable();
      table.boolean('password_expired').nullable();
      table.boolean('pause_video_on_click').nullable();
      table.string('phone', 255).nullable();
      table.boolean('reset_password').notNullable().defaultTo(true);
      table.string('username', 255).nullable();
      table.string('uuid', 255).nullable();
      table.boolean('is_manager').notNullable();
      table.integer('type').nullable();
      table.string('certificate_path', 255).nullable();
      table.boolean('is_certified').nullable().defaultTo(false);
      table.boolean('is_student').notNullable();
      table.boolean('is_teacher').notNullable();
      table.bigInteger('institution_id').nullable();
      table.string('subject', 255).nullable();
      table.bigInteger('subject_data_id').nullable();
      table.boolean('is_institution_manage').nullable().defaultTo(false);
      table.boolean('is_coordinator').nullable().defaultTo(false);
      table.boolean('is_guardian').nullable().defaultTo(false);
      table.boolean('is_institution_manager').nullable().defaultTo(false);
      table.uuid('role_id').nullable();
      table.string('googleId').nullable();
      
      // Índices
      table.index('email', 'idx_users_email');
      table.unique('username', 'idx_users_username_unique');
      table.unique('googleId', 'UQ_f382af58ab36057334fb262efd5');
      
      // Timestamps automáticos
      table.timestamps(true, true);
    });
  } else {
    console.log('Tabela "users" já existe, pulando criação...');
    return Promise.resolve();
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};