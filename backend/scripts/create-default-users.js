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
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }).returning('id');
      
      roleMap[role.name] = newRole.id || newRole;
      console.log(`   ✅ Role ${role.name} criada`);
    }
  }
  
  return roleMap;
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
    
    // Criar roles padrão
    const roleMap = await createDefaultRoles(db);
    
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