import knex from 'knex';

async function checkQuestionsTable() {
  console.log('🔍 Verificando estrutura da tabela questions...');
  
  const db = knex({
    client: 'postgresql',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'portal_sabercon',
      user: 'postgres',
      password: 'root'
    }
  });
  
  try {
    // Verificar estrutura da tabela
    const tableInfo = await db.raw(`
      SELECT 
        column_name,
        is_nullable,
        data_type,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'questions' 
      ORDER BY ordinal_position;
    `);
    
    console.log('🗃️  Estrutura da tabela questions:');
    tableInfo.rows.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error);
  } finally {
    await db.destroy();
  }
}

checkQuestionsTable(); 