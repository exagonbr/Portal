'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function(knex) {
  // Busca os roles e permissões
  const roles = await knex('roles').select('id', 'name');
  const permissions = await knex('permissions').select('id', 'name');
  
  if (roles.length === 0 || permissions.length === 0) {
    console.log('Roles ou permissões não encontrados. Pulando seed de role_permissions.');
    return;
  }
  
  // Deleta todos os registros existentes
  await knex('role_permissions').del();
  
  // Cria um mapa de permissões por nome
  const permissionMap = {};
  permissions.forEach(p => {
    permissionMap[p.name] = p.id;
  });
  
  // Cria um mapa de roles por nome
  const roleMap = {};
  roles.forEach(r => {
    roleMap[r.name] = r.id;
  });
  
  // Define as permissões por papel
  const rolePermissions = [];
  
  // Super Admin - Todas as permissões
  if (roleMap['Super Admin']) {
    permissions.forEach(permission => {
      rolePermissions.push({
        role_id: roleMap['Super Admin'],
        permission_id: permission.id,
        created_at: new Date(),
        updated_at: new Date()
      });
    });
  }
  
  // Admin - Quase todas as permissões (exceto gerenciar roles e segurança)
  if (roleMap['Admin']) {
    const adminPermissions = permissions.filter(p => 
      !p.name.includes('roles.') && 
      !p.name.includes('settings.manage_security')
    );
    
    adminPermissions.forEach(permission => {
      rolePermissions.push({
        role_id: roleMap['Admin'],
        permission_id: permission.id,
        created_at: new Date(),
        updated_at: new Date()
      });
    });
  }
  
  // Coordenador
  if (roleMap['Coordenador']) {
    const coordPermissions = [
      'users.read', 'users.list', 'users.update',
      'classes.create', 'classes.read', 'classes.update', 'classes.list', 'classes.enroll_students',
      'courses.create', 'courses.read', 'courses.update', 'courses.list', 'courses.publish', 'courses.manage_content',
      'lessons.create', 'lessons.read', 'lessons.update', 'lessons.list', 'lessons.view_progress',
      'quizzes.create', 'quizzes.read', 'quizzes.update', 'quizzes.list', 'quizzes.grade',
      'grades.read', 'grades.list', 'grades.export',
      'announcements.create', 'announcements.read', 'announcements.update', 'announcements.list', 'announcements.publish',
      'forum.read', 'forum.moderate',
      'reports.generate', 'reports.read', 'reports.export',
      'books.read', 'books.list',
      'videos.read', 'videos.list'
    ];
    
    coordPermissions.forEach(permName => {
      if (permissionMap[permName]) {
        rolePermissions.push({
          role_id: roleMap['Coordenador'],
          permission_id: permissionMap[permName],
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });
  }
  
  // Professor
  if (roleMap['Professor']) {
    const teacherPermissions = [
      'users.read',
      'classes.read', 'classes.list',
      'courses.read', 'courses.list',
      'lessons.create', 'lessons.read', 'lessons.update', 'lessons.list', 'lessons.view_progress',
      'quizzes.create', 'quizzes.read', 'quizzes.update', 'quizzes.list', 'quizzes.grade',
      'grades.create', 'grades.read', 'grades.update', 'grades.list',
      'announcements.create', 'announcements.read', 'announcements.update', 'announcements.list',
      'forum.create_thread', 'forum.read', 'forum.reply',
      'chat.send', 'chat.read',
      'notifications.read',
      'books.read', 'books.list',
      'videos.read', 'videos.list',
      'collections.create', 'collections.read', 'collections.update', 'collections.list'
    ];
    
    teacherPermissions.forEach(permName => {
      if (permissionMap[permName]) {
        rolePermissions.push({
          role_id: roleMap['Professor'],
          permission_id: permissionMap[permName],
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });
  }
  
  // Aluno
  if (roleMap['Aluno']) {
    const studentPermissions = [
      'users.read',
      'classes.read',
      'courses.read', 'courses.list',
      'lessons.read', 'lessons.list',
      'quizzes.read', 'quizzes.take',
      'grades.read',
      'announcements.read', 'announcements.list',
      'forum.create_thread', 'forum.read', 'forum.reply',
      'chat.send', 'chat.read',
      'notifications.read',
      'books.read', 'books.list', 'books.download',
      'videos.read', 'videos.list', 'videos.watch',
      'collections.read', 'collections.list',
      'certificates.read'
    ];
    
    studentPermissions.forEach(permName => {
      if (permissionMap[permName]) {
        rolePermissions.push({
          role_id: roleMap['Aluno'],
          permission_id: permissionMap[permName],
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });
  }
  
  // Responsável
  if (roleMap['Responsável']) {
    const guardianPermissions = [
      'users.read',
      'classes.read',
      'courses.read',
      'lessons.read',
      'grades.read',
      'announcements.read', 'announcements.list',
      'forum.read',
      'chat.send', 'chat.read',
      'notifications.read',
      'reports.read',
      'certificates.read'
    ];
    
    guardianPermissions.forEach(permName => {
      if (permissionMap[permName]) {
        rolePermissions.push({
          role_id: roleMap['Responsável'],
          permission_id: permissionMap[permName],
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });
  }
  
  // Gestor
  if (roleMap['Gestor']) {
    const managerPermissions = [
      'users.create', 'users.read', 'users.update', 'users.list',
      'institutions.read', 'institutions.update',
      'units.create', 'units.read', 'units.update', 'units.list',
      'schools.read', 'schools.update', 'schools.list',
      'classes.read', 'classes.list',
      'courses.read', 'courses.list',
      'grades.read', 'grades.list', 'grades.export',
      'announcements.create', 'announcements.read', 'announcements.update', 'announcements.list', 'announcements.publish',
      'reports.generate', 'reports.read', 'reports.export',
      'settings.read'
    ];
    
    managerPermissions.forEach(permName => {
      if (permissionMap[permName]) {
        rolePermissions.push({
          role_id: roleMap['Gestor'],
          permission_id: permissionMap[permName],
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });
  }
  
  // Insere as associações de permissões
  if (rolePermissions.length > 0) {
    await knex('role_permissions').insert(rolePermissions);
  }
};