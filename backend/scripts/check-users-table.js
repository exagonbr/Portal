const knex = require('knex');
const config = require('../knexfile');

async function checkUsersTable() {
  const db = knex(config.development);
  
  try {
    console.log('🔍 Verificando estrutura da tabela users...');
    
    // Verificar se a tabela existe
    const tableExists = await db.schema.hasTable('users');
    console.log(`Tabela users existe: ${tableExists}`);
    
    if (tableExists) {
      // Verificar colunas
      const columns = await db.raw(`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📋 Colunas da tabela users:');
      columns.rows.forEach(col => {
        console.log(`  • ${col.column_name} (${col.data_type}) - Nullable: ${col.is_nullable} - Default: ${col.column_default || 'NULL'}`);
      });
      
      // Verificar alguns usuários
      const users = await db('users').select('id', 'email', 'full_name', 'enabled').limit(5);
      console.log('\n👥 Usuários existentes (primeiros 5):');
      users.forEach(user => {
        console.log(`  • ID: ${user.id} - Email: ${user.email} - Nome: ${user.full_name} - Ativo: ${user.enabled}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error.message);
  } finally {
    await db.destroy();
  }
}

checkUsersTable();