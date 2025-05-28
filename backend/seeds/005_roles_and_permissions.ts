import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('role_permissions').del();
  await knex('permissions').del();
  await knex('roles').del();

  // Insert permissions (without explicit IDs, let database generate UUIDs)
  const permissions = [
    // User Management
    { name: 'Criar Usuários', resource: 'users', action: 'create', description: 'Permite criar novos usuários no sistema' },
    { name: 'Visualizar Usuários', resource: 'users', action: 'read', description: 'Permite visualizar informações dos usuários' },
    { name: 'Editar Usuários', resource: 'users', action: 'update', description: 'Permite editar informações dos usuários' },
    { name: 'Excluir Usuários', resource: 'users', action: 'delete', description: 'Permite excluir usuários do sistema' },
    
    // Course Management
    { name: 'Criar Cursos', resource: 'courses', action: 'create', description: 'Permite criar novos cursos' },
    { name: 'Visualizar Cursos', resource: 'courses', action: 'read', description: 'Permite visualizar cursos' },
    { name: 'Editar Cursos', resource: 'courses', action: 'update', description: 'Permite editar cursos existentes' },
    { name: 'Excluir Cursos', resource: 'courses', action: 'delete', description: 'Permite excluir cursos' },
    
    // Content Management
    { name: 'Criar Conteúdo', resource: 'content', action: 'create', description: 'Permite criar novo conteúdo educacional' },
    { name: 'Visualizar Conteúdo', resource: 'content', action: 'read', description: 'Permite visualizar conteúdo educacional' },
    { name: 'Editar Conteúdo', resource: 'content', action: 'update', description: 'Permite editar conteúdo existente' },
    { name: 'Excluir Conteúdo', resource: 'content', action: 'delete', description: 'Permite excluir conteúdo' },
    
    // Quiz Management
    { name: 'Criar Quizzes', resource: 'quizzes', action: 'create', description: 'Permite criar quizzes e avaliações' },
    { name: 'Visualizar Quizzes', resource: 'quizzes', action: 'read', description: 'Permite visualizar quizzes' },
    { name: 'Editar Quizzes', resource: 'quizzes', action: 'update', description: 'Permite editar quizzes' },
    { name: 'Excluir Quizzes', resource: 'quizzes', action: 'delete', description: 'Permite excluir quizzes' },
    
    // Forum Management
    { name: 'Criar Tópicos no Fórum', resource: 'forum', action: 'create', description: 'Permite criar tópicos no fórum' },
    { name: 'Visualizar Fórum', resource: 'forum', action: 'read', description: 'Permite visualizar o fórum' },
    { name: 'Moderar Fórum', resource: 'forum', action: 'update', description: 'Permite moderar o fórum' },
    { name: 'Excluir Posts do Fórum', resource: 'forum', action: 'delete', description: 'Permite excluir posts do fórum' },
    
    // Reports
    { name: 'Visualizar Relatórios', resource: 'reports', action: 'read', description: 'Permite visualizar relatórios do sistema' },
    { name: 'Gerar Relatórios', resource: 'reports', action: 'create', description: 'Permite gerar novos relatórios' },
    
    // System Administration
    { name: 'Administração do Sistema', resource: 'system', action: 'update', description: 'Acesso total às configurações do sistema' },
    { name: 'Gerenciar Funções', resource: 'roles', action: 'update', description: 'Permite gerenciar funções e permissões' }
  ];

  const insertedPermissions = await knex('permissions').insert(permissions).returning('*');

  // Insert roles (without explicit IDs, let database generate UUIDs)
  const roles = [
    {
      name: 'Administrador',
      description: 'Acesso total ao sistema',
      type: 'system',
      user_count: 0,
      status: 'active'
    },
    {
      name: 'Gestor',
      description: 'Gerenciamento de cursos e usuários',
      type: 'system',
      user_count: 0,
      status: 'active'
    },
    {
      name: 'Professor',
      description: 'Ensino e avaliação de alunos',
      type: 'system',
      user_count: 0,
      status: 'active'
    },
    {
      name: 'Aluno',
      description: 'Acesso ao conteúdo educacional',
      type: 'system',
      user_count: 0,
      status: 'active'
    }
  ];

  const insertedRoles = await knex('roles').insert(roles).returning('*');

  // Create permission lookup by name and resource
  const permissionLookup = insertedPermissions.reduce((acc, perm) => {
    const key = `${perm.resource}_${perm.action}`;
    acc[key] = perm.id;
    return acc;
  }, {} as Record<string, string>);

  // Create role lookup by name
  const roleLookup = insertedRoles.reduce((acc, role) => {
    acc[role.name] = role.id;
    return acc;
  }, {} as Record<string, string>);

  // Insert role-permission relationships
  const rolePermissions = [
    // Admin - all permissions
    ...insertedPermissions.map(p => ({ 
      role_id: roleLookup['Administrador'], 
      permission_id: p.id 
    })),
    
    // Manager permissions
    { role_id: roleLookup['Gestor'], permission_id: permissionLookup['users_read'] },
    { role_id: roleLookup['Gestor'], permission_id: permissionLookup['users_update'] },
    { role_id: roleLookup['Gestor'], permission_id: permissionLookup['courses_create'] },
    { role_id: roleLookup['Gestor'], permission_id: permissionLookup['courses_read'] },
    { role_id: roleLookup['Gestor'], permission_id: permissionLookup['courses_update'] },
    { role_id: roleLookup['Gestor'], permission_id: permissionLookup['content_create'] },
    { role_id: roleLookup['Gestor'], permission_id: permissionLookup['content_read'] },
    { role_id: roleLookup['Gestor'], permission_id: permissionLookup['content_update'] },
    { role_id: roleLookup['Gestor'], permission_id: permissionLookup['reports_read'] },
    { role_id: roleLookup['Gestor'], permission_id: permissionLookup['reports_create'] },
    
    // Teacher permissions
    { role_id: roleLookup['Professor'], permission_id: permissionLookup['courses_read'] },
    { role_id: roleLookup['Professor'], permission_id: permissionLookup['content_read'] },
    { role_id: roleLookup['Professor'], permission_id: permissionLookup['content_create'] },
    { role_id: roleLookup['Professor'], permission_id: permissionLookup['content_update'] },
    { role_id: roleLookup['Professor'], permission_id: permissionLookup['quizzes_create'] },
    { role_id: roleLookup['Professor'], permission_id: permissionLookup['quizzes_read'] },
    { role_id: roleLookup['Professor'], permission_id: permissionLookup['quizzes_update'] },
    { role_id: roleLookup['Professor'], permission_id: permissionLookup['forum_create'] },
    { role_id: roleLookup['Professor'], permission_id: permissionLookup['forum_read'] },
    { role_id: roleLookup['Professor'], permission_id: permissionLookup['forum_update'] },
    { role_id: roleLookup['Professor'], permission_id: permissionLookup['reports_read'] },
    
    // Student permissions
    { role_id: roleLookup['Aluno'], permission_id: permissionLookup['courses_read'] },
    { role_id: roleLookup['Aluno'], permission_id: permissionLookup['content_read'] },
    { role_id: roleLookup['Aluno'], permission_id: permissionLookup['quizzes_read'] },
    { role_id: roleLookup['Aluno'], permission_id: permissionLookup['forum_create'] },
    { role_id: roleLookup['Aluno'], permission_id: permissionLookup['forum_read'] }
  ];

  // Filter out undefined permission IDs
  const validRolePermissions = rolePermissions.filter(rp => rp.permission_id);

  await knex('role_permissions').insert(validRolePermissions);
}
