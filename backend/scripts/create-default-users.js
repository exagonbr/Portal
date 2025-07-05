#!/usr/bin/env node

/**
 * Script para criar usuários padrão no sistema
 * 
 * Este script cria usuários para todas as roles do sistema:
 * - SYSTEM_ADMIN: admin@sabercon.edu.br
 * - INSTITUTION_MANAGER: gestor@sabercon.edu.br
 * - TEACHER: professor@sabercon.edu.br
 * - STUDENT: julia.c@ifsp.com
 * - COORDINATOR: coordenador@sabercon.edu.com
 * - GUARDIAN: renato@gmail.com
 * 
 * Todos os usuários são criados com a senha: password123
 */

const knex = require('knex');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const knexConfig = require('../knexfile');
require('dotenv').config();

// Definição dos usuários padrão
const DEFAULT_USERS = [
  {
    email: 'admin@sabercon.edu.br',
    password: 'password',
    name: 'Administrador do Sistema',
    role: 'SYSTEM_ADMIN',
    isAdmin: true,
    isManager: false,
    isCoordinator: false,
    isTeacher: false,
    isStudent: false,
    isGuardian: false
  },
  {
    email: 'gestor@sabercon.edu.br',
    password: 'password',
    name: 'Gestor Institucional',
    role: 'INSTITUTION_MANAGER',
    isAdmin: false,
    isManager: true,
    isCoordinator: false,
    isTeacher: false,
    isStudent: false,
    isGuardian: false
  },
  {
    email: 'coordenador@sabercon.edu.br',
    password: 'password',
    name: 'Coordenador Acadêmico',
    role: 'COORDINATOR',
    isAdmin: false,
    isManager: false,
    isCoordinator: true,
    isTeacher: false,
    isStudent: false,
    isGuardian: false
  },
  {
    email: 'professor@sabercon.edu.br',
    password: 'password',
    name: 'Professor do Sistema',
    role: 'TEACHER',
    isAdmin: false,
    isManager: false,
    isCoordinator: false,
    isTeacher: true,
    isStudent: false,
    isGuardian: false
  },
  {
    email: 'julia.c@ifsp.com',
    password: 'password',
    name: 'Julia Costa Ferreira',
    role: 'STUDENT',
    isAdmin: false,
    isManager: false,
    isCoordinator: false,
    isTeacher: false,
    isStudent: true,
    isGuardian: false
  },
  {
    email: 'renato@gmail.com',
    password: 'password',
    name: 'Renato Oliveira Silva',
    role: 'GUARDIAN',
    isAdmin: false,
    isManager: false,
    isCoordinator: false,
    isTeacher: false,
    isStudent: false,
    isGuardian: true
  }
];

// Função para criar hash da senha
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

// Função para verificar se uma tabela existe
async function tableExists(db, tableName) {
  return db.schema.hasTable(tableName);
}

// Função para criar as tabelas necessárias se não existirem
async function createRequiredTablesIfNotExist(db) {
  console.log('🏗️ Verificando e criando tabelas necessárias...');
  
  // Criar tabela roles se não existir
  const rolesTableExists = await tableExists(db, 'roles');
  if (!rolesTableExists) {
    console.log('   📋 Criando tabela roles...');
    await db.schema.createTable('roles', (table) => {
      table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
      table.string('name', 100).unique().notNullable();
      table.string('description', 255).nullable();
      table.string('type', 50).defaultTo('system');
      table.string('status', 50).defaultTo('active');
      table.boolean('is_active').defaultTo(true);
      table.integer('user_count').defaultTo(0);
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
      
      table.index('name');
      table.index('is_active');
      table.index('status');
    });
    console.log('   ✅ Tabela roles criada!');
  } else {
    console.log('   ℹ️  Tabela roles já existe');
  }
  
  // Criar tabela permissions se não existir
  const permissionsTableExists = await tableExists(db, 'permissions');
  if (!permissionsTableExists) {
    console.log('   🔐 Criando tabela permissions...');
    await db.schema.createTable('permissions', (table) => {
      table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
      table.string('name', 100).unique().notNullable();
      table.string('description', 255).nullable();
      table.string('category', 100).nullable();
      table.string('resource', 100).nullable();
      table.string('action', 100).nullable();
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
      
      table.index('name');
      table.index('category');
      table.index('is_active');
    });
    console.log('   ✅ Tabela permissions criada!');
  } else {
    console.log('   ℹ️  Tabela permissions já existe');
  }
  
  // Criar tabela role_permissions se não existir
  const rolePermissionsTableExists = await tableExists(db, 'role_permissions');
  if (!rolePermissionsTableExists) {
    console.log('   🔗 Criando tabela role_permissions...');
    await db.schema.createTable('role_permissions', (table) => {
      table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
      table.uuid('role_id').notNullable();
      table.uuid('permission_id').notNullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
      
      table.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE');
      table.foreign('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
      table.unique(['role_id', 'permission_id']);
      
      table.index('role_id');
      table.index('permission_id');
    });
    console.log('   ✅ Tabela role_permissions criada!');
  } else {
    console.log('   ℹ️  Tabela role_permissions já existe');
  }
  
  // Criar tabela user se não existir
  const userTableExists = await tableExists(db, 'user');
  if (!userTableExists) {
    console.log('   👤 Criando tabela user...');
    await db.schema.createTable('user', (table) => {
      // Chave primária
      table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
      
      // Campos básicos
      table.string('email', 255).unique().notNullable();
      table.string('password', 255).nullable();
      table.string('name', 255).nullable();
      table.string('full_name', 255).nullable();
      table.string('username', 255).unique().nullable();
      
      // Campos de role (booleanos)
      table.boolean('is_admin').defaultTo(false);
      table.boolean('is_manager').defaultTo(false);
      table.boolean('is_coordinator').defaultTo(false);
      table.boolean('is_teacher').defaultTo(false);
      table.boolean('is_student').defaultTo(false);
      table.boolean('is_guardian').defaultTo(false);
      
      // Campos de status
      table.boolean('is_active').defaultTo(true);
      table.boolean('enabled').defaultTo(true);
      table.boolean('account_expired').defaultTo(false);
      table.boolean('account_locked').defaultTo(false);
      table.boolean('password_expired').defaultTo(false);
      table.boolean('deleted').defaultTo(false);
      table.boolean('reset_password').defaultTo(false);
      
      // Campos de relacionamento
      table.uuid('role_id').nullable();
      table.uuid('institution_id').nullable();
      
      // Campos adicionais
      table.string('address', 255).nullable();
      table.string('phone', 255).nullable();
      table.string('usuario', 255).nullable();
      table.text('endereco').nullable();
      table.string('telefone', 255).nullable();
      table.string('unidade_ensino', 255).nullable();
      
      // Timestamps
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
      table.timestamp('date_created').defaultTo(db.fn.now());
      table.timestamp('last_updated').defaultTo(db.fn.now());
      
      // Índices
      table.index('email');
      table.index('role_id');
      table.index('institution_id');
      table.index('is_active');
      
      // Foreign keys
      table.foreign('role_id').references('id').inTable('roles').onDelete('SET NULL');
      table.foreign('institution_id').references('id').inTable('institution').onDelete('SET NULL');
    });
    console.log('   ✅ Tabela user criada!');
  } else {
    console.log('   ℹ️  Tabela user já existe');
  }
}

// Função para obter colunas de uma tabela
async function getTableColumns(db, tableName) {
  const columns = await db.raw(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = ? 
    ORDER BY ordinal_position
  `, [tableName]);
  
  return columns.rows.map(row => row.column_name);
}

// Função para criar instituições padrão
async function createDefaultInstitutions(db) {
  console.log('🏢 Criando instituições padrão...');
  
  const institutionExists = await tableExists(db, 'institution');
  if (!institutionExists) {
    console.log('⚠️  Tabela institution não encontrada, criando sem referência institucional');
    return { sabercon: '', ifsp: '' };
  }
  
  // Verificar se já existem
  const existingSabercon = await db('institution')
    .where('name', 'LIKE', '%Sabercon%')
    .first();
  
  const existingIfsp = await db('institution')
    .where('name', 'LIKE', '%IFSP%')
    .first();
  
  let saberconId = existingSabercon?.id;
  let ifspId = existingIfsp?.id;
  
  if (!saberconId) {
    const [sabercon] = await db('institution').insert({
      id: uuidv4(),
      name: 'Sabercon Educacional',
      code: 'SABERCON',
      description: 'Instituição padrão Sabercon',
      type: 'private',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }).returning('id');
    
    saberconId = sabercon.id || sabercon;
    console.log('   ✅ Instituição Sabercon criada');
  }
  
  if (!ifspId) {
    const [ifsp] = await db('institution').insert({
      id: uuidv4(),
      name: 'Instituto Federal de São Paulo',
      code: 'IFSP',
      description: 'Instituto Federal de São Paulo',
      type: 'public',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }).returning('id');
    
    ifspId = ifsp.id || ifsp;
    console.log('   ✅ Instituição IFSP criada');
  }
  
  return { sabercon: saberconId, ifsp: ifspId };
}

// Função para criar permissões padrão
async function createDefaultPermissions(db) {
  console.log('🔐 Criando permissões padrão...');
  
  const permissionsExists = await tableExists(db, 'permissions');
  if (!permissionsExists) {
    console.log('⚠️  Tabela permissions não encontrada, pulando criação de permissões');
    return {};
  }
  
  const defaultPermissions = [
    // System Management
    { name: 'system.manage', description: 'Gerenciar sistema', category: 'system', resource: 'system', action: 'manage' },
    { name: 'system.view', description: 'Visualizar sistema', category: 'system', resource: 'system', action: 'view' },
    
    // Institution Management
    { name: 'institution.manage', description: 'Gerenciar instituições', category: 'institution', resource: 'institution', action: 'manage' },
    { name: 'institution.view', description: 'Visualizar instituições', category: 'institution', resource: 'institution', action: 'view' },
    
    // User Management
    { name: 'users.manage', description: 'Gerenciar usuários', category: 'users', resource: 'users', action: 'manage' },
    { name: 'users.view', description: 'Visualizar usuários', category: 'users', resource: 'users', action: 'view' },
    { name: 'users.create', description: 'Criar usuários', category: 'users', resource: 'users', action: 'create' },
    { name: 'users.edit', description: 'Editar usuários', category: 'users', resource: 'users', action: 'edit' },
    { name: 'users.delete', description: 'Excluir usuários', category: 'users', resource: 'users', action: 'delete' },
    
    // School Management
    { name: 'schools.manage', description: 'Gerenciar escolas', category: 'schools', resource: 'schools', action: 'manage' },
    { name: 'schools.view', description: 'Visualizar escolas', category: 'schools', resource: 'schools', action: 'view' },
    
    // Classes Management
    { name: 'classes.manage', description: 'Gerenciar turmas', category: 'classes', resource: 'classes', action: 'manage' },
    { name: 'classes.view', description: 'Visualizar turmas', category: 'classes', resource: 'classes', action: 'view' },
    { name: 'classes.teach', description: 'Lecionar turmas', category: 'classes', resource: 'classes', action: 'teach' },
    
    // Curriculum Management
    { name: 'curriculum.manage', description: 'Gerenciar currículo', category: 'curriculum', resource: 'curriculum', action: 'manage' },
    { name: 'curriculum.view', description: 'Visualizar currículo', category: 'curriculum', resource: 'curriculum', action: 'view' },
    
    // Grades Management
    { name: 'grades.manage', description: 'Gerenciar notas', category: 'grades', resource: 'grades', action: 'manage' },
    { name: 'grades.view', description: 'Visualizar notas', category: 'grades', resource: 'grades', action: 'view' },
    
    // Attendance Management
    { name: 'attendance.manage', description: 'Gerenciar frequência', category: 'attendance', resource: 'attendance', action: 'manage' },
    { name: 'attendance.view', description: 'Visualizar frequência', category: 'attendance', resource: 'attendance', action: 'view' },
    
    // Reports
    { name: 'reports.view', description: 'Visualizar relatórios', category: 'reports', resource: 'reports', action: 'view' },
    { name: 'reports.generate', description: 'Gerar relatórios', category: 'reports', resource: 'reports', action: 'generate' },
    
    // Materials
    { name: 'materials.manage', description: 'Gerenciar materiais', category: 'materials', resource: 'materials', action: 'manage' },
    { name: 'materials.view', description: 'Visualizar materiais', category: 'materials', resource: 'materials', action: 'view' },
    
    // Communication
    { name: 'communication.send', description: 'Enviar comunicações', category: 'communication', resource: 'communication', action: 'send' },
    { name: 'communication.view', description: 'Visualizar comunicações', category: 'communication', resource: 'communication', action: 'view' }
  ];
  
  const permissionMap = {};
  
  for (const permission of defaultPermissions) {
    const existing = await db('permissions').where('name', permission.name).first();
    
    if (existing) {
      permissionMap[permission.name] = existing.id;
    } else {
      const [newPermission] = await db('permissions').insert({
        id: uuidv4(),
        name: permission.name,
        description: permission.description,
        category: permission.category,
        resource: permission.resource,
        action: permission.action,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }).returning('id');
      
      permissionMap[permission.name] = newPermission.id || newPermission;
      console.log(`   ✅ Permissão ${permission.name} criada`);
    }
  }
  
  return permissionMap;
}

// Função para criar roles padrão
async function createDefaultRoles(db) {
  console.log('🎭 Criando roles padrão...');
  
  const rolesExists = await tableExists(db, 'roles');
  if (!rolesExists) {
    console.log('⚠️  Tabela roles não encontrada, criando usuários sem role');
    return {};
  }
  
  const defaultRoles = [
    { name: 'SYSTEM_ADMIN', description: 'Administrador do Sistema' },
    { name: 'INSTITUTION_MANAGER', description: 'Gestor Institucional' },
    { name: 'COORDINATOR', description: 'Coordenador Acadêmico' },
    { name: 'TEACHER', description: 'Professor' },
    { name: 'STUDENT', description: 'Estudante' },
    { name: 'GUARDIAN', description: 'Responsável' }
  ];
  
  const roleMap = {};
  
  for (const role of defaultRoles) {
    const existing = await db('roles').where('name', role.name).first();
    
    if (existing) {
      roleMap[role.name] = existing.id;
    } else {
      const [newRole] = await db('roles').insert({
        id: uuidv4(),
        name: role.name,
        description: role.description,
        type: 'system',
        status: 'active',
        is_active: true,
        user_count: 0,
        created_at: new Date(),
        updated_at: new Date()
      }).returning('id');
      
      roleMap[role.name] = newRole.id || newRole;
      console.log(`   ✅ Role ${role.name} criada`);
    }
  }
  
  return roleMap;
}

// Função para associar permissões às roles
async function assignPermissionsToRoles(db, roleMap, permissionMap) {
  console.log('🔗 Associando permissões às roles...');
  
  const rolePermissionsExists = await tableExists(db, 'role_permissions');
  if (!rolePermissionsExists) {
    console.log('⚠️  Tabela role_permissions não encontrada, pulando associação de permissões');
    return;
  }
  
  // Definir permissões por role
  const rolePermissions = {
    'SYSTEM_ADMIN': Object.keys(permissionMap), // SYSTEM_ADMIN tem TODAS as permissões
    'INSTITUTION_MANAGER': [
      'institution.view',
      'users.manage', 'users.view', 'users.create', 'users.edit',
      'schools.manage', 'schools.view',
      'classes.manage', 'classes.view',
      'curriculum.manage', 'curriculum.view',
      'grades.view',
      'attendance.view',
      'reports.view', 'reports.generate',
      'materials.manage', 'materials.view',
      'communication.send', 'communication.view'
    ],
    'COORDINATOR': [
      'classes.manage', 'classes.view',
      'curriculum.manage', 'curriculum.view',
      'grades.view',
      'attendance.view',
      'reports.view',
      'materials.view',
      'communication.send', 'communication.view'
    ],
    'TEACHER': [
      'classes.view', 'classes.teach',
      'curriculum.view',
      'grades.manage', 'grades.view',
      'attendance.manage', 'attendance.view',
      'materials.manage', 'materials.view',
      'communication.send', 'communication.view'
    ],
    'STUDENT': [
      'classes.view',
      'curriculum.view',
      'grades.view',
      'attendance.view',
      'materials.view',
      'communication.view'
    ],
    'GUARDIAN': [
      'grades.view',
      'attendance.view',
      'communication.view'
    ]
  };
  
  for (const [roleName, permissions] of Object.entries(rolePermissions)) {
    const roleId = roleMap[roleName];
    if (!roleId) continue;
    
    for (const permissionName of permissions) {
      const permissionId = permissionMap[permissionName];
      if (!permissionId) continue;
      
      // Verificar se a associação já existe
      const existing = await db('role_permissions')
        .where('role_id', roleId)
        .where('permission_id', permissionId)
        .first();
      
      if (!existing) {
        await db('role_permissions').insert({
          id: uuidv4(),
          role_id: roleId,
          permission_id: permissionId,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }
    
    console.log(`   ✅ Permissões associadas à role ${roleName}`);
  }
}

// Função para criar usuário em uma tabela específica
async function createUserInTable(db, tableName, user, hashedPassword, roleId, institutionId) {
  try {
    const columns = await getTableColumns(db, tableName);
    
    // Verificar se usuário já existe
    const emailColumn = columns.includes('email') ? 'email' : 
                       columns.includes('username') ? 'username' : null;
    
    if (!emailColumn) {
      console.log(`   ⚠️  Tabela ${tableName} não possui coluna de email/username`);
      return false;
    }
    
    const existingUser = await db(tableName).where(emailColumn, user.email).first();
    if (existingUser) {
      console.log(`   ⚠️  Usuário ${user.email} já existe na tabela ${tableName}`);
      return false;
    }
    
    // Preparar dados do usuário baseado nas colunas disponíveis
    const userData = {};
    
    // ID (UUID ou auto-increment)
    if (columns.includes('id')) {
      userData.id = uuidv4();
    }
    
    // Email/Username
    if (columns.includes('email')) {
      userData.email = user.email;
    }
    if (columns.includes('username')) {
      userData.username = user.email.split('@')[0];
    }
    
    // Senha
    if (columns.includes('password')) {
      userData.password = hashedPassword;
    }
    
    // Nome
    if (columns.includes('name')) {
      userData.name = user.name;
    }
    if (columns.includes('full_name')) {
      userData.full_name = user.name;
    }
    
    // Campos booleanos de role
    if (columns.includes('is_admin')) {
      userData.is_admin = user.isAdmin;
    }
    if (columns.includes('is_manager')) {
      userData.is_manager = user.isManager;
    }
    if (columns.includes('is_coordinator')) {
      userData.is_coordinator = user.isCoordinator;
    }
    if (columns.includes('is_teacher')) {
      userData.is_teacher = user.isTeacher;
    }
    if (columns.includes('is_student')) {
      userData.is_student = user.isStudent;
    }
    if (columns.includes('is_guardian')) {
      userData.is_guardian = user.isGuardian;
    }
    
    // Status
    if (columns.includes('is_active')) {
      userData.is_active = true;
    }
    if (columns.includes('enabled')) {
      userData.enabled = true;
    }
    if (columns.includes('account_expired')) {
      userData.account_expired = false;
    }
    if (columns.includes('account_locked')) {
      userData.account_locked = false;
    }
    if (columns.includes('password_expired')) {
      userData.password_expired = false;
    }
    if (columns.includes('deleted')) {
      userData.deleted = false;
    }
    if (columns.includes('reset_password')) {
      userData.reset_password = false;
    }
    
    // Relacionamentos
    if (columns.includes('role_id') && roleId) {
      userData.role_id = roleId;
    }
    if (columns.includes('institution_id') && institutionId) {
      userData.institution_id = institutionId;
    }
    
    // Timestamps
    if (columns.includes('created_at')) {
      userData.created_at = new Date();
    }
    if (columns.includes('updated_at')) {
      userData.updated_at = new Date();
    }
    if (columns.includes('date_created')) {
      userData.date_created = new Date();
    }
    if (columns.includes('last_updated')) {
      userData.last_updated = new Date();
    }
    
    // Inserir usuário
    await db(tableName).insert(userData);
    console.log(`   ✅ Usuário ${user.email} criado na tabela ${tableName}`);
    return true;
    
  } catch (error) {
    console.log(`   ❌ Erro ao criar usuário ${user.email} na tabela ${tableName}: ${error.message}`);
    return false;
  }
}

// Função principal
async function createDefaultUsers() {
  console.log('🚀 CRIANDO USUÁRIOS PADRÃO DO SISTEMA\n');
  
  let db = null;
  
  try {
    // Conectar ao banco
    console.log('🔌 Conectando ao banco de dados...');
    db = knex(knexConfig.development);
    console.log('✅ Conectado ao PostgreSQL!\n');
    
    // Criar instituições padrão
    const institutions = await createDefaultInstitutions(db);
    
    // Criar tabelas necessárias se não existirem
    await createRequiredTablesIfNotExist(db);
    
    // Criar permissões padrão
    const permissionMap = await createDefaultPermissions(db);
    
    // Criar roles padrão
    const roleMap = await createDefaultRoles(db);
    
    // Associar permissões às roles
    await assignPermissionsToRoles(db, roleMap, permissionMap);
    
    // Verificar quais tabelas de usuários existem
    const userTables = [];
    if (await tableExists(db, 'users')) {
      userTables.push('users');
    }
    if (await tableExists(db, 'user')) {
      userTables.push('user');
    }
    
    if (userTables.length === 0) {
      console.log('❌ Nenhuma tabela de usuários encontrada!');
      return;
    }
    
    console.log(`\n📋 Tabelas de usuários encontradas: ${userTables.join(', ')}`);
    
    // Criar usuários
    console.log('\n👥 Criando usuários padrão...\n');
    
    for (const user of DEFAULT_USERS) {
      console.log(`🔄 Processando usuário: ${user.email} (${user.name})`);
      
      // Hash da senha
      const hashedPassword = await hashPassword(user.password);
      
      // Determinar instituição
      let institutionId = institutions.sabercon;
      if (user.email.includes('ifsp')) {
        institutionId = institutions.ifsp;
      }
      
      // Obter role ID
      const roleId = roleMap[user.role];
      
      // Criar usuário em cada tabela
      for (const tableName of userTables) {
        await createUserInTable(db, tableName, user, hashedPassword, roleId, institutionId);
      }
      
      console.log('');
    }
    
    console.log('🎉 USUÁRIOS PADRÃO CRIADOS COM SUCESSO!\n');
    console.log('📋 Resumo:');
    console.log(`   • ${DEFAULT_USERS.length} usuários processados`);
    console.log(`   • ${userTables.length} tabela(s) de usuários atualizadas`);
    console.log(`   • ${Object.keys(institutions).length} instituições criadas/verificadas`);
    console.log(`   • ${Object.keys(roleMap).length} roles criadas/verificadas`);
    console.log('\n🔑 Credenciais de acesso:');
    
    DEFAULT_USERS.forEach(user => {
      console.log(`   • ${user.email} / ${user.password} (${user.role})`);
    });
    
    console.log('\n⚠️  Recomenda-se alterar as senhas após o primeiro login!');
    
  } catch (error) {
    console.log('\n❌ ERRO DURANTE A CRIAÇÃO DOS USUÁRIOS:');
    console.log(error.message);
    console.log('\nStack trace:');
    console.log(error.stack);
    throw error;
  } finally {
    // Fechar conexão
    if (db) {
      await db.destroy();
    }
  }
}

// Executar script se chamado diretamente
if (require.main === module) {
  createDefaultUsers()
    .then(() => {
      console.log('\n✅ Script finalizado com sucesso.');
      process.exit(0);
    })
    .catch(err => {
      console.log('\n❌ Erro fatal:', err.message);
      process.exit(1);
    });
}

module.exports = { createDefaultUsers }; 