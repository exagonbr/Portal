// Teste simples do endpoint video-file
console.log('🚀 Testando endpoint /api/video-file');

// Verificar se conseguimos importar as dependências
try {
  const db = require('../src/config/database');
  console.log('✅ Database importado com sucesso');
  
  // Teste básico da query
  async function testQuery() {
    try {
      const result = await db.default('video')
        .select('id', 'title')
        .limit(5);
      
      console.log('✅ Query de teste executada com sucesso');
      console.log('📊 Primeiros 5 vídeos encontrados:');
      result.forEach(video => {
        console.log(`- ID: ${video.id}, Título: ${video.title}`);
      });
      
      // Testar query específica do endpoint
      if (result.length > 0) {
        const videoId = result[0].id;
        console.log(`\n🔍 Testando query completa para vídeo ID: ${videoId}`);
        
        const fileData = await db.default('video')
          .select(
            'file.sha256hex',
            'file.extension',
            'file.name as file_name',
            'video.title as video_title',
            'video.id as video_id'
          )
          .leftJoin('video_file', 'video.id', 'video_file.video_id')
          .leftJoin('file', 'video_file.file_id', 'file.id')
          .where('video.id', videoId)
          .first();
        
        if (fileData) {
          console.log('✅ Query completa executada com sucesso');
          console.log('📋 Dados encontrados:', JSON.stringify(fileData, null, 2));
          
          if (fileData.sha256hex && fileData.extension) {
            const cloudFrontUrl = `https://d26a2wm7tuz2gu.cloudfront.net/upload/${fileData.sha256hex}${fileData.extension.toLowerCase()}`;
            console.log(`🔗 URL do CloudFront: ${cloudFrontUrl}`);
          }
        } else {
          console.log('⚠️ Nenhum arquivo encontrado para este vídeo');
        }
      }
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Erro na query:', error.message);
      process.exit(1);
    }
  }
  
  testQuery();
  
} catch (error) {
  console.error('❌ Erro ao importar database:', error.message);
  process.exit(1);
} 