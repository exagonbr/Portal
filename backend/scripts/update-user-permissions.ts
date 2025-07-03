#!/usr/bin/env ts-node

import * as knex from 'knex';
import config from '../knexfile';

const knexConfig = config[process.env.NODE_ENV || 'development'];

console.log('🔄 ATUALIZANDO PERMISSÕES DOS USUÁRIOS');
console.log('====================================');

async function updateUserPermissions() {
  const db = knex.default(knexConfig);

  try {
    console.log('\n1️⃣ Verificando estrutura atual...');
    
    // Verificar se as tabelas existem
    const hasRoles = await db.schema.hasTable('roles');
    const hasPermissions = await db.schema.hasTable('permissions');
    const hasRolePermissions = await db.schema.hasTable('role_permissions');
    const hasUsers = await db.schema.hasTable('users');

    if (!hasRoles || !hasPermissions || !hasRolePermissions || !hasUsers) {
      throw new Error('❌ Tabelas necessárias não encontradas. Execute as migrations primeiro.');
    }

    console.log('✅ Todas as tabelas necessárias estão presentes');

    console.log('\n2️⃣ Atualizando roles com novas permissões...');
    
    // Buscar todas as roles e permissões
    const roles = await db('roles').select('*');
    const permissions = await db('permissions').select('*');
    
    const permissionMap = permissions.reduce((acc, perm) => {
      acc[perm.name] = perm.id;
      return acc;
    }, {} as Record<string, string>);

    // Definir permissões atualizadas para cada role
    const updatedRolePermissions = {
      'SYSTEM_ADMIN': [
        // ACESSO COMPLETO - Todas as permissões
        'system.manage', 'institutions.manage', 'users.manage.global', 'analytics.view.system', 'security.manage',
        'schools.manage', 'users.manage.institution', 'classes.manage', 'schedules.manage', 'analytics.view.institution',
        'cycles.manage', 'curriculum.manage', 'teachers.monitor', 'analytics.view.academic', 'departments.coordinate',
        'attendance.manage', 'grades.manage', 'lessons.manage', 'resources.upload', 'students.communicate', 'guardians.communicate',
        'schedule.view.own', 'grades.view.own', 'materials.access', 'assignments.submit', 'progress.track.own', 'teachers.message',
        'children.view.info', 'children.view.grades', 'children.view.attendance', 'announcements.receive', 'school.communicate',
        'portal.access', 'forum.access', 'chat.access', 'profile.manage'
      ],
      'INSTITUTION_MANAGER': [
        'schools.manage', 'users.manage.institution', 'classes.manage', 'schedules.manage', 'analytics.view.institution',
        'cycles.manage', 'curriculum.manage', 'teachers.monitor', 'analytics.view.academic', 'departments.coordinate',
        'students.communicate', 'guardians.communicate', 'announcements.receive',
        'portal.access', 'forum.access', 'chat.access', 'profile.manage'
      ],
      'ACADEMIC_COORDINATOR': [
        'classes.manage', 'schedules.manage', 'analytics.view.institution',
        'cycles.manage', 'curriculum.manage', 'teachers.monitor', 'analytics.view.academic', 'departments.coordinate',
        'resources.upload', 'students.communicate', 'guardians.communicate', 'teachers.message', 'announcements.receive',
        'portal.access', 'forum.access', 'chat.access', 'profile.manage'
      ],
      'TEACHER': [
        'attendance.manage', 'grades.manage', 'lessons.manage', 'resources.upload', 'students.communicate', 'guardians.communicate',
        'schedule.view.own', 'materials.access', 'teachers.message', 'announcements.receive', 'school.communicate',
        'portal.access', 'forum.access', 'chat.access', 'profile.manage'
      ],
      'STUDENT': [
        'students.communicate', 'schedule.view.own', 'grades.view.own', 'materials.access', 'assignments.submit',
        'progress.track.own', 'teachers.message', 'announcements.receive',
        'portal.access', 'forum.access', 'chat.access', 'profile.manage'
      ],
      'GUARDIAN': [
        'children.view.info', 'children.view.grades', 'children.view.attendance', 'announcements.receive', 'school.communicate',
        'portal.access', 'chat.access', 'profile.manage'
      ]
    };

    console.log('\n3️⃣ Limpando associações role-permission antigas...');
    await db('role_permissions').del();
    console.log('✅ Associações antigas removidas');

    console.log('\n4️⃣ Inserindo novas associações role-permission...');
    let totalAssociations = 0;

    for (const role of roles) {
      const rolePermissions = updatedRolePermissions[role.name as keyof typeof updatedRolePermissions];
      
      if (!rolePermissions) {
        console.log(`⚠️ Role "${role.name}" não possui permissões definidas`);
        continue;
      }

      const associations = [];
      for (const permissionName of rolePermissions) {
        const permissionId = permissionMap[permissionName];
        if (permissionId) {
          associations.push({
            role_id: role.id,
            permission_id: permissionId,
            created_at: new Date(),
            updated_at: new Date()
          });
        } else {
          console.log(`⚠️ Permissão "${permissionName}" não encontrada`);
        }
      }

      if (associations.length > 0) {
        await db('role_permissions').insert(associations);
        console.log(`✅ Role "${role.name}": ${associations.length} permissões associadas`);
        totalAssociations += associations.length;
      }
    }

    console.log('\n5️⃣ Atualizando usuários com roles corretas...');
    
    // Corrigir usuários que possam ter roles inválidas
    const usersWithoutRole = await db('users').whereNull('role_id');
    const studentRole = roles.find(r => r.name === 'STUDENT');
    
    if (usersWithoutRole.length > 0 && studentRole) {
      await db('users')
        .whereNull('role_id')
        .update({ 
          role_id: studentRole.id,
          updated_at: new Date()
        });
      console.log(`✅ ${usersWithoutRole.length} usuários sem role receberam role STUDENT`);
    }

    // Verificar se há usuários com roles que não existem mais
    const validRoleIds = roles.map(r => r.id);
    const invalidUsers = await db('users')
      .whereNotIn('role_id', validRoleIds)
      .whereNotNull('role_id');

    if (invalidUsers.length > 0 && studentRole) {
      await db('users')
        .whereNotIn('role_id', validRoleIds)
        .whereNotNull('role_id')
        .update({ 
          role_id: studentRole.id,
          updated_at: new Date()
        });
      console.log(`✅ ${invalidUsers.length} usuários com roles inválidas receberam role STUDENT`);
    }

    console.log('\n6️⃣ Atualizando contadores de usuários nas roles...');
    
    for (const role of roles) {
      const userCount = await db('users')
        .where('role_id', role.id)
        .count('* as count')
        .first();

      await db('roles')
        .where('id', role.id)
        .update({ 
          user_count: parseInt(userCount?.count as string || '0'),
          updated_at: new Date()
        });
    }

    console.log('✅ Contadores de usuários atualizados');

    console.log('\n7️⃣ Verificação final...');
    
    const finalStats = await db('roles')
      .leftJoin('role_permissions', 'roles.id', 'role_permissions.role_id')
      .leftJoin('users', 'roles.id', 'users.role_id')
      .select('roles.name')
      .count('role_permissions.permission_id as permission_count')
      .count('users.id as user_count')
      .groupBy('roles.id', 'roles.name');

    console.log('\n📊 Estatísticas finais:');
    for (const stat of finalStats) {
      console.log(`   • ${stat.name}: ${stat.permission_count} permissões, ${stat.user_count} usuários`);
    }

    await db.destroy();

    console.log('\n🎉 ATUALIZAÇÃO DE PERMISSÕES CONCLUÍDA!');
    console.log('====================================');
    console.log(`✅ ${totalAssociations} associações role-permission criadas`);
    console.log('✅ Todos os usuários possuem roles válidas');
    console.log('✅ Sistema de permissões atualizado e funcionando');

  } catch (error) {
    console.error('\n❌ ERRO DURANTE ATUALIZAÇÃO DE PERMISSÕES:', error);
    await db.destroy();
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updateUserPermissions();
}

export default updateUserPermissions; 