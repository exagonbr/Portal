import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  console.log('🌱 Preparando banco para migração MySQL...');

  // 1. Garantir que a role TEACHER existe
  const teacherRole = await knex('roles')
    .where('name', 'TEACHER')
    .first();

  if (!teacherRole) {
    console.log('👨‍🏫 Criando role TEACHER...');
    await knex('roles').insert({
      name: 'TEACHER',
      description: 'Professor - Role padrão para usuários migrados do MySQL',
      type: 'system',
      status: 'active',
      user_count: 0
    });
  }

  // 2. Garantir que existe uma instituição padrão para migração
  const defaultInstitution = await knex('institutions')
    .where('code', 'DEFAULT_MIGRATED')
    .first();

  if (!defaultInstitution) {
    console.log('🏢 Criando instituição padrão para migração...');
    await knex('institution').insert({
      name: 'Instituição Migrada do MySQL',
      code: 'DEFAULT_MIGRATED',
      description: 'Instituição padrão para dados migrados do sistema legado MySQL',
      status: 'active'
    });
  }

  // 3. Garantir que existe uma escola padrão para migração
  const institution = await knex('institution')
    .where('code', 'DEFAULT_MIGRATED')
    .first();

  if (institution) {
    const defaultSchool = await knex('schools')
      .where('code', 'DEFAULT_MIGRATED_SCHOOL')
      .first();

    if (!defaultSchool) {
      console.log('🏫 Criando escola padrão para migração...');
      await knex('schools').insert({
        name: 'Escola Migrada do MySQL',
        code: 'DEFAULT_MIGRATED_SCHOOL',
        description: 'Escola padrão para dados migrados do sistema legado MySQL',
        institution_id: institution.id,
        status: 'active'
      });
    }
  }

  // 4. Garantir permissões básicas para TEACHER
  const teacherRoleUpdated = await knex('roles')
    .where('name', 'TEACHER')
    .first();

  if (teacherRoleUpdated) {
    // Verificar se já existem permissões para TEACHER
    const existingPermissions = await knex('role_permissions')
      .where('role_id', teacherRoleUpdated.id)
      .count('* as count')
      .first();

    if (existingPermissions && existingPermissions.count === '0') {
      console.log('🔐 Adicionando permissões básicas para TEACHER...');
      
      // Buscar permissões básicas que um professor deve ter
      const basicPermissions = await knex('permissions')
        .whereIn('name', [
          'read_courses',
          'read_students',
          'read_classes',
          'read_files',
          'create_files',
          'read_collections',
          'read_notifications'
        ]);

      if (basicPermissions.length > 0) {
        const rolePermissions = basicPermissions.map(permission => ({
          role_id: teacherRoleUpdated.id,
          permission_id: permission.id
        }));

        await knex('role_permissions').insert(rolePermissions);
      }
    }
  }

  console.log('✅ Preparação para migração MySQL concluída!');
} 