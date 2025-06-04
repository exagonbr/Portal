import type { Knex } from 'knex';

/**
 * Seed para atualizar todos os usuários onde is_teacher = true para ROLE = TEACHER
 * Versão compatível com estrutura Prisma
 */

export async function seed(knex: Knex): Promise<void> {
  console.log('🔄 Iniciando seed Prisma para atualizar roles de professores...');
  
  try {
    // Verificar se as tabelas existem (usando nomes Prisma)
    const hasUsersTable = await knex.schema.hasTable('users');
    const hasRolesTable = await knex.schema.hasTable('roles');
    
    if (!hasUsersTable) {
      console.log('⚠️ Tabela users não encontrada. Pulando seed.');
      return;
    }
    
    if (!hasRolesTable) {
      console.log('⚠️ Tabela roles não encontrada. Pulando seed.');
      return;
    }
    
    // Verificar se existe a coluna is_teacher na tabela users
    const hasIsTeacherColumn = await knex.schema.hasColumn('users', 'is_teacher');
    
    if (!hasIsTeacherColumn) {
      console.log('⚠️ Coluna is_teacher não encontrada na tabela users. Pulando seed.');
      return;
    }
    
    // Buscar o role TEACHER (usando estrutura Prisma)
    let teacherRole = await knex('roles')
      .where('name', 'TEACHER')
      .first();
    
    if (!teacherRole) {
      console.log('⚠️ Role TEACHER não encontrado. Criando role...');
      
      // Gerar UUID para o novo role
      const roleId = knex.raw('gen_random_uuid()');
      
      // Criar o role TEACHER se não existir
      const [newTeacherRole] = await knex('roles').insert({
        id: roleId,
        name: 'TEACHER',
        description: 'Professor/Educador responsável pelo ensino e avaliação',
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*');
      
      teacherRole = newTeacherRole;
      console.log(`✅ Role TEACHER criado com ID: ${teacherRole.id}`);
    } else {
      console.log(`🔍 Role TEACHER encontrado com ID: ${teacherRole.id}`);
    }
    
    // Buscar todos os usuários onde is_teacher = true
    const teacherUsers = await knex('users')
      .where(function() {
        this.where('is_teacher', true)
            .orWhere('is_teacher', 1)
            .orWhere('is_teacher', '1');
      })
      .select('id', 'name', 'email', 'is_teacher', 'role_id');
    
    console.log(`🔍 Encontrados ${teacherUsers.length} usuários com is_teacher = true`);
    
    if (teacherUsers.length === 0) {
      console.log('ℹ️ Nenhum usuário com is_teacher = true encontrado.');
      return;
    }
    
    // Listar alguns exemplos dos usuários que serão atualizados
    console.log('📝 Exemplos de usuários que serão atualizados:');
    for (let i = 0; i < Math.min(5, teacherUsers.length); i++) {
      const user = teacherUsers[i];
      console.log(`   - ${user.name || user.email} (ID: ${user.id})`);
    }
    
    if (teacherUsers.length > 5) {
      console.log(`   ... e mais ${teacherUsers.length - 5} usuários`);
    }
    
    // Atualizar o roleId dos usuários para TEACHER
    let updatedCount = 0;
    
    for (const user of teacherUsers) {
      try {
        // Pular se já tem o role correto
        if (user.role_id === teacherRole.id) {
          console.log(`⏭️ Usuário ${user.name || user.email} (ID: ${user.id}) já tem role TEACHER`);
          continue;
        }
        
        await knex('users')
          .where('id', user.id)
          .update({
            role_id: teacherRole.id,
            updated_at: new Date()
          });
        
        updatedCount++;
        console.log(`✅ Usuário ${user.name || user.email} (ID: ${user.id}) atualizado para TEACHER`);
      } catch (error) {
        console.log(`❌ Erro ao atualizar usuário ${user.name || user.email} (ID: ${user.id}):`, error);
      }
    }
    
    console.log(`\n🎯 Resumo da atualização:`);
    console.log(`   - Total de usuários com is_teacher = true: ${teacherUsers.length}`);
    console.log(`   - Usuários atualizados com sucesso: ${updatedCount}`);
    console.log(`   - Usuários que já tinham role correto: ${teacherUsers.length - updatedCount}`);
    console.log(`   - Role utilizado: ${teacherRole.name} (ID: ${teacherRole.id})`);
    
    // Verificação final
    const verificationCount = await knex('users')
      .where('role_id', teacherRole.id)
      .count('id as total')
      .first();
    
    console.log(`✅ Verificação final: ${verificationCount?.total || 0} usuários têm role TEACHER`);
    
    // Verificação adicional: contar usuários com is_teacher = true que ainda não têm role TEACHER
    const pendingCount = await knex('users')
      .where(function() {
        this.where('is_teacher', true)
            .orWhere('is_teacher', 1)
            .orWhere('is_teacher', '1');
      })
      .whereNot('role_id', teacherRole.id)
      .count('id as total')
      .first();
    
    if (parseInt(pendingCount?.total as string) > 0) {
      console.log(`⚠️ Ainda existem ${pendingCount?.total} usuários com is_teacher = true que não têm role TEACHER`);
    } else {
      console.log(`✅ Todos os usuários com is_teacher = true agora têm role TEACHER`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante a execução do seed:', error);
    throw error;
  }
  
  console.log('🏁 Seed Prisma de atualização de roles de professores concluído!');
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Revertendo atualizações de roles de professores (Prisma)...');
  
  try {
    // Buscar o role STUDENT para usar como fallback
    const studentRole = await knex('roles')
      .where('name', 'STUDENT')
      .first();
    
    let fallbackRole = null;
    
    if (!studentRole) {
      console.log('⚠️ Role STUDENT não encontrado para rollback. Tentando outros roles...');
      
      // Buscar qualquer role que possa servir como fallback
      fallbackRole = await knex('roles')
        .orderBy('created_at', 'asc')
        .first();
      
      if (!fallbackRole) {
        console.log('❌ Nenhum role encontrado para rollback.');
        return;
      }
      
      console.log(`🔄 Usando role ${fallbackRole.name} como fallback`);
    }
    
    const targetRole = studentRole || fallbackRole;
    
    if (!targetRole) {
      console.log('❌ Nenhum role encontrado para rollback.');
      return;
    }
    
    // Verificar se existe a coluna is_teacher
    const hasIsTeacherColumn = await knex.schema.hasColumn('users', 'is_teacher');
    
    if (!hasIsTeacherColumn) {
      console.log('⚠️ Coluna is_teacher não encontrada para rollback.');
      return;
    }
    
    // Reverter usuários com is_teacher = true de volta para o role de fallback
    const revertCount = await knex('users')
      .where(function() {
        this.where('is_teacher', true)
            .orWhere('is_teacher', 1)
            .orWhere('is_teacher', '1');
      })
      .update({
        role_id: targetRole.id,
        updated_at: new Date()
      });
    
    console.log(`✅ ${revertCount} usuários revertidos para role ${targetRole.name}`);
    
  } catch (error) {
    console.error('❌ Erro durante o rollback:', error);
    throw error;
  }
  
  console.log('🏁 Rollback Prisma concluído!');
} 