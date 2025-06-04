import type { Knex } from 'knex';

/**
 * Seed para atualizar todos os usuários onde is_teacher = true para ROLE = TEACHER
 * Criado automaticamente baseado nos dados do sistema
 */

export async function seed(knex: Knex): Promise<void> {
  console.log('🔄 Iniciando seed para atualizar roles de professores...');
  
  try {
    // Verificar se as tabelas e colunas necessárias existem
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
    
    // Verificar se existe a coluna is_teacher
    const hasIsTeacherColumn = await knex.schema.hasColumn('users', 'is_teacher');
    
    if (!hasIsTeacherColumn) {
      console.log('⚠️ Coluna is_teacher não encontrada. Pulando seed.');
      return;
    }
    
    // Buscar o ID do role TEACHER
    const teacherRole = await knex('roles')
      .where('name', 'TEACHER')
      .orWhere('authority', 'ROLE_IS_TEACHER')
      .orWhere('authority', 'TEACHER')
      .first();
    
    if (!teacherRole) {
      console.log('⚠️ Role TEACHER não encontrado. Criando role...');
      
      // Criar o role TEACHER se não existir
      const [newTeacherRole] = await knex('roles').insert({
        name: 'TEACHER',
        description: 'Professor/Educador do sistema',
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*');
      
      console.log(`✅ Role TEACHER criado com ID: ${newTeacherRole.id}`);
    }
    
    // Buscar novamente o role TEACHER
    const finalTeacherRole = await knex('roles')
      .where('name', 'TEACHER')
      .orWhere('authority', 'ROLE_IS_TEACHER')
      .orWhere('authority', 'TEACHER')
      .first();
    
    if (!finalTeacherRole) {
      console.log('❌ Não foi possível encontrar ou criar o role TEACHER.');
      return;
    }
    
    console.log(`🔍 Role TEACHER encontrado com ID: ${finalTeacherRole.id}`);
    
    // Buscar todos os usuários onde is_teacher = true
    const teacherUsers = await knex('users')
      .where('is_teacher', true)
      .orWhere('is_teacher', 1)
      .select('id', 'name', 'email', 'is_teacher');
    
    console.log(`🔍 Encontrados ${teacherUsers.length} usuários com is_teacher = true`);
    
    if (teacherUsers.length === 0) {
      console.log('ℹ️ Nenhum usuário com is_teacher = true encontrado.');
      return;
    }
    
    // Atualizar o role_id dos usuários para TEACHER
    let updatedCount = 0;
    
    for (const user of teacherUsers) {
      try {
        await knex('users')
          .where('id', user.id)
          .update({
            role_id: finalTeacherRole.id,
            updated_at: new Date()
          });
        
        updatedCount++;
        console.log(`✅ Usuário ${user.name || user.email} (ID: ${user.id}) atualizado para TEACHER`);
      } catch (error) {
        console.log(`❌ Erro ao atualizar usuário ${user.name || user.email} (ID: ${user.id}):`, error);
      }
    }
    
    console.log(`🎯 Resumo da atualização:`);
    console.log(`   - Total de usuários com is_teacher = true: ${teacherUsers.length}`);
    console.log(`   - Usuários atualizados com sucesso: ${updatedCount}`);
    console.log(`   - Role utilizado: ${finalTeacherRole.name || finalTeacherRole.authority} (ID: ${finalTeacherRole.id})`);
    
    // Verificação final
    const verificationCount = await knex('users')
      .where('role_id', finalTeacherRole.id)
      .count('id as total')
      .first();
    
    console.log(`✅ Verificação: ${verificationCount?.total || 0} usuários têm role TEACHER`);
    
  } catch (error) {
    console.error('❌ Erro durante a execução do seed:', error);
    throw error;
  }
  
  console.log('🏁 Seed de atualização de roles de professores concluído!');
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Revertendo atualizações de roles de professores...');
  
  try {
    // Buscar o role STUDENT para usar como fallback
    const studentRole = await knex('roles')
      .where('name', 'STUDENT')
      .orWhere('authority', 'ROLE_IS_STUDENT')
      .orWhere('authority', 'STUDENT')
      .first();
    
    if (!studentRole) {
      console.log('⚠️ Role STUDENT não encontrado para rollback.');
      return;
    }
    
    // Verificar se existe a coluna is_teacher
    const hasIsTeacherColumn = await knex.schema.hasColumn('users', 'is_teacher');
    
    if (!hasIsTeacherColumn) {
      console.log('⚠️ Coluna is_teacher não encontrada para rollback.');
      return;
    }
    
    // Reverter usuários com is_teacher = true de volta para STUDENT
    const revertCount = await knex('users')
      .where('is_teacher', true)
      .orWhere('is_teacher', 1)
      .update({
        role_id: studentRole.id,
        updated_at: new Date()
      });
    
    console.log(`✅ ${revertCount} usuários revertidos para role STUDENT`);
    
  } catch (error) {
    console.error('❌ Erro durante o rollback:', error);
    throw error;
  }
  
  console.log('🏁 Rollback concluído!');
} 