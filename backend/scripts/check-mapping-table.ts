import knex from 'knex';

async function checkMappingTable() {
  console.log('🔍 Verificando estrutura da tabela sabercon_migration_mapping...');
  
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
    // Verificar se a tabela existe
    const tableExists = await db.schema.hasTable('sabercon_migration_mapping');
    console.log(`📋 Tabela existe: ${tableExists}`);
    
    if (tableExists) {
      // Verificar estrutura da tabela
      const tableInfo = await db.raw(`
        SELECT 
          column_name,
          is_nullable,
          data_type,
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'sabercon_migration_mapping' 
        ORDER BY ordinal_position;
      `);
      
      console.log('🗃️  Estrutura da tabela:');
      tableInfo.rows.forEach((col: any) => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
      });
      
      // Verificar dados de exemplo
      const sampleData = await db('sabercon_migration_mapping').limit(5);
      console.log('📊 Dados de exemplo:', sampleData);
    } else {
      console.log('❌ Tabela não existe! Vou criá-la...');
      
      await db.schema.createTable('sabercon_migration_mapping', function (table) {
        table.increments('id');
        table.string('table_name').notNullable();
        table.integer('original_id').notNullable();
        table.uuid('new_id').notNullable();
        table.timestamps(true, true);
        
        table.unique(['table_name', 'original_id']);
      });
      
      console.log('✅ Tabela criada com sucesso!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error);
  } finally {
    await db.destroy();
  }
}

checkMappingTable(); 