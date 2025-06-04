import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  console.log('🚀 Iniciando seed de dados completos...');

  // Limpar todas as tabelas na ordem correta
  await knex('collections').del();
  await knex('announcements').del();
  await knex('school_managers').del();
  await knex('queue_jobs').del();
  await knex('push_subscriptions').del();
  await knex('notifications').del();
  await knex('forum_replies').del();
  await knex('forum_threads').del();
  await knex('user_classes').del();
  await knex('questions').del();
  await knex('quizzes').del();
  await knex('books').del();
  await knex('content').del();
  await knex('modules').del();
  await knex('courses').del();
  await knex('classes').del();
  await knex('education_cycles').del();
  await knex('schools').del();
  await knex('users').del();
  await knex('role_permissions').del();
  await knex('permissions').del();
  await knex('roles').del();
  await knex('institutions').del();

  console.log('✅ Tabelas limpas com sucesso');

  // 1. Inserir instituições
  const institutions = await knex('institutions').insert([
    {
      name: 'Sabercon Educação',
      code: 'SABERCON',
      description: 'Instituição principal do sistema Sabercon',
      address: 'Rua da Educação, 123',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01234-567',
      phone: '(11) 1234-5678',
      email: 'contato@sabercon.edu.br',
      website: 'https://sabercon.edu.br',
      status: 'active'
    },
    {
      name: 'Instituto Federal de São Paulo',
      code: 'IFSP',
      description: 'Instituto Federal de São Paulo, referência em educação técnica e tecnológica',
      address: 'Av. Principal, 456',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '20000-000',
      phone: '(21) 9876-5432',
      email: 'contato@ifsp.edu.br',
      status: 'active'
    }
  ]).returning('*');

  console.log(`✅ ${institutions.length} instituições inseridas`);

  // 2. Inserir permissões conforme novo sistema
  const permissions = await knex('permissions').insert([
    // System Management - SYSTEM_ADMIN
    { name: 'system.manage', resource: 'system', action: 'manage', description: 'Permite gerenciar todo o sistema' },
    { name: 'institutions.manage', resource: 'institutions', action: 'manage', description: 'Permite gerenciar instituições' },
    { name: 'users.manage.global', resource: 'users', action: 'manage', description: 'Permite gerenciar todos os usuários' },
    { name: 'analytics.view.system', resource: 'analytics', action: 'view', description: 'Permite visualizar analytics do sistema' },
    { name: 'security.manage', resource: 'security', action: 'manage', description: 'Permite gerenciar políticas de segurança' },
    
    // Institution Management
    { name: 'schools.manage', resource: 'schools', action: 'manage', description: 'Permite gerenciar escolas' },
    { name: 'users.manage.institution', resource: 'users', action: 'manage', description: 'Permite gerenciar usuários da instituição' },
    { name: 'classes.manage', resource: 'classes', action: 'manage', description: 'Permite gerenciar turmas' },
    { name: 'schedules.manage', resource: 'schedules', action: 'manage', description: 'Permite gerenciar horários' },
    { name: 'analytics.view.institution', resource: 'analytics', action: 'view', description: 'Permite visualizar analytics da instituição' },
    
    // Academic Management
    { name: 'cycles.manage', resource: 'cycles', action: 'manage', description: 'Permite gerenciar ciclos educacionais' },
    { name: 'curriculum.manage', resource: 'curriculum', action: 'manage', description: 'Permite gerenciar currículo' },
    { name: 'teachers.monitor', resource: 'teachers', action: 'monitor', description: 'Permite monitorar professores' },
    { name: 'analytics.view.academic', resource: 'analytics', action: 'view', description: 'Permite visualizar analytics acadêmicas' },
    { name: 'departments.coordinate', resource: 'departments', action: 'coordinate', description: 'Permite coordenar departamentos' },
    
    // Teaching
    { name: 'attendance.manage', resource: 'attendance', action: 'manage', description: 'Permite gerenciar frequência' },
    { name: 'grades.manage', resource: 'grades', action: 'manage', description: 'Permite gerenciar notas' },
    { name: 'lessons.manage', resource: 'lessons', action: 'manage', description: 'Permite gerenciar planos de aula' },
    { name: 'resources.upload', resource: 'resources', action: 'upload', description: 'Permite fazer upload de recursos' },
    { name: 'students.communicate', resource: 'students', action: 'communicate', description: 'Permite comunicar com estudantes' },
    { name: 'guardians.communicate', resource: 'guardians', action: 'communicate', description: 'Permite comunicar com responsáveis' },
    
    // Student Access
    { name: 'schedule.view.own', resource: 'schedule', action: 'view', description: 'Permite visualizar próprio cronograma' },
    { name: 'grades.view.own', resource: 'grades', action: 'view', description: 'Permite visualizar próprias notas' },
    { name: 'materials.access', resource: 'materials', action: 'access', description: 'Permite acessar materiais de aprendizagem' },
    { name: 'assignments.submit', resource: 'assignments', action: 'submit', description: 'Permite submeter atividades' },
    { name: 'progress.track.own', resource: 'progress', action: 'track', description: 'Permite acompanhar próprio progresso' },
    { name: 'teachers.message', resource: 'teachers', action: 'message', description: 'Permite enviar mensagens para professores' },
    
    // Guardian Access
    { name: 'children.view.info', resource: 'children', action: 'view', description: 'Permite visualizar informações dos filhos' },
    { name: 'children.view.grades', resource: 'children', action: 'view', description: 'Permite visualizar notas dos filhos' },
    { name: 'children.view.attendance', resource: 'children', action: 'view', description: 'Permite visualizar frequência dos filhos' },
    { name: 'announcements.receive', resource: 'announcements', action: 'receive', description: 'Permite receber comunicados' },
    { name: 'school.communicate', resource: 'school', action: 'communicate', description: 'Permite comunicar com a escola' },
    
    // Common permissions
    { name: 'portal.access', resource: 'portal', action: 'access', description: 'Permite acessar portal' },
    { name: 'forum.access', resource: 'forum', action: 'access', description: 'Permite acessar fórum' },
    { name: 'chat.access', resource: 'chat', action: 'access', description: 'Permite acessar chat' },
    { name: 'profile.manage', resource: 'profile', action: 'manage', description: 'Permite gerenciar próprio perfil' }
  ]).returning('*');

  console.log(`✅ ${permissions.length} permissões inseridas`);

  // 3. Inserir roles conforme nova estrutura
  const rolesData = [
    {
      name: 'SYSTEM_ADMIN',
      description: 'Administrador do Sistema - Acesso completo a toda a plataforma',
      permissions: [
        // ACESSO COMPLETO - Todas as permissões
        'system.manage', 'institutions.manage', 'users.manage.global', 'analytics.view.system', 'security.manage',
        'schools.manage', 'users.manage.institution', 'classes.manage', 'schedules.manage', 'analytics.view.institution',
        'cycles.manage', 'curriculum.manage', 'teachers.monitor', 'analytics.view.academic', 'departments.coordinate',
        'attendance.manage', 'grades.manage', 'lessons.manage', 'resources.upload', 'students.communicate', 'guardians.communicate',
        'schedule.view.own', 'grades.view.own', 'materials.access', 'assignments.submit', 'progress.track.own', 'teachers.message',
        'children.view.info', 'children.view.grades', 'children.view.attendance', 'announcements.receive', 'school.communicate',
        'portal.access', 'forum.access', 'chat.access', 'profile.manage'
      ],
      status: 'active'
    },
    {
      name: 'INSTITUTION_MANAGER',
      description: 'Gestor Institucional - Gerencia operações de uma escola ou unidade educacional',
      permissions: [
        'schools.manage', 'users.manage.institution', 'classes.manage', 'schedules.manage', 'analytics.view.institution',
        'cycles.manage', 'curriculum.manage', 'teachers.monitor', 'analytics.view.academic', 'departments.coordinate',
        'students.communicate', 'guardians.communicate', 'announcements.receive',
        'portal.access', 'forum.access', 'chat.access', 'profile.manage'
      ],
      status: 'active'
    },
    {
      name: 'ACADEMIC_COORDINATOR',
      description: 'Coordenador Acadêmico - Supervisiona ciclos educacionais e departamentos',
      permissions: [
        'classes.manage', 'schedules.manage', 'analytics.view.institution',
        'cycles.manage', 'curriculum.manage', 'teachers.monitor', 'analytics.view.academic', 'departments.coordinate',
        'resources.upload', 'students.communicate', 'guardians.communicate', 'teachers.message', 'announcements.receive',
        'portal.access', 'forum.access', 'chat.access', 'profile.manage'
      ],
      status: 'active'
    },
    {
      name: 'TEACHER',
      description: 'Professor - Acessa turmas para gerenciar aulas, notas e comunicação',
      permissions: [
        'attendance.manage', 'grades.manage', 'lessons.manage', 'resources.upload', 'students.communicate', 'guardians.communicate',
        'schedule.view.own', 'materials.access', 'teachers.message', 'announcements.receive', 'school.communicate',
        'portal.access', 'forum.access', 'chat.access', 'profile.manage'
      ],
      status: 'active'
    },
    {
      name: 'STUDENT',
      description: 'Aluno - Acesso ao ambiente de aprendizagem personalizado',
      permissions: [
        'students.communicate', 'schedule.view.own', 'grades.view.own', 'materials.access', 'assignments.submit',
        'progress.track.own', 'teachers.message', 'announcements.receive',
        'portal.access', 'forum.access', 'chat.access', 'profile.manage'
      ],
      status: 'active'
    },
    {
      name: 'GUARDIAN',
      description: 'Responsável - Acompanha o progresso acadêmico dos alunos sob seus cuidados',
      permissions: [
        'children.view.info', 'children.view.grades', 'children.view.attendance', 'announcements.receive', 'school.communicate',
        'portal.access', 'chat.access', 'profile.manage'
      ],
      status: 'active'
    }
  ];

  const roles = await knex('roles').insert(
    rolesData.map(({ permissions, ...role }) => role)
  ).returning('*');

  console.log(`✅ ${roles.length} roles inseridas`);

  // 4. Criar lookup de permissões e roles
  const permissionLookup = permissions.reduce((acc, perm) => {
    acc[perm.name] = perm.id;
    return acc;
  }, {} as Record<string, string>);

  const roleLookup = roles.reduce((acc, role) => {
    acc[role.name] = role.id;
    return acc;
  }, {} as Record<string, string>);

  // 5. Inserir associações role-permission baseadas na propriedade permissions de cada role
  const rolePermissions = [];
  for (const roleData of rolesData) {
    const role = roles.find(r => r.name === roleData.name);
    const roleId = role.id;
    for (const permissionName of roleData.permissions) {
      const permissionId = permissionLookup[permissionName];
      if (permissionId) {
        rolePermissions.push({
          role_id: roleId,
          permission_id: permissionId
        });
      }
    }
  }

  await knex('role_permissions').insert(rolePermissions);
  console.log(`✅ ${rolePermissions.length} associações role-permission inseridas`);

  // 6. Inserir usuários de exemplo com senhas seguras
  const users = await knex('users').insert([
    {
      email: 'admin@sabercon.edu.br',
      password: '$2a$12$B94GA3V2VLAJOtcfuM3O5OJIbaqWO1jSmCTiUQPyADBynIulqulIa', // admin123 (hash válido)
      name: 'Administrador do Sistema Sabercon',
      role_id: roleLookup['SYSTEM_ADMIN'],
      institution_id: institutions[0].id,
      endereco: 'Rua da Administração, 100',
      telefone: '(11) 99999-0001',
      is_active: true
    },
    {
      email: 'gestor@sabercon.edu.br',
      password: '$2a$12$B94GA3V2VLAJOtcfuM3O5OJIbaqWO1jSmCTiUQPyADBynIulqulIa', // admin123 (hash válido)
      name: 'Marina Silva Santos - Gestora Institucional',
      role_id: roleLookup['INSTITUTION_MANAGER'],
      institution_id: institutions[0].id,
      endereco: 'Av. dos Gestores, 200',
      telefone: '(11) 99999-0002',
      is_active: true
    },
    {
      email: 'coordenador@sabercon.edu.com',
      password: '$2a$12$B94GA3V2VLAJOtcfuM3O5OJIbaqWO1jSmCTiUQPyADBynIulqulIa', // admin123 (hash válido)
      name: 'Luciana Lima Costa - Coordenadora Acadêmica',
      role_id: roleLookup['ACADEMIC_COORDINATOR'],
      institution_id: institutions[0].id,
      endereco: 'Av. da Coordenação, 300',
      telefone: '(11) 99999-0003',
      is_active: true
    },
    {
      email: 'professor@sabercon.edu.br',
      password: '$2a$12$B94GA3V2VLAJOtcfuM3O5OJIbaqWO1jSmCTiUQPyADBynIulqulIa', // admin123 (hash válido)
      name: 'Ricardo Santos Oliveira - Professor',
      role_id: roleLookup['TEACHER'],
      institution_id: institutions[0].id,
      endereco: 'Rua dos Professores, 400',
      telefone: '(11) 99999-0004',
      is_active: true
    },
    {
      email: 'julia.c@ifsp.com',
      password: '$2a$12$B94GA3V2VLAJOtcfuM3O5OJIbaqWO1jSmCTiUQPyADBynIulqulIa', // admin123 (hash válido)
      name: 'Julia Costa Ferreira - Estudante IFSP',
      role_id: roleLookup['STUDENT'],
      institution_id: institutions[1].id,
      endereco: 'Rua dos Estudantes, 500',
      telefone: '(11) 99999-0005',
      is_active: true
    },
    {
      email: 'renato@gmail.com',
      password: '$2a$12$B94GA3V2VLAJOtcfuM3O5OJIbaqWO1jSmCTiUQPyADBynIulqulIa', // admin123 (hash válido)
      name: 'Renato Oliveira Silva - Responsável',
      role_id: roleLookup['GUARDIAN'],
      institution_id: institutions[0].id,
      endereco: 'Rua dos Responsáveis, 600',
      telefone: '(11) 99999-0006',
      is_active: true
    },
    // Usuários de backup do sistema para testes
    {
      email: 'admin@portal.com',
      password: '$2a$12$B94GA3V2VLAJOtcfuM3O5OJIbaqWO1jSmCTiUQPyADBynIulqulIa', // admin123 (hash válido)
      name: 'Admin Backup Portal',
      role_id: roleLookup['SYSTEM_ADMIN'],
      institution_id: institutions[0].id,
      endereco: 'Av. Federal, 100',
      telefone: '(21) 99999-1001',
      is_active: true
    },
    {
      email: 'prof.carlos@ifsp.edu.br',
      password: '$2a$12$B94GA3V2VLAJOtcfuM3O5OJIbaqWO1jSmCTiUQPyADBynIulqulIa', // admin123 (hash válido)
      name: 'Carlos Alberto Professor - IFSP',
      role_id: roleLookup['TEACHER'],
      institution_id: institutions[1].id,
      endereco: 'Rua dos Docentes, 200',
      telefone: '(21) 99999-1002',
      is_active: true
    }
  ]).returning('*');

  console.log(`✅ ${users.length} usuários inseridos`);

  // 7. Inserir escolas
  const schools = await knex('schools').insert([
    {
      name: 'Escola Central Sabercon',
      code: 'ECS001',
      description: 'Escola principal da rede Sabercon',
      address: 'Rua da Educação, 123',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01234-567',
      phone: '(11) 1234-5678',
      email: 'central@sabercon.edu.br',
      institution_id: institutions[0].id,
      status: 'active'
    },
    {
      name: 'Campus São Paulo - IFSP',
      code: 'IFSP-SP',
      description: 'Campus principal do IFSP em São Paulo',
      address: 'Av. Principal, 456',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '20000-000',
      phone: '(21) 9876-5432',
      email: 'saopaulo@ifsp.edu.br',
      institution_id: institutions[1].id,
      status: 'active'
    }
  ]).returning('*');

  console.log(`✅ ${schools.length} escolas inseridas`);

  // 8. Inserir ciclos educacionais
  const educationCycles = await knex('education_cycles').insert([
    {
      name: 'Ensino Fundamental I',
      code: 'EF1',
      description: 'Do 1º ao 5º ano',
      min_age: 6,
      max_age: 10,
      duration_years: 5,
      institution_id: institutions[0].id,
      status: 'active'
    },
    {
      name: 'Ensino Fundamental II',
      code: 'EF2',
      description: 'Do 6º ao 9º ano',
      min_age: 11,
      max_age: 14,
      duration_years: 4,
      institution_id: institutions[0].id,
      status: 'active'
    },
    {
      name: 'Ensino Médio',
      code: 'EM',
      description: 'Do 1º ao 3º ano do Ensino Médio',
      min_age: 15,
      max_age: 17,
      duration_years: 3,
      institution_id: institutions[0].id,
      status: 'active'
    },
    {
      name: 'Técnico em Informática',
      code: 'TI',
      description: 'Curso técnico em informática',
      min_age: 16,
      max_age: 50,
      duration_years: 2,
      institution_id: institutions[1].id,
      status: 'active'
    }
  ]).returning('*');

  console.log(`✅ ${educationCycles.length} ciclos educacionais inseridos`);

  // 9. Inserir turmas
  const classes = await knex('classes').insert([
    {
      name: '5º Ano A',
      code: '5A2024',
      description: 'Turma do 5º ano do ensino fundamental',
      year: 2024,
      semester: 1,
      max_students: 30,
      current_students: 1,
      school_id: schools[0].id,
      education_cycle_id: educationCycles[0].id,
      status: 'active'
    },
    {
      name: '8º Ano B',
      code: '8B2024',
      description: 'Turma do 8º ano do ensino fundamental',
      year: 2024,
      semester: 1,
      max_students: 32,
      current_students: 0,
      school_id: schools[0].id,
      education_cycle_id: educationCycles[1].id,
      status: 'active'
    },
    {
      name: 'TI 1º Período',
      code: 'TI1-2024',
      description: 'Primeira turma do curso técnico em informática',
      year: 2024,
      semester: 1,
      max_students: 25,
      current_students: 0,
      school_id: schools[1].id,
      education_cycle_id: educationCycles[3].id,
      status: 'active'
    }
  ]).returning('*');

  console.log(`✅ ${classes.length} turmas inseridas`);

  // 10. Associar usuário estudante à turma
  await knex('user_classes').insert([
    {
      user_id: users.find(u => u.email === 'julia.c@ifsp.com')?.id,
      class_id: classes[2].id, // Associar à turma TI 1º Período do IFSP
      enrollment_date: new Date(),
      status: 'active'
    }
  ]);

  console.log('✅ Associações usuário-turma inseridas');

  // Resumo final
  console.log('\n🎉 SEED CONCLUÍDO COM SUCESSO!');
  console.log('==========================================');
  console.log(`📊 Dados inseridos:`);
  console.log(`   • ${institutions.length} instituições`);
  console.log(`   • ${permissions.length} permissões`);
  console.log(`   • ${roles.length} roles`);
  console.log(`   • ${rolePermissions.length} associações role-permission`);
  console.log(`   • ${users.length} usuários`);
  console.log(`   • ${schools.length} escolas`);
  console.log(`   • ${educationCycles.length} ciclos educacionais`);
  console.log(`   • ${classes.length} turmas`);
  console.log('\n🔐 Usuários de teste criados:');
  console.log('   👑 ADMIN SABERCON: admin@sabercon.edu.br / admin123');
  console.log('   🏢 GESTOR: gestor@sabercon.edu.br / admin123');
  console.log('   📚 COORDENADOR: coordenador@sabercon.edu.com / admin123');
  console.log('   👨‍🏫 PROFESSOR: professor@sabercon.edu.br / admin123');
  console.log('   🎓 ALUNA JULIA: julia.c@ifsp.com / admin123');
  console.log('   👨‍👩‍👧‍👦 RENATO: renato@gmail.com / admin123');
  console.log('   🔧 ADMIN BACKUP: admin@portal.com / admin123');
  console.log('   👨‍🏫 PROF IFSP: prof.carlos@ifsp.edu.br / admin123');
  console.log('\n✅ Sistema pronto para uso!');
}