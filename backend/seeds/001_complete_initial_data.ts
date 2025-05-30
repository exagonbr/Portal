import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
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
      email: 'contato@eifsp.edu.br',
      status: 'active'
    }
  ]).returning('*');

  // 2. Inserir permissões no formato correto
  const permissions = await knex('permissions').insert([
    // Student permissions
    { name: 'students.communicate', resource: 'students', action: 'communicate', description: 'Permite comunicação entre estudantes' },
    { name: 'schedule.view.own', resource: 'schedule', action: 'view', description: 'Permite visualizar próprio cronograma' },
    { name: 'grades.view.own', resource: 'grades', action: 'view', description: 'Permite visualizar próprias notas' },
    { name: 'materials.access', resource: 'materials', action: 'access', description: 'Permite acessar materiais educacionais' },
    { name: 'assignments.submit', resource: 'assignments', action: 'submit', description: 'Permite submeter atividades' },
    { name: 'progress.track.own', resource: 'progress', action: 'track', description: 'Permite acompanhar próprio progresso' },
    { name: 'teachers.message', resource: 'teachers', action: 'message', description: 'Permite enviar mensagens para professores' },
    { name: 'announcements.receive', resource: 'announcements', action: 'receive', description: 'Permite receber comunicados' },
    { name: 'forum.access', resource: 'forum', action: 'access', description: 'Permite acessar fórum' },
    { name: 'student.portal.access', resource: 'portal', action: 'access', description: 'Permite acessar portal do aluno' },
    
    // Teacher permissions
    { name: 'attendance.manage', resource: 'attendance', action: 'manage', description: 'Permite gerenciar frequência' },
    { name: 'grades.manage', resource: 'grades', action: 'manage', description: 'Permite gerenciar notas' },
    { name: 'lessons.manage', resource: 'lessons', action: 'manage', description: 'Permite gerenciar aulas' },
    { name: 'courses.manage', resource: 'courses', action: 'manage', description: 'Permite gerenciar cursos' },
    { name: 'assignments.manage', resource: 'assignments', action: 'manage', description: 'Permite gerenciar atividades' },
    { name: 'live.manage', resource: 'live', action: 'manage', description: 'Permite gerenciar aulas ao vivo' },
    { name: 'students.view', resource: 'students', action: 'view', description: 'Permite visualizar alunos' },
    { name: 'reports.view.own', resource: 'reports', action: 'view', description: 'Permite visualizar próprios relatórios' },
    { name: 'forum.moderate', resource: 'forum', action: 'moderate', description: 'Permite moderar fórum' },
    { name: 'videos.access', resource: 'videos', action: 'access', description: 'Permite acessar vídeos' },
    { name: 'books.access', resource: 'books', action: 'access', description: 'Permite acessar livros' },
    
    // Manager permissions
    { name: 'users.manage.institution', resource: 'users', action: 'manage', description: 'Permite gerenciar usuários da instituição' },
    { name: 'classes.manage', resource: 'classes', action: 'manage', description: 'Permite gerenciar turmas' },
    { name: 'analytics.view.institution', resource: 'analytics', action: 'view', description: 'Permite visualizar analytics da instituição' },
    { name: 'courses.manage.institution', resource: 'courses', action: 'manage', description: 'Permite gerenciar cursos da instituição' },
    { name: 'attendance.view.institution', resource: 'attendance', action: 'view', description: 'Permite visualizar frequência da instituição' },
    { name: 'schools.manage', resource: 'schools', action: 'manage', description: 'Permite gerenciar escolas' },
    { name: 'curriculum.manage', resource: 'curriculum', action: 'manage', description: 'Permite gerenciar currículo' },
    { name: 'calendar.manage', resource: 'calendar', action: 'manage', description: 'Permite gerenciar calendário' },
    { name: 'financial.view', resource: 'financial', action: 'view', description: 'Permite visualizar dados financeiros' },
    
    // Admin permissions
    { name: 'admin.access', resource: 'admin', action: 'access', description: 'Permite acesso administrativo' },
    { name: 'users.manage', resource: 'users', action: 'manage', description: 'Permite gerenciar usuários' },
    { name: 'roles.manage', resource: 'roles', action: 'manage', description: 'Permite gerenciar roles e permissões' },
    { name: 'institutions.manage', resource: 'institutions', action: 'manage', description: 'Permite gerenciar instituições' },
    { name: 'units.manage', resource: 'units', action: 'manage', description: 'Permite gerenciar unidades' },
    { name: 'content.manage', resource: 'content', action: 'manage', description: 'Permite gerenciar conteúdo' },
    { name: 'reports.access.all', resource: 'reports', action: 'access', description: 'Permite acessar todos os relatórios' },
    { name: 'settings.manage', resource: 'settings', action: 'manage', description: 'Permite gerenciar configurações' },
    { name: 'analytics.view.all', resource: 'analytics', action: 'view', description: 'Permite visualizar todas as analytics' },
    { name: 'logs.view', resource: 'logs', action: 'view', description: 'Permite visualizar logs' },
    { name: 'performance.view', resource: 'performance', action: 'view', description: 'Permite visualizar performance' },
    
    // System Admin permissions
    { name: 'system.manage', resource: 'system', action: 'manage', description: 'Permite gerenciar sistema' },
    { name: 'security.manage', resource: 'security', action: 'manage', description: 'Permite gerenciar segurança' },
    { name: 'analytics.view.system', resource: 'analytics', action: 'view', description: 'Permite visualizar analytics do sistema' },
    { name: 'users.manage.all', resource: 'users', action: 'manage', description: 'Permite gerenciar todos os usuários' },
    { name: 'system.monitor', resource: 'system', action: 'monitor', description: 'Permite monitorar sistema' },
    { name: 'logs.view.all', resource: 'logs', action: 'view', description: 'Permite visualizar todos os logs' },
    { name: 'performance.view.all', resource: 'performance', action: 'view', description: 'Permite visualizar toda a performance' },
    { name: 'audit.view', resource: 'audit', action: 'view', description: 'Permite visualizar auditoria' },
    { name: 'backup.manage', resource: 'backup', action: 'manage', description: 'Permite gerenciar backup' },
    
    // Academic Coordinator permissions
    { name: 'cycles.manage', resource: 'cycles', action: 'manage', description: 'Permite gerenciar ciclos educacionais' },
    { name: 'teachers.monitor', resource: 'teachers', action: 'monitor', description: 'Permite monitorar professores' },
    { name: 'evaluations.manage', resource: 'evaluations', action: 'manage', description: 'Permite gerenciar avaliações' },
    { name: 'performance.view.academic', resource: 'performance', action: 'view', description: 'Permite visualizar performance acadêmica' },
    { name: 'planning.manage', resource: 'planning', action: 'manage', description: 'Permite gerenciar planejamento' },
    { name: 'meetings.manage', resource: 'meetings', action: 'manage', description: 'Permite gerenciar reuniões' },
    { name: 'indicators.view', resource: 'indicators', action: 'view', description: 'Permite visualizar indicadores' },
    { name: 'reports.view.academic', resource: 'reports', action: 'view', description: 'Permite visualizar relatórios acadêmicos' },
    { name: 'improvements.manage', resource: 'improvements', action: 'manage', description: 'Permite gerenciar melhorias' },
    
    // Guardian permissions
    { name: 'children.view.info', resource: 'children', action: 'view', description: 'Permite visualizar informações dos filhos' },
    { name: 'children.view.grades', resource: 'children', action: 'view', description: 'Permite visualizar notas dos filhos' },
    { name: 'children.view.attendance', resource: 'children', action: 'view', description: 'Permite visualizar frequência dos filhos' },
    { name: 'children.view.activities', resource: 'children', action: 'view', description: 'Permite visualizar atividades dos filhos' },
    { name: 'guardian.communicate', resource: 'guardian', action: 'communicate', description: 'Permite comunicação do responsável' },
    { name: 'guardian.meetings.view', resource: 'guardian', action: 'view', description: 'Permite visualizar reuniões' },
    { name: 'guardian.announcements.view', resource: 'guardian', action: 'view', description: 'Permite visualizar comunicados' },
    { name: 'guardian.financial.view', resource: 'guardian', action: 'view', description: 'Permite visualizar dados financeiros' },
    { name: 'guardian.financial.history', resource: 'guardian', action: 'view', description: 'Permite visualizar histórico financeiro' }
  ]).returning('*');

  // 3. Inserir roles
  const roles = await knex('roles').insert([
    {
      name: 'Aluno',
      description: 'Estudante com acesso ao conteúdo educacional',
      type: 'system',
      status: 'active'
    },
    {
      name: 'Professor',
      description: 'Educador responsável pelo ensino e avaliação',
      type: 'system',
      status: 'active'
    },
    {
      name: 'Gestor',
      description: 'Gerente institucional com acesso administrativo',
      type: 'system',
      status: 'active'
    },
    {
      name: 'Administrador',
      description: 'Administrador com acesso total ao sistema',
      type: 'system',
      status: 'active'
    },
    {
      name: 'Coordenador Acadêmico',
      description: 'Coordenador responsável pela gestão acadêmica',
      type: 'system',
      status: 'active'
    },
    {
      name: 'Responsável',
      description: 'Responsável pelos estudantes',
      type: 'system',
      status: 'active'
    }
  ]).returning('*');

  // 4. Criar lookup de permissões e roles
  const permissionLookup = permissions.reduce((acc, perm) => {
    acc[perm.name] = perm.id;
    return acc;
  }, {} as Record<string, string>);

  const roleLookup = roles.reduce((acc, role) => {
    acc[role.name] = role.id;
    return acc;
  }, {} as Record<string, string>);

  // 5. Definir permissões por role
  const rolePermissionsMap = {
    'Aluno': [
      'students.communicate',
      'schedule.view.own',
      'grades.view.own',
      'materials.access',
      'assignments.submit',
      'progress.track.own',
      'teachers.message',
      'announcements.receive',
      'forum.access',
      'student.portal.access'
    ],
    'Professor': [
      'attendance.manage',
      'grades.manage',
      'lessons.manage',
      'courses.manage',
      'assignments.manage',
      'live.manage',
      'students.view',
      'reports.view.own',
      'forum.moderate',
      'videos.access',
      'books.access',
      'materials.access',
      'teachers.message',
      'announcements.receive'
    ],
    'Gestor': [
      'users.manage.institution',
      'classes.manage',
      'analytics.view.institution',
      'courses.manage.institution',
      'attendance.view.institution',
      'schools.manage',
      'curriculum.manage',
      'calendar.manage',
      'financial.view',
      'reports.view.own',
      'materials.access',
      'assignments.manage',
      'lessons.manage',
      'grades.manage',
      'students.view'
    ],
    'Administrador': [
      'admin.access',
      'users.manage',
      'roles.manage',
      'institutions.manage',
      'units.manage',
      'content.manage',
      'reports.access.all',
      'settings.manage',
      'analytics.view.all',
      'logs.view',
      'performance.view',
      'system.manage',
      'security.manage',
      'materials.access',
      'courses.manage',
      'assignments.manage',
      'lessons.manage',
      'grades.manage',
      'students.view',
      'teachers.message',
      'forum.moderate'
    ],
    'Coordenador Acadêmico': [
      'cycles.manage',
      'curriculum.manage',
      'teachers.monitor',
      'evaluations.manage',
      'performance.view.academic',
      'planning.manage',
      'meetings.manage',
      'indicators.view',
      'reports.view.academic',
      'improvements.manage',
      'materials.access',
      'courses.manage',
      'students.view'
    ],
    'Responsável': [
      'children.view.info',
      'children.view.grades',
      'children.view.attendance',
      'children.view.activities',
      'guardian.communicate',
      'guardian.meetings.view',
      'guardian.announcements.view',
      'guardian.financial.view',
      'guardian.financial.history'
    ]
  };

  // 6. Inserir associações role-permission
  const rolePermissions = [];
  for (const [roleName, permissionNames] of Object.entries(rolePermissionsMap)) {
    const roleId = roleLookup[roleName];
    if (!roleId) continue;

    for (const permissionName of permissionNames) {
      const permissionId = permissionLookup[permissionName];
      if (!permissionId) continue;

      rolePermissions.push({
        role_id: roleId,
        permission_id: permissionId
      });
    }
  }

  await knex('role_permissions').insert(rolePermissions);

  // 7. Inserir usuários de exemplo
  const users = await knex('users').insert([
    {
      email: 'admin@sabercon.edu.br',
      password: '$2a$12$.6ZtOp3v3WcvuZsumjrK.uaAeggqhA1z5AlnKDBaXc.XdXq6dGxdK', // password123
      name: 'Administrador Sistema',
      role_id: roleLookup['Administrador'],
      institution_id: institutions[0].id,
      endereco: 'Rua da Administração, 100',
      telefone: '(11) 98765-4321',
      school_id: null, // Admin não vinculado a escola específica
      is_active: true
    },
    {
      email: 'gestor@sabercon.edu.br',
      password: '$2a$12$.6ZtOp3v3WcvuZsumjrK.uaAeggqhA1z5AlnKDBaXc.XdXq6dGxdK', // password123
      name: 'Marina Silva',
      role_id: roleLookup['Gestor'],
      institution_id: institutions[0].id,
      endereco: 'Av. dos Gestores, 200',
      telefone: '(11) 97654-3210',
      school_id: null, // Gestor pode gerenciar múltiplas escolas
      is_active: true
    },
    {
      email: 'professor@sabercon.edu.br',
      password: '$2a$12$.6ZtOp3v3WcvuZsumjrK.uaAeggqhA1z5AlnKDBaXc.XdXq6dGxdK', // password123
      name: 'Ricardo Santos',
      role_id: roleLookup['Professor'],
      institution_id: institutions[0].id,
      endereco: 'Rua dos Professores, 300',
      telefone: '(11) 96543-2109',
      school_id: null, // Será definido após criar escolas
      is_active: true
    },
    {
      email: 'julia.c@ifsp.com',
      password: '$2a$12$.6ZtOp3v3WcvuZsumjrK.uaAeggqhA1z5AlnKDBaXc.XdXq6dGxdK', // password123
      name: 'Julia Costa',
      role_id: roleLookup['Aluno'],
      institution_id: institutions[0].id,
      endereco: 'Rua dos Estudantes, 400',
      telefone: '(11) 95432-1098',
      school_id: null, // Será definido após criar escolas
      is_active: true
    },
    {
      email: 'coordenador@sabercon.edu.com',
      password: '$2a$12$.6ZtOp3v3WcvuZsumjrK.uaAeggqhA1z5AlnKDBaXc.XdXq6dGxdK', // password123
      name: 'Luciana Lima',
      role_id: roleLookup['Coordenador Acadêmico'],
      institution_id: institutions[0].id,
      endereco: 'Av. da Coordenação, 500',
      telefone: '(11) 94321-0987',
      school_id: null, // Será definido após criar escolas
      is_active: true
    },
    {
      email: 'renato@gmail.com',
      password: '$2a$12$.6ZtOp3v3WcvuZsumjrK.uaAeggqhA1z5AlnKDBaXc.XdXq6dGxdK', // password123
      name: 'Renato Oliveira',
      role_id: roleLookup['Responsável'],
      institution_id: institutions[0].id,
      endereco: 'Rua dos Responsáveis, 600',
      telefone: '(11) 93210-9876',
      school_id: null, // Responsável não vinculado diretamente a escola
      is_active: true
    }
  ]).returning('*');

  // 8. Inserir escolas
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
    }
  ]).returning('*');

  // 9. Inserir ciclos educacionais
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
    }
  ]).returning('*');

  // 10. Inserir turmas
  const classes = await knex('classes').insert([
    {
      name: '5º Ano A',
      code: '5A2024',
      description: 'Turma do 5º ano do ensino fundamental',
      year: 2024,
      semester: 1,
      max_students: 30,
      current_students: 0,
      school_id: schools[0].id,
      education_cycle_id: educationCycles[0].id,
      status: 'active'
    }
  ]).returning('*');

  console.log('Dados iniciais inseridos com sucesso!');
  console.log(`- ${institutions.length} instituições`);
  console.log(`- ${permissions.length} permissões`);
  console.log(`- ${roles.length} roles`);
  console.log(`- ${rolePermissions.length} associações role-permission`);
  console.log(`- ${users.length} usuários`);
  console.log(`- ${schools.length} escolas`);
  console.log(`- ${educationCycles.length} ciclos educacionais`);
  console.log(`- ${classes.length} turmas`);
}