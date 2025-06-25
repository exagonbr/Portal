const { AppDataSource } = require('../dist/config/typeorm.config.js');

async function checkDatabaseTables() {
  try {
    console.log('🔍 Verificando tabelas no banco PostgreSQL...\n');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Conexão TypeORM inicializada\n');
    }

    // Verificar se as tabelas existem
    const queryRunner = AppDataSource.createQueryRunner();
    
    // Listar todas as tabelas
    const tables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tabelas encontradas no banco:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Verificar especificamente as tabelas de coleções
    const collectionTables = tables.filter(t => 
      t.table_name.includes('collection') || 
      t.table_name.includes('video') ||
      t.table_name.includes('migration')
    );
    
    console.log('\n🎬 Tabelas relacionadas a coleções de vídeos:');
    if (collectionTables.length > 0) {
      collectionTables.forEach(table => {
        console.log(`  ✅ ${table.table_name}`);
      });
    } else {
      console.log('  ❌ Nenhuma tabela de coleções encontrada');
    }
    
    // Verificar estrutura da tabela video_collections
    if (collectionTables.some(t => t.table_name === 'video_collections')) {
      console.log('\n📊 Estrutura da tabela video_collections:');
      const columns = await queryRunner.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'video_collections' 
        ORDER BY ordinal_position
      `);
      
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
      });
      
      // Contar registros
      const count = await queryRunner.query('SELECT COUNT(*) as count FROM video_collections');
      console.log(`\n📈 Registros na tabela: ${count[0].count}`);
      
      if (count[0].count > 0) {
        const samples = await queryRunner.query('SELECT id, name, synopsis, created_at FROM video_collections LIMIT 3');
        console.log('\n📄 Amostras de dados:');
        samples.forEach(sample => {
          console.log(`  - ID: ${sample.id}, Nome: ${sample.name}`);
        });
      }
    }
    
    // Verificar tabela video_modules
    if (collectionTables.some(t => t.table_name === 'video_modules')) {
      const moduleCount = await queryRunner.query('SELECT COUNT(*) as count FROM video_modules');
      console.log(`\n📹 Registros na tabela video_modules: ${moduleCount[0].count}`);
    }
    
    // Verificar tabela migration_log
    if (collectionTables.some(t => t.table_name === 'migration_log')) {
      const migrationCount = await queryRunner.query('SELECT COUNT(*) as count FROM migration_log');
      console.log(`📋 Registros na tabela migration_log: ${migrationCount[0].count}`);
    }
    
    await queryRunner.release();
    await AppDataSource.destroy();
    
    console.log('\n✅ Verificação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error.message);
    process.exit(1);
  }
}

checkDatabaseTables(); 