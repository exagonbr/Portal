const { AppDataSource } = require('./dist/config/typeorm.config.js');

async function checkUsersTable() {
  try {
    console.log('🔍 Verificando tabela users...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    // Verificar se a tabela users existe
    const tables = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%user%'
      ORDER BY table_name;
    `);
    
    console.log('📋 Tabelas encontradas:', tables);
    
    // Verificar especificamente a tabela users
    const usersExists = await AppDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    console.log('✅ Tabela users existe:', usersExists[0].exists);
    
    if (usersExists[0].exists) {
      // Verificar estrutura da tabela
      const columns = await AppDataSource.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);
      
      console.log('📊 Colunas da tabela users:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

checkUsersTable(); 