'use strict';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Primeiro, remover a constraint de foreign key da tabela user_classes
  await knex.schema.alterTable('user_classes', function(table) {
    table.dropForeign('user_id');
  });
  
  // Criar a nova tabela user com a estrutura correta
  await knex.schema.createTable('user', function(table) {
    table.bigIncrements('id').primary();
    table.string('uuid', 36).unique().notNullable();
    table.string('email', 255).unique().notNullable();
    table.string('password', 255).notNullable();
    table.string('name', 255).notNullable();
    table.string('first_name', 255).nullable();
    table.string('last_name', 255).nullable();
    table.string('phone', 20).nullable();
    table.date('birth_date').nullable();
    table.string('cpf', 14).nullable();
    table.string('rg', 20).nullable();
    table.text('address').nullable();
    table.string('city', 100).nullable();
    table.string('state', 2).nullable();
    table.string('zip_code', 10).nullable();
    table.string('profile_image_url', 500).nullable();
    table.boolean('is_active').defaultTo(true);
    table.boolean('email_verified').defaultTo(false);
    table.timestamp('email_verified_at').nullable();
    table.timestamp('last_login_at').nullable();
    table.string('remember_token', 100).nullable();
    table.bigInteger('role_id').unsigned().notNullable().references('id').inTable('roles').onDelete('RESTRICT');
    table.bigInteger('institution_id').unsigned().nullable().references('id').inTable('institutions').onDelete('CASCADE');
    
    // Campos OAuth Google
    table.string('google_id', 100).nullable();
    table.string('google_email', 255).nullable();
    table.string('google_name', 255).nullable();
    table.string('google_picture', 500).nullable();
    table.text('google_access_token').nullable();
    table.text('google_refresh_token').nullable();
    table.timestamp('google_token_expires_at').nullable();
    table.boolean('is_google_verified').defaultTo(false);
    table.timestamp('google_linked_at').nullable();
    
    table.timestamps(true, true);
    
    // Índices
    table.index('email');
    table.index('role_id');
    table.index('institution_id');
    table.index('google_id');
    table.index('is_active');
  });
  
  // Migrar dados da tabela users para user
  const usersData = await knex('users').select('*');
  if (usersData.length > 0) {
    await knex('user').insert(usersData);
  }
  
  // Atualizar a tabela user_classes para referenciar a nova tabela user
  await knex.schema.alterTable('user_classes', function(table) {
    table.foreign('user_id').references('id').inTable('user').onDelete('CASCADE');
  });
  
  // Agora podemos remover a tabela users
  await knex.schema.dropTableIfExists('users');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Remover a constraint de foreign key da tabela user_classes
  await knex.schema.alterTable('user_classes', function(table) {
    table.dropForeign('user_id');
  });
  
  // Recriar a tabela users
  await knex.schema.createTable('users', function(table) {
    table.bigIncrements('id').primary();
    table.string('email', 255).unique().notNullable();
    table.string('password', 255).notNullable();
    table.string('name', 255).notNullable();
    table.string('first_name', 255).nullable();
    table.string('last_name', 255).nullable();
    table.string('phone', 20).nullable();
    table.date('birth_date').nullable();
    table.string('cpf', 14).nullable();
    table.string('rg', 20).nullable();
    table.text('address').nullable();
    table.string('city', 100).nullable();
    table.string('state', 2).nullable();
    table.string('zip_code', 10).nullable();
    table.string('profile_image_url', 500).nullable();
    table.boolean('is_active').defaultTo(true);
    table.boolean('email_verified').defaultTo(false);
    table.timestamp('email_verified_at').nullable();
    table.timestamp('last_login_at').nullable();
    table.string('remember_token', 100).nullable();
    table.bigInteger('role_id').unsigned().notNullable().references('id').inTable('roles').onDelete('RESTRICT');
    table.bigInteger('institution_id').unsigned().nullable().references('id').inTable('institutions').onDelete('CASCADE');
    
    // Campos OAuth Google
    table.string('google_id', 100).nullable();
    table.string('google_email', 255).nullable();
    table.string('google_name', 255).nullable();
    table.string('google_picture', 500).nullable();
    table.text('google_access_token').nullable();
    table.text('google_refresh_token').nullable();
    table.timestamp('google_token_expires_at').nullable();
    table.boolean('is_google_verified').defaultTo(false);
    table.timestamp('google_linked_at').nullable();
    
    table.timestamps(true, true);
    
    // Índices
    table.index('email');
    table.index('role_id');
    table.index('institution_id');
    table.index('google_id');
    table.index('is_active');
  });
  
  // Migrar dados da tabela user de volta para users
  const userData = await knex('user').select('*');
  if (userData.length > 0) {
    await knex('users').insert(userData);
  }
  
  // Restaurar a foreign key na tabela user_classes
  await knex.schema.alterTable('user_classes', function(table) {
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });
  
  // Remover a tabela user
  await knex.schema.dropTableIfExists('user');
}; 