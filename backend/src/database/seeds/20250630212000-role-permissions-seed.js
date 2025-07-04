/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deleta TODOS os registros existentes para garantir um estado limpo.
  await knex('role_permissions').del();
  
  const now = new Date();
  
  // Primeiro, vamos buscar todas as permissões existentes
  const permissions = await knex('permissions').select('id', 'name').orderBy('id');
  
  if (permissions.length === 0) {
    console.log('⚠️  Nenhuma permissão encontrada. Execute o seed de permissions primeiro.');
    return;
  }
  
  console.log(`📋 Encontradas ${permissions.length} permissões no banco`);
  
  // Criar mapeamento de permissões por nome para facilitar a busca
  const permissionMap = {};
  permissions.forEach(p => {
    permissionMap[p.name] = p.id;
  });
  
  // Função helper para obter IDs de permissões por padrão
  const getPermissionIds = (patterns) => {
    const ids = [];
    patterns.forEach(pattern => {
      if (typeof pattern === 'string') {
        // Se é um nome exato
        if (permissionMap[pattern]) {
          ids.push(permissionMap[pattern]);
        }
      } else if (pattern instanceof RegExp) {
        // Se é uma regex
        permissions.forEach(p => {
          if (pattern.test(p.name)) {
            ids.push(p.id);
          }
        });
      }
    });
    return ids;
  };
  
  // Definir permissões por role de forma lógica
  const rolePermissions = [
    // SYSTEM_ADMIN (ID: 1) - Todas as permissões
    ...permissions.map(p => ({
      role_id: 1,
      permission_id: p.id,
      created_at: now,
      updated_at: now
    })),
    
    // INSTITUTION_MANAGER (ID: 2) - Permissões de gestão institucional
    ...getPermissionIds([
      // Users
      'users.read', 'users.update', 'users.list', 'users.manage_roles',
      // Institutions
      'institutions.read', 'institutions.update', 'institutions.list', 'institutions.manage',
      // Units
      'units.create', 'units.read', 'units.update', 'units.list',
      // Schools
      'schools.create', 'schools.read', 'schools.update', 'schools.list', 'schools.manage',
      // Classes
      'classes.create', 'classes.read', 'classes.update', 'classes.list', 'classes.enroll_students',
      // Courses
      'courses.create', 'courses.read', 'courses.update', 'courses.list', 'courses.publish', 'courses.manage_content',
      // Lessons
      'lessons.create', 'lessons.read', 'lessons.update', 'lessons.list', 'lessons.view_progress',
      // Quizzes
      'quizzes.create', 'quizzes.read', 'quizzes.update', 'quizzes.list', 'quizzes.grade',
      // Grades
      'grades.create', 'grades.read', 'grades.update', 'grades.list', 'grades.export',
      // Announcements
      'announcements.create', 'announcements.read', 'announcements.update', 'announcements.list', 'announcements.publish',
      // Forum
      'forum.create_thread', 'forum.read', 'forum.reply', 'forum.moderate',
      // Chat
      'chat.send', 'chat.read', 'chat.delete',
      // Notifications
      'notifications.send', 'notifications.read', 'notifications.manage',
      // Books
      'books.create', 'books.read', 'books.update', 'books.list', 'books.download',
      // Videos
      'videos.create', 'videos.read', 'videos.update', 'videos.list', 'videos.watch',
      // Collections
      'collections.create', 'collections.read', 'collections.update', 'collections.list', 'collections.manage_items',
      // Certificates
      'certificates.generate', 'certificates.read', 'certificates.list', 'certificates.validate',
      // Reports
      'reports.generate', 'reports.read', 'reports.export',
      // Settings
      'settings.read', 'settings.update'
    ]).map(permissionId => ({
      role_id: 2,
      permission_id: permissionId,
      created_at: now,
      updated_at: now
    })),
    
    // COORDINATOR (ID: 3) - Permissões de coordenação acadêmica
    ...getPermissionIds([
      // Users (limitado)
      'users.read', 'users.list',
      // Classes
      'classes.create', 'classes.read', 'classes.update', 'classes.list', 'classes.enroll_students',
      // Courses
      'courses.create', 'courses.read', 'courses.update', 'courses.list', 'courses.publish', 'courses.manage_content',
      // Lessons
      'lessons.create', 'lessons.read', 'lessons.update', 'lessons.list', 'lessons.view_progress',
      // Quizzes
      'quizzes.create', 'quizzes.read', 'quizzes.update', 'quizzes.list', 'quizzes.grade',
      // Grades
      'grades.create', 'grades.read', 'grades.update', 'grades.list', 'grades.export',
      // Announcements
      'announcements.create', 'announcements.read', 'announcements.update', 'announcements.list', 'announcements.publish',
      // Forum
      'forum.create_thread', 'forum.read', 'forum.reply', 'forum.moderate',
      // Chat
      'chat.send', 'chat.read',
      // Notifications
      'notifications.send', 'notifications.read',
      // Books
      'books.read', 'books.list', 'books.download',
      // Videos
      'videos.create', 'videos.read', 'videos.update', 'videos.list', 'videos.watch',
      // Collections
      'collections.read', 'collections.list',
      // Certificates
      'certificates.generate', 'certificates.read', 'certificates.list',
      // Reports
      'reports.generate', 'reports.read', 'reports.export'
    ]).map(permissionId => ({
      role_id: 3,
      permission_id: permissionId,
      created_at: now,
      updated_at: now
    })),
    
    // TEACHER (ID: 4) - Permissões de ensino
    ...getPermissionIds([
      // Users (limitado)
      'users.read', 'users.list',
      // Classes
      'classes.read', 'classes.list', 'classes.enroll_students',
      // Courses
      'courses.create', 'courses.read', 'courses.update', 'courses.list', 'courses.publish', 'courses.manage_content',
      // Lessons
      'lessons.create', 'lessons.read', 'lessons.update', 'lessons.list', 'lessons.view_progress',
      // Quizzes
      'quizzes.create', 'quizzes.read', 'quizzes.update', 'quizzes.list', 'quizzes.take', 'quizzes.grade',
      // Grades
      'grades.create', 'grades.read', 'grades.update', 'grades.list', 'grades.export',
      // Announcements
      'announcements.create', 'announcements.read', 'announcements.update', 'announcements.list', 'announcements.publish',
      // Forum
      'forum.create_thread', 'forum.read', 'forum.reply', 'forum.moderate',
      // Chat
      'chat.send', 'chat.read',
      // Notifications
      'notifications.send', 'notifications.read',
      // Books
      'books.read', 'books.list', 'books.download',
      // Videos
      'videos.create', 'videos.read', 'videos.update', 'videos.list', 'videos.watch',
      // Collections
      'collections.read', 'collections.list',
      // Certificates
      'certificates.generate', 'certificates.read', 'certificates.list',
      // Reports
      'reports.generate', 'reports.read', 'reports.export'
    ]).map(permissionId => ({
      role_id: 4,
      permission_id: permissionId,
      created_at: now,
      updated_at: now
    })),
    
    // STUDENT (ID: 5) - Permissões básicas de estudante
    ...getPermissionIds([
      // Classes
      'classes.read', 'classes.list',
      // Courses
      'courses.read', 'courses.list',
      // Lessons
      'lessons.read', 'lessons.list',
      // Quizzes
      'quizzes.read', 'quizzes.list', 'quizzes.take',
      // Grades
      'grades.read', 'grades.list',
      // Announcements
      'announcements.read', 'announcements.list',
      // Forum
      'forum.create_thread', 'forum.read', 'forum.reply',
      // Chat
      'chat.send', 'chat.read',
      // Notifications
      'notifications.read',
      // Books
      'books.read', 'books.list', 'books.download',
      // Videos
      'videos.read', 'videos.list', 'videos.watch',
      // Collections
      'collections.read', 'collections.list',
      // Certificates
      'certificates.read', 'certificates.list'
    ]).map(permissionId => ({
      role_id: 4,
      permission_id: permissionId,
      created_at: now,
      updated_at: now
    })),
    
    // STUDENT (ID: 5) - Permissões básicas de estudante
    ...getPermissionIds([
      // Classes
      'classes.read', 'classes.list',
      // Courses
      'courses.read', 'courses.list',
      // Lessons
      'lessons.read', 'lessons.list',
      // Quizzes
      'quizzes.read', 'quizzes.list', 'quizzes.take',
      // Grades
      'grades.read', 'grades.list',
      // Announcements
      'announcements.read', 'announcements.list',
      // Forum
      'forum.create_thread', 'forum.read', 'forum.reply',
      // Chat
      'chat.send', 'chat.read',
      // Notifications
      'notifications.read',
      // Books
      'books.read', 'books.list', 'books.download',
      // Videos
      'videos.read', 'videos.list', 'videos.watch',
      // Collections
      'collections.read', 'collections.list',
      // Certificates
      'certificates.read', 'certificates.list'
    ]).map(permissionId => ({
      role_id: 5,
      permission_id: permissionId,
      created_at: now,
      updated_at: now
    })),
    
    // GUARDIAN (ID: 6) - Permissões de responsável
    ...getPermissionIds([
      // Classes
      'classes.read', 'classes.list',
      // Courses
      'courses.read', 'courses.list',
      // Lessons
      'lessons.read', 'lessons.list', 'lessons.view_progress',
      // Grades
      'grades.read', 'grades.list',
      // Announcements
      'announcements.read', 'announcements.list',
      // Forum
      'forum.read',
      // Chat
      'chat.send', 'chat.read',
      // Notifications
      'notifications.read',
      // Books
      'books.read', 'books.list',
      // Videos
      'videos.read', 'videos.list',
      // Collections
      'collections.read', 'collections.list',
      // Certificates
      'certificates.read', 'certificates.list',
      // Reports
      'reports.read'
    ]).map(permissionId => ({
      role_id: 6,
      permission_id: permissionId,
      created_at: now,
      updated_at: now
    }))
  ];
  
  // Filtrar permissões válidas (remover undefined)
  const validRolePermissions = rolePermissions.filter(rp => rp.permission_id !== undefined);
  
  // Adicionar IDs sequenciais
  validRolePermissions.forEach((rp, index) => {
    rp.id = index + 1;
  });
  
  if (validRolePermissions.length === 0) {
    console.log('⚠️  Nenhuma permissão válida encontrada para inserir.');
    return;
  }
  
  await knex('role_permissions').insert(validRolePermissions);
  
  console.log('✅ Permissões de roles criadas com sucesso!');
  console.log(`📊 Total de ${validRolePermissions.length} relacionamentos role-permission criados`);
  
  // Log detalhado por role
  const roleNames = {1: 'SYSTEM_ADMIN', 2: 'INSTITUTION_MANAGER', 3: 'COORDINATOR', 4: 'TEACHER', 5: 'STUDENT', 6: 'GUARDIAN'};
  Object.keys(roleNames).forEach(roleId => {
    const count = validRolePermissions.filter(rp => rp.role_id == roleId).length;
    console.log(`   - ${roleNames[roleId]}: ${count} permissões`);
  });
};