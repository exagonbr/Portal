const knex = require('knex');

const db = knex({
  client: 'postgresql',
  connection: {
    host: 'localhost',
    port: 5432,
    database: 'portal_sabercon',
    user: 'postgres',
    password: 'root',
    ssl: false,
  }
});

async function investigateData() {
  console.log('🔍 Investigando dados no banco...\n');

  try {
    // 1. Verificar se a tabela tv_show existe
    console.log('📋 1. Verificando se a tabela tv_show existe...');
    const tableExists = await db.schema.hasTable('tv_show');
    console.log(`Tabela tv_show existe: ${tableExists}`);
    
    if (tableExists) {
      // 2. Verificar estrutura da tabela tv_show
      console.log('\n📊 2. Estrutura da tabela tv_show:');
      const columns = await db('information_schema.columns')
        .select('column_name', 'data_type', 'is_nullable')
        .where('table_name', 'tv_show')
        .orderBy('ordinal_position');
      
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
      });
      
      // 3. Contar total de registros na tabela tv_show
      console.log('\n📈 3. Contando registros na tabela tv_show...');
      const totalCount = await db('tv_show').count('* as total').first();
      console.log(`Total de registros: ${totalCount.total}`);
      
      // 4. Verificar registros com deleted = null
      const nullDeletedCount = await db('tv_show').where('deleted', false).count('* as total').first();
      console.log(`Registros com deleted = null: ${nullDeletedCount.total}`);
      
      // 5. Verificar registros com deleted = false
      const falseDeletedCount = await db('tv_show').where('deleted', false).count('* as total').first();
      console.log(`Registros com deleted = false: ${falseDeletedCount.total}`);
      
      // 6. Verificar registros com deleted = true
      const trueDeletedCount = await db('tv_show').where('deleted', true).count('* as total').first();
      console.log(`Registros com deleted = true: ${trueDeletedCount.total}`);
      
      // 7. Listar alguns registros sem filtro
      console.log('\n📋 4. Primeiros registros da tabela tv_show (sem filtro):');
      const allRecords = await db('tv_show')
        .select('id', 'name', 'deleted')
        .limit(5);
      
      allRecords.forEach(record => {
        console.log(`  - ID: ${record.id}, Nome: ${record.name}, Deleted: ${record.deleted}`);
      });
      
      // 8. Se há registros, verificar vídeos para o primeiro
      if (allRecords.length > 0) {
        const firstShow = allRecords[0];
        console.log(`\n🎬 5. Verificando vídeos para "${firstShow.name}" (ID: ${firstShow.id})...`);
        
        // Verificar se a tabela video existe
        const videoTableExists = await db.schema.hasTable('video');
        console.log(`Tabela video existe: ${videoTableExists}`);
        
        if (videoTableExists) {
          const videoCount = await db('video').where('show_id', firstShow.id).count('* as total').first();
          console.log(`Total de vídeos: ${videoCount.total}`);
          
          const videos = await db('video')
            .select('id', 'title', 'name', 'season_number', 'episode_number', 'deleted')
            .where('show_id', firstShow.id)
            .limit(5);
          
          console.log(`Primeiros vídeos:`);
          videos.forEach(video => {
            console.log(`  - ${video.title || video.name} (S${video.season_number}E${video.episode_number}) - Deleted: ${video.deleted}`);
          });
          
          // 9. Verificar tabela video_file
          console.log('\n📁 6. Verificando tabela video_file...');
          const videoFileTableExists = await db.schema.hasTable('video_file');
          console.log(`Tabela video_file existe: ${videoFileTableExists}`);
          
          if (videoFileTableExists) {
            const videoFileCount = await db('video_file').count('* as total').first();
            console.log(`Total de registros em video_file: ${videoFileCount.total}`);
            
            const videoFiles = await db('video_file')
              .select('id', 'video_files_id', 'file_id')
              .limit(5);
            
            console.log(`Primeiros registros em video_file:`);
            videoFiles.forEach(vf => {
              console.log(`  - ID: ${vf.id}, video_files_id: ${vf.video_files_id}, file_id: ${vf.file_id}`);
            });
          }
          
          // 10. Verificar tabela file
          console.log('\n📄 7. Verificando tabela file...');
          const fileTableExists = await db.schema.hasTable('file');
          console.log(`Tabela file existe: ${fileTableExists}`);
          
          if (fileTableExists) {
            const fileCount = await db('file').count('* as total').first();
            console.log(`Total de registros em file: ${fileCount.total}`);
            
            const files = await db('file')
              .select('id', 'name', 'sha256hex', 'extension', 'size')
              .limit(5);
            
            console.log(`Primeiros arquivos:`);
            files.forEach(file => {
              console.log(`  - ID: ${file.id}, Nome: ${file.name || 'sem nome'}, Hash: ${file.sha256hex}, Ext: ${file.extension}`);
            });
          }
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Erro na investigação:', error.message);
    console.log('Stack:', error.stack);
  } finally {
    await db.destroy();
  }

  console.log('\n🎉 Investigação concluída!');
}

investigateData().catch(console.error); 