const { AppDataSource } = require('../dist/config/typeorm.config.js');

async function checkTvShowStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela tv_show e relações...\n');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Conexão TypeORM inicializada\n');
    }

    const queryRunner = AppDataSource.createQueryRunner();
    
    // 1. Estrutura da tabela tv_show
    console.log('📊 Estrutura da tabela tv_show:');
    const tvShowColumns = await queryRunner.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'tv_show' 
      ORDER BY ordinal_position
    `);
    
    tvShowColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });
    
    // 2. Verificar tabelas relacionadas
    console.log('\n🔗 Tabelas relacionadas encontradas:');
    const relatedTables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%tv_show%' OR table_name LIKE '%file%' OR table_name LIKE '%question%' OR table_name LIKE '%answer%')
      ORDER BY table_name
    `);
    
    relatedTables.forEach(table => {
      console.log(`  ✅ ${table.table_name}`);
    });
    
    // 3. Verificar dados de exemplo
    const tvShowCount = await queryRunner.query('SELECT COUNT(*) as count FROM tv_show');
    console.log(`\n📈 Registros na tabela tv_show: ${tvShowCount[0].count}`);
    
    if (tvShowCount[0].count > 0) {
      const samples = await queryRunner.query(`
        SELECT id, name, overview, poster_path, backdrop_path, total_load, created_at 
        FROM tv_show 
        LIMIT 3
      `);
      
      console.log('\n📄 Amostras de dados:');
      samples.forEach(sample => {
        console.log(`  - ID: ${sample.id}`);
        console.log(`    Nome: ${sample.name}`);
        console.log(`    Overview: ${sample.overview?.substring(0, 50)}...`);
        console.log(`    Poster: ${sample.poster_path || 'N/A'}`);
        console.log(`    Carga horária: ${sample.total_load || 'N/A'}`);
        console.log('');
      });
    }
    
    // 4. Verificar relações com files
    try {
      const fileRelations = await queryRunner.query(`
        SELECT COUNT(*) as count 
        FROM files f 
        INNER JOIN tv_show ts ON f.tv_show_id = ts.id
      `);
      console.log(`📁 Arquivos relacionados a tv_shows: ${fileRelations[0].count}`);
    } catch (error) {
      console.log('📁 Tabela files não encontrada ou sem relação direta');
    }
    
    // 5. Verificar relações com questions
    try {
      const questionRelations = await queryRunner.query(`
        SELECT COUNT(*) as count 
        FROM question q 
        WHERE q.tv_show_id IS NOT NULL
      `);
      console.log(`❓ Questões relacionadas a tv_shows: ${questionRelations[0].count}`);
    } catch (error) {
      console.log('❓ Tabela question não encontrada ou sem relação com tv_show');
    }
    
    await queryRunner.release();
    await AppDataSource.destroy();
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error.message);
    process.exit(1);
  }
}

checkTvShowStructure(); 