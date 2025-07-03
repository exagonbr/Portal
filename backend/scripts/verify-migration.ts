import knex from 'knex';
import knexConfig from '../knexfile.js';

async function verifyMigration() {
  const pg = knex(knexConfig.development);
  
  try {
    console.log('🔍 Verificando migração MySQL → PostgreSQL\n');

    // 1. Verificar role TEACHER
    const teacherRole = await pg('roles').where('name', 'TEACHER').first();
    if (teacherRole) {
      console.log('✅ Role TEACHER encontrada');
      
      // Contar usuários com role TEACHER
      const teacherCount = await pg('users')
        .where('role_id', teacherRole.id)
        .count('* as count')
        .first();
      
      console.log(`   📊 ${teacherCount?.count || 0} usuários com role TEACHER`);
    } else {
      console.log('❌ Role TEACHER não encontrada');
    }

    // 2. Verificar instituição padrão
    const defaultInstitution = await pg('institution')
      .where('code', 'MYSQL_MIGRATED')
      .first();
    
    if (defaultInstitution) {
      console.log('✅ Instituição padrão encontrada');
      console.log(`   📍 ${defaultInstitution.name}`);
    } else {
      console.log('❌ Instituição padrão não encontrada');
    }

    // 3. Verificar escola padrão
    const defaultSchool = await pg('schools')
      .where('code', 'MYSQL_MIGRATED_SCHOOL')
      .first();
    
    if (defaultSchool) {
      console.log('✅ Escola padrão encontrada');
      console.log(`   🏫 ${defaultSchool.name}`);
    } else {
      console.log('❌ Escola padrão não encontrada');
    }

    // 4. Estatísticas gerais
    console.log('\n📊 Estatísticas do banco:');
    
    const userCount = await pg('users').count('* as count').first();
    console.log(`   👥 ${userCount?.count || 0} usuários total`);
    
    const institutionCount = await pg('institution').count('* as count').first();
    console.log(`   🏢 ${institutionCount?.count || 0} instituições`);
    
    const schoolCount = await pg('schools').count('* as count').first();
    console.log(`   🏫 ${schoolCount?.count || 0} escolas`);
    
    const fileCount = await pg('files').count('* as count').first();
    console.log(`   📁 ${fileCount?.count || 0} arquivos`);
    
    const collectionCount = await pg('collections').count('* as count').first();
    console.log(`   📚 ${collectionCount?.count || 0} coleções`);

    // 5. Verificar permissões
    if (teacherRole) {
      const permissionCount = await pg('role_permissions')
        .where('role_id', teacherRole.id)
        .count('* as count')
        .first();
      
      console.log(`   🔐 ${permissionCount?.count || 0} permissões para TEACHER`);
    }

    // 6. Verificar usuários ativos
    const activeUserCount = await pg('users')
      .where('is_active', true)
      .count('* as count')
      .first();
    
    console.log(`   ✅ ${activeUserCount?.count || 0} usuários ativos`);

    console.log('\n🎉 VERIFICAÇÃO CONCLUÍDA!');
    console.log('==========================================');
    
    if (teacherRole && defaultInstitution && defaultSchool) {
      console.log('✅ Migração realizada com sucesso');
      console.log('✅ Estrutura básica configurada');
      console.log('✅ Sistema pronto para uso');
    } else {
      console.log('⚠️ Alguns elementos básicos estão faltando');
      console.log('💡 Execute o seed de preparação novamente');
    }

  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    throw error;
  } finally {
    await pg.destroy();
  }
}

if (require.main === module) {
  verifyMigration().catch(console.error);
}

export default verifyMigration; 