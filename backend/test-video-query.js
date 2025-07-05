const knex = require('knex');

// Configuração direta do banco
const db = knex({
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'portal_sabercon',
    user: process.env.DB_USER || 'portal_user',
    password: process.env.DB_PASSWORD || 'root',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  }
});

async function testVideoQuery() {
  console.log('🚀 Testando queries de vídeo...\n');

  try {
    // 1. Verificar se existem TV Shows
    console.log('📺 1. Verificando TV Shows...');
    const tvShows = await db('tv_show')
      .select('id', 'name', 'producer')
      .whereNull('deleted')
      .limit(5);
    
    console.log(`✅ Encontrados ${tvShows.length} TV Shows:`);
    tvShows.forEach(show => {
      console.log(`  - ${show.name} (ID: ${show.id})`);
    });
    
    if (tvShows.length > 0) {
      const firstShow = tvShows[0];
      
      // 2. Verificar se existem vídeos para este TV Show
      console.log(`\n🎬 2. Verificando vídeos para "${firstShow.name}" (ID: ${firstShow.id})...`);
      const videos = await db('video')
        .select('id', 'title', 'name', 'season_number', 'episode_number', 'show_id')
        .where('show_id', firstShow.id)
        .whereNull('deleted')
        .limit(10);
      
      console.log(`✅ Encontrados ${videos.length} vídeos:`);
      videos.forEach(video => {
        console.log(`  - ${video.title || video.name} (S${video.season_number}E${video.episode_number}) - ID: ${video.id}`);
      });
      
      // 3. Verificar se existem registros na tabela video_file
      console.log(`\n📁 3. Verificando tabela video_file...`);
      const videoFiles = await db('video_file')
        .select('id', 'video_files_id', 'file_id')
        .limit(10);
      
      console.log(`✅ Encontrados ${videoFiles.length} registros em video_file:`);
      videoFiles.forEach(vf => {
        console.log(`  - video_files_id: ${vf.video_files_id}, file_id: ${vf.file_id}`);
      });
      
      // 4. Verificar se existem arquivos
      console.log(`\n📄 4. Verificando tabela file...`);
      const files = await db('file')
        .select('id', 'name', 'sha256hex', 'extension', 'size')
        .limit(10);
      
      console.log(`✅ Encontrados ${files.length} arquivos:`);
      files.forEach(file => {
        console.log(`  - ${file.name || 'sem nome'} (${file.sha256hex}.${file.extension}) - ${file.size} bytes`);
      });
      
      // 5. Testar JOIN completo
      console.log(`\n🔗 5. Testando JOIN entre video, video_file e file...`);
      const joinResult = await db('video as v')
        .leftJoin('video_file as vf', 'v.id', 'vf.video_files_id')
        .leftJoin('file as f', 'vf.file_id', 'f.id')
        .select(
          'v.id as video_id',
          'v.title',
          'v.name',
          'v.season_number',
          'v.episode_number',
          'f.sha256hex',
          'f.extension',
          'f.name as file_name'
        )
        .where('v.show_id', firstShow.id)
        .whereNull('v.deleted')
        .limit(5);
      
      console.log(`✅ JOIN retornou ${joinResult.length} resultados:`);
      joinResult.forEach(result => {
        console.log(`  - Vídeo: ${result.title || result.name} (ID: ${result.video_id})`);
        console.log(`    Arquivo: ${result.sha256hex ? `${result.sha256hex}.${result.extension}` : 'SEM ARQUIVO'}`);
      });
      
      // 6. Testar query específica do repository
      console.log(`\n🎯 6. Testando query do repository...`);
      const repositoryQuery = await db('video as v')
        .leftJoin('video_file as vf', 'v.id', 'vf.video_files_id')
        .leftJoin('file as f', 'vf.file_id', 'f.id')
        .select(
          'v.id',
          'v.title',
          'v.name',
          'v.overview as description',
          'v.duration',
          'v.season_number',
          'v.episode_number',
          'v.still_path as thumbnail_url',
          'f.sha256hex as file_sha256hex',
          'f.extension as file_extension',
          'f.name as file_name',
          'f.content_type as file_mimetype',
          'f.size as file_size'
        )
        .where('v.show_id', firstShow.id)
        .whereNull('v.deleted')
        .orderBy('v.season_number')
        .orderBy('v.episode_number');
      
      console.log(`✅ Query do repository retornou ${repositoryQuery.length} vídeos`);
      
      // Agrupar por season_number
      const groupedBySeason = {};
      repositoryQuery.forEach(video => {
        const season = video.season_number || 1;
        if (!groupedBySeason[season]) {
          groupedBySeason[season] = [];
        }
        groupedBySeason[season].push(video);
      });
      
      console.log(`📊 Vídeos agrupados por sessão:`);
      Object.entries(groupedBySeason).forEach(([season, videos]) => {
        console.log(`  - Sessão ${season}: ${videos.length} vídeos`);
        videos.forEach(video => {
          console.log(`    * ${video.title || video.name} - Arquivo: ${video.file_sha256hex ? 'SIM' : 'NÃO'}`);
        });
      });
    }
    
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
    console.log('Stack:', error.stack);
  } finally {
    await db.destroy();
  }

  console.log('\n🎉 Teste concluído!');
}

// Executar teste
testVideoQuery().catch(console.error); 