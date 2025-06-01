import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  console.log('🌱 Iniciando seed de roles e permissions...');
  
  // Limpar tabelas existentes
  await knex('role_permissions').del();
  await knex('permissions').del();
  await knex('roles').del();
  
  // 1. Inserir permissões
  console.log('🔑 Inserindo permissões...');
  
  const permissions = await knex('permissions').insert([
    // Permissões de sistema
    { name: 'system.manage', resource: 'system', action: 'manage', description: 'Permite gerenciar o sistema' },
    { name: 'institutions.manage', resource: 'institutions', action: 'manage', description: 'Permite gerenciar instituições' },
    { name: 'users.manage.global', resource: 'users', action: 'manage', description: 'Permite gerenciar usuários globalmente' },
    { name: 'analytics.view.system', resource: 'analytics', action: 'view', description: 'Permite visualizar analytics do sistema' },
    { name: 'security.manage', resource: 'security', action: 'manage', description: 'Permite gerenciar segurança' },
    
    // Permissões de instituição
    { name: 'schools.manage', resource: 'schools', action: 'manage', description: 'Permite gerenciar escolas' },
    { name: 'users.manage.institution', resource: 'users', action: 'manage', description: 'Permite gerenciar usuários da instituição' },
    { name: 'classes.manage', resource: 'classes', action: 'manage', description: 'Permite gerenciar turmas' },
    { name: 'schedules.manage', resource: 'schedules', action: 'manage', description: 'Permite gerenciar horários' },
    { name: 'analytics.view.institution', resource: 'analytics', action: 'view', description: 'Permite visualizar analytics da instituição' },
    
    // Permissões acadêmicas
    { name: 'cycles.manage', resource: 'cycles', action: 'manage', description: 'Permite gerenciar ciclos educacionais' },
    { name: 'curriculum.manage', resource: 'curriculum', action: 'manage', description: 'Permite gerenciar currículo' },
    { name: 'teachers.monitor', resource: 'teachers', action: 'monitor', description: 'Permite monitorar professores' },
    { name: 'analytics.view.academic', resource: 'analytics', action: 'view', description: 'Permite visualizar analytics acadêmicas' },
    { name: 'departments.coordinate', resource: 'departments', action: 'manage', description: 'Permite coordenar departamentos' },
    
    // Permissões de professores
    { name: 'attendance.manage', resource: 'attendance', action: 'manage', description: 'Permite gerenciar frequência' },
    { name: 'grades.manage', resource: 'grades', action: 'manage', description: 'Permite gerenciar notas' },
    { name: 'lessons.manage', resource: 'lessons', action: 'manage', description: 'Permite gerenciar aulas' },
    { name: 'resources.upload', resource: 'resources', action: 'create', description: 'Permite upload de recursos' },
    { name: 'students.communicate', resource: 'students', action: 'communicate', description: 'Permite comunicação com estudantes' },
    { name: 'guardians.communicate', resource: 'guardians', action: 'communicate', description: 'Permite comunicação com responsáveis' },
    
    // Permissões de estudantes
    { name: 'schedule.view.own', resource: 'schedule', action: 'view', description: 'Permite visualizar próprio horário' },
    { name: 'grades.view.own', resource: 'grades', action: 'view', description: 'Permite visualizar próprias notas' },
    { name: 'materials.access', resource: 'materials', action: 'access', description: 'Permite acessar materiais' },
    { name: 'assignments.submit', resource: 'assignments', action: 'submit', description: 'Permite submeter tarefas' },
    { name: 'progress.track.own', resource: 'progress', action: 'track', description: 'Permite acompanhar próprio progresso' },
    { name: 'teachers.message', resource: 'teachers', action: 'message', description: 'Permite enviar mensagens para professores' },
    { name: 'announcements.receive', resource: 'announcements', action: 'access', description: 'Permite receber anúncios' },
    
    // Permissões de responsáveis
    { name: 'children.view.info', resource: 'children', action: 'view', description: 'Permite visualizar informações dos filhos' },
    { name: 'children.view.grades', resource: 'children', action: 'view', description: 'Permite visualizar notas dos filhos' },
    { name: 'children.view.attendance', resource: 'children', action: 'view', description: 'Permite visualizar frequência dos filhos' },
    { name: 'school.communicate', resource: 'school', action: 'communicate', description: 'Permite comunicação com a escola' }
  ]).returning('*');
  
  console.log(`✅ ${permissions.length} permissões inseridas`);
  
  // 2. Inserir roles
  console.log('👥 Inserindo roles...');
  
  const roles = await knex('roles').insert([
    {
      name: 'SYSTEM_ADMIN',
      description: 'Administrador com acesso total ao sistema',
      active: true
    },
    {
      name: 'INSTITUTION_MANAGER',
      description: 'Gerente institucional com acesso administrativo',
      active: true
    },
    {
      name: 'ACADEMIC_COORDINATOR',
      description: 'Coordenador responsável pela gestão acadêmica',
      active: true
    },
    {
      name: 'TEACHER',
      description: 'Professor com acesso a turmas e conteúdos',
      active: true
    },
    {
      name: 'STUDENT',
      description: 'Estudante com acesso a materiais e atividades',
      active: true
    },
    {
      name: 'GUARDIAN',
      description: 'Responsável com acesso a informações dos filhos',
      active: true
    }
  ]).returning('*');
  
  console.log(`✅ ${roles.length} roles inseridas`);
  
  // 3. Criar lookup de permissões e roles
  const permissionLookup = permissions.reduce((acc, perm) => {
    acc[perm.name] = perm.id;
    return acc;
  }, {} as Record<string, string>);
  
  const roleLookup = roles.reduce((acc, role) => {
    acc[role.name] = role.id;
    return acc;
  }, {} as Record<string, string>);
  
  // 4. Definir permissões por role
  const rolePermissionsMap = {
    'SYSTEM_ADMIN': [
      'system.manage',
      'institutions.manage',
      'users.manage.global',
      'analytics.view.system',
      'security.manage',
      'schools.manage',
      'users.manage.institution',
      'classes.manage',
      'schedules.manage',
      'analytics.view.institution',
      'cycles.manage',
      'curriculum.manage',
      'teachers.monitor',
      'analytics.view.academic',
      'departments.coordinate'
    ],
    'INSTITUTION_MANAGER': [
      'schools.manage',
      'users.manage.institution',
      'classes.manage',
      'schedules.manage',
      'analytics.view.institution',
      'cycles.manage',
      'curriculum.manage',
      'teachers.monitor',
      'analytics.view.academic',
      'departments.coordinate',
      'students.communicate',
      'guardians.communicate',
      'announcements.receive'
    ],
    'ACADEMIC_COORDINATOR': [
      'classes.manage',
      'schedules.manage',
      'analytics.view.institution',
      'cycles.manage',
      'curriculum.manage',
      'teachers.monitor',
      'analytics.view.academic',
      'departments.coordinate',
      'resources.upload',
      'students.communicate',
      'guardians.communicate',
      'teachers.message',
      'announcements.receive'
    ],
    'TEACHER': [
      'attendance.manage',
      'grades.manage',
      'lessons.manage',
      'resources.upload',
      'students.communicate',
      'guardians.communicate',
      'schedule.view.own',
      'materials.access',
      'teachers.message',
      'announcements.receive',
      'school.communicate'
    ],
    'STUDENT': [
      'students.communicate',
      'schedule.view.own',
      'grades.view.own',
      'materials.access',
      'assignments.submit',
      'progress.track.own',
      'teachers.message',
      'announcements.receive'
    ],
    'GUARDIAN': [
      'children.view.info',
      'children.view.grades',
      'children.view.attendance',
      'announcements.receive',
      'school.communicate'
    ]
  };
  
  // 5. Inserir associações role-permission
  console.log('🔄 Inserindo associações role-permission...');
  const rolePermissions = [];
  
  for (const [roleName, permissionNames] of Object.entries(rolePermissionsMap)) {
    const roleId = roleLookup[roleName];
    if (!roleId) {
      console.warn(`⚠️ Role não encontrada: ${roleName}`);
      continue;
    }
    
    // Também atualizar o array jsonb de permissions na role
    await knex('roles')
      .where('id', roleId)
      .update({ permissions: JSON.stringify(permissionNames) });
    
    for (const permissionName of permissionNames) {
      const permissionId = permissionLookup[permissionName];
      if (!permissionId) {
        console.warn(`⚠️ Permissão não encontrada: ${permissionName}`);
        continue;
      }
      
      rolePermissions.push({
        role_id: roleId,
        permission_id: permissionId
      });
    }
  }
  
  if (rolePermissions.length > 0) {
    await knex('role_permissions').insert(rolePermissions);
    console.log(`✅ ${rolePermissions.length} associações role-permission inseridas`);
  }
  
  console.log('✅ Seed de roles e permissions concluído com sucesso');
} 