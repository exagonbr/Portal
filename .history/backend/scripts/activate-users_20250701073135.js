const { db } = require('../src/database/connection');

async function activateUsers() {
  try {
    console.log('🔍 Verificando usuários inativos...');
    
    // Verificar usuários com enabled = false ou null
    const inactiveUsers = await db('users')
      .select('id', 'email', 'full_name', 'enabled')
      .where('enabled', false)
      .orWhereNull('enabled');
    
    console.log(`📊 Encontrados ${inactiveUsers.length} usuários inativos:`);
    inactiveUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.full_name}) - enabled: ${user.enabled}`);
    });
    
    if (inactiveUsers.length > 0) {
      console.log('\n🔧 Ativando usuários...');
      
      // Ativar todos os usuários inativos
      const updated = await db('users')
        .where('enabled', false)
        .orWhereNull('enabled')
        .update({
          enabled: true,
          last_updated: new Date()
        });
      
      console.log(`✅ ${updated} usuários foram ativados!`);
    } else {
      console.log('✅ Todos os usuários já estão ativos!');
    }
    
    // Verificar se há usuários admin
    const adminUsers = await db('users')
      .select('id', 'email', 'full_name', 'enabled', 'is_admin')
      .where('is_admin', true)
      .where('enabled', true);
    
    console.log(`\n👑 Usuários admin ativos: ${adminUsers.length}`);
    adminUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.full_name})`);
    });
    
    if (adminUsers.length === 0) {
      console.log('\n⚠️  Nenhum usuário admin ativo encontrado!');
      console.log('💡 Execute o script create-admin-user.ts para criar um admin');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await db.destroy();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  activateUsers();
}

module.exports = { activateUsers }; 