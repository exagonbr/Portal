import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Ensure teacher role exists
  const teacherRole = await knex('roles')
    .where('name', 'TEACHER')
    .first();

  if (!teacherRole) {
    await knex('roles')
      .insert({
        name: 'TEACHER',
        description: 'Professor role with course management and student supervision capabilities',
        type: 'system',
        status: 'active'
      })
      .returning('id');
  }

  // 2. Ensure required permissions exist
  const requiredPermissions = [
    {
      name: 'read:course',
      resource: 'courses',
      action: 'read',
      description: 'Ability to view course information'
    },
    {
      name: 'create:course',
      resource: 'courses',
      action: 'create',
      description: 'Ability to create new courses'
    },
    {
      name: 'manage:students',
      resource: 'students',
      action: 'manage',
      description: 'Ability to manage and supervise students'
    }
  ];

  for (const permission of requiredPermissions) {
    await knex('permissions')
      .insert(permission)
      .onConflict('name')
      .merge();
  }

  // 3. Ensure teacher role has all required permissions
  const teacherRoleId = teacherRole?.id || (await knex('roles').where('name', 'TEACHER').first()).id;
  const permissions = await knex('permissions')
    .whereIn('name', requiredPermissions.map(p => p.name))
    .select('id');

  for (const permission of permissions) {
    await knex('role_permissions')
      .insert({
        role_id: teacherRoleId,
        permission_id: permission.id
      })
      .onConflict(['role_id', 'permission_id'])
      .ignore();
  }

  // 4. Add active column to users if it doesn't exist
  const hasActiveColumn = await knex.schema.hasColumn('users', 'active');
  if (!hasActiveColumn) {
    await knex.schema.alterTable('users', (table) => {
      table.boolean('active').defaultTo(true);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  // Remove teacher role permissions
  const teacherRole = await knex('roles')
    .where('name', 'TEACHER')
    .first();

  if (teacherRole) {
    await knex('role_permissions')
      .where('role_id', teacherRole.id)
      .delete();
  }

  // Remove permissions
  await knex('permissions')
    .whereIn('name', ['read:course', 'create:course', 'manage:students'])
    .delete();

  // Remove active column from users if it was added
  const hasActiveColumn = await knex.schema.hasColumn('users', 'active');
  if (hasActiveColumn) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('active');
    });
  }
}
