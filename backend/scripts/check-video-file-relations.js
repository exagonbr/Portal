const { AppDataSource } = require('../src/config/typeorm.config.ts');

async function checkVideoFileRelations() {
  console.log('🔍 Verificando relações entre video, video_file e file...\n');

  try {
    // Inicializar conexão com o banco
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Conexão com o banco inicializada');
    }

    // 1. Verificar se existem registros na tabela video
    console.log('\n📊 1. Verificando tabela video...');
    const videoCount = await AppDataSource.query('SELECT COUNT(*) as count FROM video');
    console.log(`📹 Total de vídeos: ${videoCount[0].count}`);

    // 2. Verificar se existem registros na tabela video_file
    console.log('\n📊 2. Verificando tabela video_file...');
    const videoFileCount = await AppDataSource.query('SELECT COUNT(*) as count FROM video_file');
    console.log(`🔗 Total de video_file: ${videoFileCount[0].count}`);

    // 3. Verificar se existem registros na tabela file
    console.log('\n📊 3. Verificando tabela file...');
    const fileCount = await AppDataSource.query('SELECT COUNT(*) as count FROM file');
    console.log(`📄 Total de files: ${fileCount[0].count}`);

    // 4. Verificar estrutura da tabela video_file
    console.log('\n🔍 4. Estrutura da tabela video_file...');
    const videoFileStructure = await AppDataSource.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'video_file' 
      ORDER BY ordinal_position
    `);
    console.log('📋 Colunas da tabela video_file:');
    videoFileStructure.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });

    // 5. Verificar alguns registros de exemplo
    if (videoFileCount[0].count > 0) {
      console.log('\n📋 5. Exemplos de registros video_file...');
      const sampleVideoFiles = await AppDataSource.query('SELECT * FROM video_file LIMIT 5');
      sampleVideoFiles.forEach((vf, index) => {
        console.log(`   ${index + 1}. video_id: ${vf.video_id}, file_id: ${vf.file_id}`);
      });
    }

    // 6. Verificar se existem files com sha256hex e extension
    console.log('\n📊 6. Verificando files com sha256hex e extension...');
    const filesWithHash = await AppDataSource.query(`
      SELECT COUNT(*) as count 
      FROM file 
      WHERE sha256hex IS NOT NULL 
        AND sha256hex != '' 
        AND extension IS NOT NULL 
        AND extension != ''
    `);
    console.log(`📄 Files com sha256hex e extension: ${filesWithHash[0].count}`);

    // 7. Verificar exemplos de files
    if (filesWithHash[0].count > 0) {
      console.log('\n📋 7. Exemplos de files com hash...');
      const sampleFiles = await AppDataSource.query(`
        SELECT id, filename, sha256hex, extension, mimetype, size
        FROM file 
        WHERE sha256hex IS NOT NULL 
          AND extension IS NOT NULL 
        LIMIT 3
      `);
      sampleFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ID: ${file.id}`);
        console.log(`      📄 Nome: ${file.filename}`);
        console.log(`      🔗 Hash: ${file.sha256hex}`);
        console.log(`      📝 Extensão: ${file.extension}`);
        console.log(`      🎭 Tipo: ${file.mimetype}`);
        console.log(`      📏 Tamanho: ${file.size ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}`);
        console.log('');
      });
    }

    // 8. Testar a query completa com JOINs
    console.log('\n🔗 8. Testando query com JOINs...');
    const testQuery = `
      SELECT 
        v.id,
        v.title,
        v.name,
        v.show_id,
        v.season_number,
        v.episode_number,
        f.sha256hex,
        f.extension,
        f.filename,
        f.mimetype,
        f.size
      FROM video v
      LEFT JOIN video_file vf ON v.id = vf.video_id
      LEFT JOIN file f ON vf.file_id = f.id
      WHERE f.sha256hex IS NOT NULL 
        AND f.extension IS NOT NULL
      LIMIT 5
    `;
    
    const joinResults = await AppDataSource.query(testQuery);
    console.log(`📊 Resultados da query com JOINs: ${joinResults.length}`);
    
    joinResults.forEach((result, index) => {
      console.log(`   ${index + 1}. Vídeo: ${result.title || result.name}`);
      console.log(`      📍 ID: ${result.id}, Show: ${result.show_id}`);
      console.log(`      📄 Arquivo: ${result.sha256hex}.${result.extension}`);
      console.log(`      🔗 URL seria: https://d26a2wm7tuz2gu.cloudfront.net/upload/${result.sha256hex}${result.extension.toLowerCase()}`);
      console.log('');
    });

    // 9. Verificar se existem vídeos de um TV Show específico
    console.log('\n🎯 9. Verificando vídeos do primeiro TV Show...');
    const firstShow = await AppDataSource.query('SELECT id, name FROM tv_show LIMIT 1');
    if (firstShow.length > 0) {
      const showId = firstShow[0].id;
      console.log(`🎬 Testando TV Show: "${firstShow[0].name}" (ID: ${showId})`);
      
      const showVideos = await AppDataSource.query(`
        SELECT 
          v.id,
          v.title,
          v.name,
          v.season_number,
          v.episode_number,
          f.sha256hex,
          f.extension
        FROM video v
        LEFT JOIN video_file vf ON v.id = vf.video_id
        LEFT JOIN file f ON vf.file_id = f.id
        WHERE v.show_id = $1
          AND (v.deleted IS NULL OR v.deleted = false)
        ORDER BY v.season_number ASC, v.episode_number ASC
      `, [showId]);
      
      console.log(`📊 Vídeos encontrados para este show: ${showVideos.length}`);
      const videosWithFiles = showVideos.filter(v => v.sha256hex && v.extension);
      console.log(`📄 Vídeos com arquivos: ${videosWithFiles.length}`);
    }

  } catch (error) {
    console.log('❌ Erro na verificação:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\n🔌 Conexão com o banco fechada');
    }
  }

  console.log('\n🎉 Verificação de relações concluída!');
}

checkVideoFileRelations(); 