const { AppDataSource } = require('./src/config/database');

async function testTvShowsDirectly() {
  console.log('🚀 Testando TV Shows diretamente no banco...\n');

  try {
    // Conectar ao banco
    const knex = AppDataSource;
    
    // 1. Testar query básica de TV Shows
    console.log('📋 1. Testando query básica de TV Shows...');
    const tvShows = await knex('tv_show')
      .select('id', 'name', 'producer', 'total_load')
      .whereNull('deleted')
      .limit(3);
    
    console.log(`✅ Encontrados ${tvShows.length} TV Shows:`);
    tvShows.forEach(show => {
      console.log(`  - ${show.name} (ID: ${show.id})`);
    });
    
    if (tvShows.length > 0) {
      const firstShow = tvShows[0];
      
      // 2. Testar query com JOINs para authors
      console.log(`\n👥 2. Testando query de autores para "${firstShow.name}"...`);
      const authorsQuery = await knex('tv_show as ts')
        .leftJoin('tv_show_author as tsa', 'ts.id', 'tsa.tv_show_authors_id')
        .leftJoin('author as a', 'tsa.author_id', 'a.id')
        .select(
          'ts.id',
          'ts.name',
          knex.raw('STRING_AGG(DISTINCT a.name, \', \') as authors')
        )
        .where('ts.id', firstShow.id)
        .groupBy('ts.id', 'ts.name')
        .first();
      
      console.log(`✅ Autores encontrados: ${authorsQuery?.authors || 'Nenhum'}`);
      
      // 3. Testar query de contagem de vídeos
      console.log(`\n🎬 3. Testando contagem de vídeos para "${firstShow.name}"...`);
      const videoCount = await knex('video')
        .count('* as total')
        .where('show_id', firstShow.id)
        .whereNull('deleted')
        .first();
      
      console.log(`✅ Vídeos encontrados: ${videoCount.total}`);
      
      // 4. Testar query de vídeos com arquivos
      console.log(`\n📁 4. Testando vídeos com arquivos...`);
      const videosWithFiles = await knex('video as v')
        .leftJoin('video_file as vf', 'v.id', 'vf.video_files_id')
        .leftJoin('file as f', 'vf.file_id', 'f.id')
        .select(
          'v.id',
          'v.title',
          'v.season_number',
          'v.episode_number',
          'f.sha256hex',
          'f.extension'
        )
        .where('v.show_id', firstShow.id)
        .whereNull('v.deleted')
        .limit(5);
      
      console.log(`✅ Vídeos com arquivos encontrados: ${videosWithFiles.length}`);
      videosWithFiles.forEach(video => {
        console.log(`  - ${video.title} (S${video.season_number}E${video.episode_number})`);
        console.log(`    Arquivo: ${video.sha256hex || 'N/A'}.${video.extension || 'N/A'}`);
      });
      
      // 5. Testar query completa como no repository
      console.log(`\n🔄 5. Testando query completa do repository...`);
      const completeQuery = await knex('tv_show as ts')
        .leftJoin('tv_show_author as tsa', 'ts.id', 'tsa.tv_show_authors_id')
        .leftJoin('author as a', 'tsa.author_id', 'a.id')
        .leftJoin('file as poster_file', 'ts.poster_file_id', 'poster_file.id')
        .leftJoin('file as backdrop_file', 'ts.backdrop_file_id', 'backdrop_file.id')
        .leftJoin(
          knex('video')
            .select('show_id')
            .count('* as video_count')
            .whereNull('deleted')
            .groupBy('show_id')
            .as('video_counts'),
          'ts.id',
          'video_counts.show_id'
        )
        .select(
          'ts.id',
          'ts.name',
          'ts.producer',
          'ts.total_load',
          'ts.overview',
          'ts.popularity',
          'ts.vote_average',
          'ts.vote_count',
          'ts.first_air_date',
          knex.raw('STRING_AGG(DISTINCT a.name, \', \') as authors'),
          knex.raw('COALESCE(video_counts.video_count, 0) as video_count'),
          knex.raw(`
            CASE 
              WHEN poster_file.sha256hex IS NOT NULL AND poster_file.extension IS NOT NULL 
              THEN CONCAT('https://d26a2wm7tuz2gu.cloudfront.net/upload/', poster_file.sha256hex, 
                CASE 
                  WHEN poster_file.extension LIKE '.%' THEN LOWER(poster_file.extension)
                  ELSE CONCAT('.', LOWER(poster_file.extension))
                END
              )
              ELSE NULL 
            END as poster_image_url
          `),
          knex.raw(`
            CASE 
              WHEN backdrop_file.sha256hex IS NOT NULL AND backdrop_file.extension IS NOT NULL 
              THEN CONCAT('https://d26a2wm7tuz2gu.cloudfront.net/upload/', backdrop_file.sha256hex, 
                CASE 
                  WHEN backdrop_file.extension LIKE '.%' THEN LOWER(backdrop_file.extension)
                  ELSE CONCAT('.', LOWER(backdrop_file.extension))
                END
              )
              ELSE NULL 
            END as backdrop_image_url
          `)
        )
        .where('ts.id', firstShow.id)
        .whereNull('ts.deleted')
        .groupBy('ts.id', 'ts.name', 'ts.producer', 'ts.total_load', 'ts.overview', 'ts.popularity', 'ts.vote_average', 'ts.vote_count', 'ts.first_air_date', 'poster_file.sha256hex', 'poster_file.extension', 'backdrop_file.sha256hex', 'backdrop_file.extension', 'video_counts.video_count')
        .first();
      
      console.log(`✅ Query completa executada com sucesso!`);
      console.log(`   Nome: ${completeQuery.name}`);
      console.log(`   Autores: ${completeQuery.authors || 'Nenhum'}`);
      console.log(`   Vídeos: ${completeQuery.video_count}`);
      console.log(`   Poster: ${completeQuery.poster_image_url ? 'Presente' : 'Ausente'}`);
      console.log(`   Backdrop: ${completeQuery.backdrop_image_url ? 'Presente' : 'Ausente'}`);
    }
    
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
    console.log('Stack:', error.stack);
  }

  console.log('\n🎉 Teste concluído!');
}

// Executar teste
testTvShowsDirectly().catch(console.error); 