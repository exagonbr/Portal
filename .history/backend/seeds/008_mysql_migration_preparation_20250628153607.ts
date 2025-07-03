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
  } else {
    console.log('✅ Role TEACHER já existe');
  }

  // 2. Garantir que existe uma instituição padrão para migração
  const defaultInstitution = await knex('institutions')
    .where('code', 'MYSQL_MIGRATED')
    .first();

  if (!defaultInstitution) {
    console.log('🏢 Criando instituição padrão para migração...');
    await knex('institutions').insert({
      name: 'Instituição Migrada do MySQL',
      code: 'MYSQL_MIGRATED',
      description: 'Instituição padrão para dados migrados do sistema legado MySQL',
      address: 'Endereço não informado',
      city: 'Cidade não informada',
      state: 'Estado não informado',
      zip_code: '00000-000',
      phone: '(00) 0000-0000',
      email: 'contato@migrado.com.br',
      status: 'active'
    });
  } else {
    console.log('✅ Instituição padrão já existe');
  }

  // 3. Garantir que existe uma escola padrão para migração
  const institution = await knex('institution')
    .where('code', 'MYSQL_MIGRATED')
    .first();

  if (institution) {
    const defaultSchool = await knex('schools')
      .where('code', 'MYSQL_MIGRATED_SCHOOL')
      .first();

    if (!defaultSchool) {
      console.log('🏫 Criando escola padrão para migração...');
      await knex('schools').insert({
        name: 'Escola Migrada do MySQL',
        code: 'MYSQL_MIGRATED_SCHOOL',
        description: 'Escola padrão para dados migrados do sistema legado MySQL',
        address: 'Endereço não informado',
        city: 'Cidade não informada',
        state: 'Estado não informado',
        zip_code: '00000-000',
        phone: '(00) 0000-0000',
        email: 'escola@migrado.com.br',
        institution_id: institution.id,
        status: 'active'
      });
    } else {
      console.log('✅ Escola padrão já existe');
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

    if (existingPermissions && parseInt(existingPermissions.count as string) === 0) {
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
          'create_collections',
          'read_notifications'
        ]);

      if (basicPermissions.length > 0) {
        const rolePermissions = basicPermissions.map(permission => ({
          role_id: teacherRoleUpdated.id,
          permission_id: permission.id
        }));

        await knex('role_permissions').insert(rolePermissions);
        console.log(`   ✅ ${basicPermissions.length} permissões atribuídas`);
      } else {
        console.log('   ⚠️ Nenhuma permissão básica encontrada no sistema');
      }
    } else {
      console.log('✅ Permissões para TEACHER já configuradas');
    }
  }

  // 5. Criar algumas permissões básicas se não existirem
  const basicPermissionsList = [
    { name: 'read_files', resource: 'files', action: 'read', description: 'Ler arquivos' },
    { name: 'create_files', resource: 'files', action: 'create', description: 'Criar arquivos' },
    { name: 'read_collections', resource: 'collections', action: 'read', description: 'Ler coleções' },
    { name: 'create_collections', resource: 'collections', action: 'create', description: 'Criar coleções' },
    { name: 'read_students', resource: 'students', action: 'read', description: 'Ler dados de estudantes' },
    { name: 'read_classes', resource: 'classes', action: 'read', description: 'Ler turmas' }
  ];

  for (const perm of basicPermissionsList) {
    const existing = await knex('permissions').where('name', perm.name).first();
    if (!existing) {
      await knex('permissions').insert(perm);
      console.log(`   ➕ Permissão ${perm.name} criada`);
    }
  }

  console.log('✅ Preparação para migração MySQL concluída!');
  console.log('📋 Próximos passos:');
  console.log('   1. Configure as variáveis de ambiente MySQL');
  console.log('   2. Execute: npm run migrate:mysql:complete');
  console.log('   3. Verifique: npm run migrate:mysql:verify');
} 