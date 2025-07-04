'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function(knex) {
  // Deleta todos os registros existentes
  await knex('permissions').del();
  
  // Define as permissões por recurso
  const permissions = [];
  
  // Recursos e ações disponíveis
  const resources = [
    {
      name: 'users',
      actions: ['create', 'read', 'update', 'delete', 'list', 'manage_roles']
    },
    {
      name: 'institutions',
      actions: ['create', 'read', 'update', 'delete', 'list', 'manage']
    },
    {
      name: 'units',
      actions: ['create', 'read', 'update', 'delete', 'list']
    },
    {
      name: 'schools',
      actions: ['create', 'read', 'update', 'delete', 'list', 'manage']
    },
    {
      name: 'classes',
      actions: ['create', 'read', 'update', 'delete', 'list', 'enroll_students']
    },
    {
      name: 'courses',
      actions: ['create', 'read', 'update', 'delete', 'list', 'publish', 'manage_content']
    },
    {
      name: 'lessons',
      actions: ['create', 'read', 'update', 'delete', 'list', 'view_progress']
    },
    {
      name: 'quizzes',
      actions: ['create', 'read', 'update', 'delete', 'list', 'take', 'grade']
    },
    {
      name: 'grades',
      actions: ['create', 'read', 'update', 'delete', 'list', 'export']
    },
    {
      name: 'announcements',
      actions: ['create', 'read', 'update', 'delete', 'list', 'publish']
    },
    {
      name: 'forum',
      actions: ['create_thread', 'read', 'reply', 'moderate', 'delete']
    },
    {
      name: 'chat',
      actions: ['send', 'read', 'delete']
    },
    {
      name: 'notifications',
      actions: ['send', 'read', 'manage']
    },
    {
      name: 'books',
      actions: ['create', 'read', 'update', 'delete', 'list', 'download']
    },
    {
      name: 'videos',
      actions: ['create', 'read', 'update', 'delete', 'list', 'watch']
    },
    {
      name: 'collections',
      actions: ['create', 'read', 'update', 'delete', 'list', 'manage_items']
    },
    {
      name: 'certificates',
      actions: ['generate', 'read', 'list', 'validate']
    },
    {
      name: 'reports',
      actions: ['generate', 'read', 'export']
    },
    {
      name: 'settings',
      actions: ['read', 'update', 'manage_security']
    },
    {
      name: 'roles',
      actions: ['create', 'read', 'update', 'delete', 'list', 'assign_permissions']
    }
  ];
  
  // Gera as permissões
  let id = 1;
  resources.forEach(resource => {
    resource.actions.forEach(action => {
      permissions.push({
        id: id++,
        name: `${resource.name}.${action}`,
        resource: resource.name,
        action: action,
        description: `Permissão para ${action} em ${resource.name}`,
        created_at: new Date(),
        updated_at: new Date()
      });
    });
  });
  
  // Insere as permissões
  await knex('permissions').insert(permissions);
};