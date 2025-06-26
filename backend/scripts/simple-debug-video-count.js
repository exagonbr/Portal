const { AppDataSource } = require('../dist/config/typeorm.config');

async function debugVideoCount() {
  try {
    console.log('🔗 Inicializando conexão com banco de dados...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    console.log('✅ Conectado ao banco de dados');
    
    // 1. Contar total de registros na tabela video
    console.log('\n📊 CONTAGEM GERAL DA TABELA VIDEO:');
    const totalVideos = await AppDataSource.query('SELECT COUNT(*) as total FROM video');
    console.log(`Total de registros na tabela video: ${totalVideos[0].total}`);
    
    // 2. Verificar valores da coluna deleted
    console.log('\n🗑️ ANÁLISE DA COLUNA DELETED:');
    const deletedAnalysis = await AppDataSource.query(`
      SELECT 
        deleted,
        COUNT(*) as count
      FROM video
      GROUP BY deleted
      ORDER BY count DESC;
    `);
    console.table(deletedAnalysis);
    
    // 3. Contar vídeos por show_id (top 10)
    console.log('\n📈 TOP 10 COLEÇÕES COM MAIS VÍDEOS:');
    const topCollections = await AppDataSource.query(`
      SELECT 
        v.show_id,
        ts.name as collection_name,
        COUNT(v.id) as video_count
      FROM video v
      LEFT JOIN tv_show ts ON v.show_id = ts.id
      WHERE (v.deleted IS NULL OR v.deleted = false)
      GROUP BY v.show_id, ts.name
      ORDER BY video_count DESC
      LIMIT 10;
    `);
    console.table(topCollections);
    
    // 4. Query exata que está sendo usada no service
    console.log('\n🔍 RESULTADO DA QUERY ATUAL DO SERVICE:');
    const serviceQuery = await AppDataSource.query(`
      SELECT 
        ts.id as tv_show_id,
        ts.name as tv_show_name,
        COALESCE(v.video_count, 0) as video_count
      FROM tv_show ts
      LEFT JOIN (
        SELECT show_id, COUNT(DISTINCT id) as video_count
        FROM video
        WHERE (deleted IS NULL OR deleted = false)
        AND show_id IS NOT NULL
        GROUP BY show_id
      ) v ON ts.id = v.show_id
      WHERE (ts.deleted IS NULL OR ts.deleted = false)
      ORDER BY v.video_count DESC NULLS LAST
      LIMIT 10;
    `);
    console.table(serviceQuery);
    
    // 5. Calcular total geral
    const totalVideoCount = serviceQuery.reduce((sum, row) => sum + parseInt(row.video_count || 0), 0);
    console.log(`\n📊 TOTAL CALCULADO: ${totalVideoCount} vídeos`);
    
    if (totalVideoCount > 100000) {
      console.log('🚨 ALERTA: Valor suspeito detectado! Investigar dados corrompidos.');
      
      // Investigar mais profundamente
      console.log('\n🔍 INVESTIGAÇÃO DETALHADA:');
      const detailedQuery = await AppDataSource.query(`
        SELECT 
          v.show_id,
          ts.name,
          COUNT(v.id) as video_count,
          MIN(v.id) as min_video_id,
          MAX(v.id) as max_video_id
                 FROM video v
         LEFT JOIN tv_show ts ON v.show_id = ts.id
         WHERE (v.deleted IS NULL OR v.deleted = false)
         AND v.show_id IS NOT NULL
        GROUP BY v.show_id, ts.name
        HAVING COUNT(v.id) > 1000
        ORDER BY video_count DESC;
      `);
      console.table(detailedQuery);
    }
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔚 Conexão fechada');
    }
  }
}

// Executar diagnóstico
debugVideoCount().catch(console.error); 