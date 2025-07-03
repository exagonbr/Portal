import db from '../config/database';

async function checkUserSchema() {
  try {
    console.log('🔍 Verificando estrutura da tabela user...\n');
    
    // Buscar informações sobre as colunas da tabela
    const columns = await db('information_schema.columns')
      .where({
        table_schema: 'public',
        table_name: 'users'
      })
      .select('column_name', 'data_type', 'is_nullable', 'column_default')
      .orderBy('ordinal_position');
    
    if (columns.length === 0) {
      console.log('❌ Tabela users não encontrada ou sem colunas!');
    } else {
      console.log('📋 Colunas da tabela users:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
    }
    
    // Verificar se existem usuários
    console.log('\n📋 Usuários existentes:');
    const users = await db('users').select('id', 'email', 'name').limit(5);
    
    if (users.length === 0) {
      console.log('   Nenhum usuário encontrado.');
    } else {
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.name})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar schema:', error);
  } finally {
    await db.destroy();
  }
}

checkUserSchema();