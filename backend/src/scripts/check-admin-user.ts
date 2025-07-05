import db from '../config/database';

async function checkAdminUser() {
  try {
    console.log('🔍 Verificando usuário admin...\n');
    
    // Buscar usuário admin
    const adminUser = await db('users')
      .where('email', 'admin@sabercon.edu.br')
      .first();
    
    if (adminUser) {
      console.log('✅ Usuário admin encontrado:');
      console.log(`   - ID: ${adminUser.id}`);
      console.log(`   - Nome: ${adminUser.name}`);
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - Ativo: ${adminUser.is_active ? 'Sim' : 'Não'}`);
      console.log(`   - Role ID: ${adminUser.role_id}`);
      console.log(`   - Institution ID: ${adminUser.institution_id}`);
      console.log(`   - Criado em: ${adminUser.created_at}`);
      
      // Verificar se a role existe
      if (adminUser.role_id) {
        const role = await db('roles').where('id', adminUser.role_id).first();
        if (role) {
          console.log(`   - Role: ${role.name}`);
        } else {
          console.log('   ⚠️  Role não encontrada!');
        }
      }
      
      // Verificar se a instituição existe
      if (adminUser.institution_id) {
        const institution = await db('institution').where('id', adminUser.institution_id).first();
        if (institution) {
          console.log(`   - Instituição: ${institution.name}`);
        } else {
          console.log('   ⚠️  Instituição não encontrada!');
        }
      }
    } else {
      console.log('❌ Usuário admin NÃO encontrado!');
      console.log('\n📋 Listando todos os usuários no banco:');
      
      const allUsers = await db('users').select('id', 'email', 'name', 'is_active');
      
      if (allUsers.length === 0) {
        console.log('   Nenhum usuário encontrado no banco de dados.');
      } else {
        allUsers.forEach(user => {
          console.log(`   - ${user.email} (${user.name}) - Ativo: ${user.is_active ? 'Sim' : 'Não'}`);
        });
      }
    }
    
    // Verificar se as tabelas necessárias existem
    console.log('\n🔍 Verificando estrutura do banco:');
    
    const tables = ['users', 'roles', 'institution', 'permissions', 'role_permissions'];
    for (const table of tables) {
      const exists = await db.schema.hasTable(table);
      console.log(`   - Tabela '${table}': ${exists ? '✅ Existe' : '❌ Não existe'}`);
    }
    
  } catch (error) {
    console.log('❌ Erro ao verificar usuário admin:', error);
  } finally {
    await db.destroy();
  }
}

checkAdminUser();