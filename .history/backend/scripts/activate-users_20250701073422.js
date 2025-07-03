const knex = require('knex');
const path = require('path');

// Configuração do banco baseada no knexfile
const knexConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'portal_db'
  },
  pool: {
    min: 2,
    max: 10
  }
};

const db = knex(knexConfig);

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