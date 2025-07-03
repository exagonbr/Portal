const { db } = require('./dist/database/connection');

async function checkUsersTable() {
  try {
    console.log('🔍 Verificando estrutura da tabela users...');
    
    // Verificar colunas da tabela users
    const columns = await db.raw(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Colunas da tabela users:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Verificar se existe algum usuário
    const userCount = await db('users').count('* as count').first();
    console.log(`\n📊 Total de usuários: ${userCount.count}`);
    
    if (parseInt(userCount.count) > 0) {
      // Buscar alguns usuários usando apenas colunas que existem
      const users = await db('users').select('*').limit(3);
      console.log('\n👥 Primeiros usuários:');
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Email: ${user.email || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

checkUsersTable();