import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create roles table
  await knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('description');
    table.enum('type', ['system', 'custom']).notNullable();
    table.integer('user_count').defaultTo(0);
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamps(true, true);
  });

  // Create permissions table
  await knex.schema.createTable('permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('resource').notNullable();
    table.enum('action', ['create', 'read', 'update', 'delete']).notNullable();
    table.text('description');
    table.timestamps(true, true);
  });

  // Create role_permissions junction table
  await knex.schema.createTable('role_permissions', (table) => {
    table.uuid('role_id').references('id').inTable('roles').onDelete('CASCADE');
    table.uuid('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
    table.primary(['role_id', 'permission_id']);
    table.timestamps(true, true);
  });

  // Add role_id to users table and remove old role enum
  await knex.schema.alterTable('users', (table) => {
    table.uuid('role_id').references('id').inTable('roles');
    table.string('endereco');
    table.string('telefone');
    table.string('usuario');
    table.string('unidade_ensino');
  });

  // Update existing users with default values
  await knex('users').update({
    usuario: knex.raw('email')
  });

  // Now make usuario NOT NULL
  await knex.schema.alterTable('users', (table) => {
    table.string('usuario').notNullable().alter();
  });

  // Drop the old role column
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('role');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('role_id');
    table.dropColumn('endereco');
    table.dropColumn('telefone');
    table.dropColumn('usuario');
    table.dropColumn('unidade_ensino');
    table.enum('role', ['admin', 'teacher', 'student']).notNullable();
  });

  await knex.schema.dropTableIfExists('role_permissions');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('roles');
}
