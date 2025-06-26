const db = require('../src/config/database');

async function checkVideoFileRelations() {
  console.log('🔍 Verificando relações entre video, video_file e file...\n');

  try {
    // 1. Verificar se existem registros na tabela video
    console.log('📊 1. Verificando tabela video...');
    const videoCount = await db('video').count('* as count').first();
    console.log(`📹 Total de vídeos: ${videoCount.count}`);

    // 2. Verificar se existem registros na tabela video_file
    console.log('\n📊 2. Verificando tabela video_file...');
    try {
      const videoFileCount = await db('video_file').count('* as count').first();
      console.log(`🔗 Total de video_file: ${videoFileCount.count}`);
    } catch (error) {
      console.log(`❌ Erro ao acessar video_file: ${error.message}`);
      console.log('💡 A tabela video_file pode não existir');
    }

    // 3. Verificar se existem registros na tabela file
    console.log('\n📊 3. Verificando tabela file...');
    try {
      const fileCount = await db('file').count('* as count').first();
      console.log(`📄 Total de files: ${fileCount.count}`);
    } catch (error) {
      console.log(`❌ Erro ao acessar file: ${error.message}`);
      console.log('💡 A tabela file pode não existir');
    }

    // 4. Verificar estrutura da tabela video
    console.log('\n🔍 4. Estrutura da tabela video...');
    const videoStructure = await db.raw(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'video' 
      ORDER BY ordinal_position
    `);
    console.log('📋 Colunas da tabela video:');
    videoStructure[0].forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });

    // 5. Verificar alguns vídeos de exemplo
    console.log('\n📋 5. Exemplos de vídeos...');
    const sampleVideos = await db('video').select('*').limit(3);
    sampleVideos.forEach((video, index) => {
      console.log(`   ${index + 1}. ID: ${video.id}, Show: ${video.show_id}`);
      console.log(`      📄 Título: ${video.title || video.name || 'Sem título'}`);
      console.log(`      🏷️ Sessão: ${video.season_number || 'N/A'}`);
      console.log(`      🔢 Episódio: ${video.episode_number || 'N/A'}`);
      console.log('');
    });

    // 6. Verificar se existe alguma coluna relacionada a arquivo nos vídeos
    console.log('\n🔍 6. Verificando colunas relacionadas a arquivo na tabela video...');
    const videoWithFileColumns = await db('video').select('*').first();
    if (videoWithFileColumns) {
      const fileRelatedColumns = Object.keys(videoWithFileColumns).filter(key => 
        key.includes('file') || key.includes('url') || key.includes('path') || key.includes('sha256')
      );
      console.log('📋 Colunas relacionadas a arquivo encontradas:');
      fileRelatedColumns.forEach(col => {
        console.log(`   - ${col}: ${videoWithFileColumns[col] || 'null'}`);
      });
    }

    // 7. Tentar verificar se existe tabela video_file com diferentes abordagens
    console.log('\n🔍 7. Verificando existência da tabela video_file...');
    try {
      const tableExists = await db.raw(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name LIKE '%video%file%'
      `);
      console.log('📋 Tabelas encontradas com "video" e "file":');
      tableExists[0].forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    } catch (error) {
      console.log(`❌ Erro ao verificar tabelas: ${error.message}`);
    }

    // 8. Verificar todas as tabelas do banco
    console.log('\n🔍 8. Listando todas as tabelas do banco...');
    try {
      const allTables = await db.raw(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
        ORDER BY table_name
      `);
      console.log('📋 Todas as tabelas do banco:');
      allTables[0].forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    } catch (error) {
      console.log(`❌ Erro ao listar tabelas: ${error.message}`);
    }

    // 9. Verificar vídeos de um TV Show específico
    console.log('\n🎯 9. Verificando vídeos do primeiro TV Show...');
    const firstShow = await db('tv_show').select('id', 'name').first();
    if (firstShow) {
      console.log(`🎬 Testando TV Show: "${firstShow.name}" (ID: ${firstShow.id})`);
      
      const showVideos = await db('video')
        .select('*')
        .where('show_id', firstShow.id)
        .whereNull('deleted')
        .orWhere('deleted', false)
        .orderBy('season_number')
        .orderBy('episode_number');
      
      console.log(`📊 Vídeos encontrados para este show: ${showVideos.length}`);
      
      if (showVideos.length > 0) {
        console.log('\n📋 Estrutura dos vídeos deste show:');
        showVideos.slice(0, 2).forEach((video, index) => {
          console.log(`   ${index + 1}. ${video.title || video.name}`);
          console.log(`      📍 ID: ${video.id}`);
          console.log(`      🏷️ Sessão: ${video.season_number || 'N/A'}`);
          console.log(`      🔢 Episódio: ${video.episode_number || 'N/A'}`);
          console.log(`      🎬 Campos disponíveis: ${Object.keys(video).join(', ')}`);
          console.log('');
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  } finally {
    await db.destroy();
    console.log('\n🔌 Conexão com o banco fechada');
  }

  console.log('\n🎉 Verificação de relações concluída!');
}

checkVideoFileRelations(); 