const axios = require('axios');

const BASE_URL = 'https://portal.sabercon.com.br/api';

async function testVideoFiles() {
  console.log('🎬 Testando busca de vídeos com arquivos...\n');

  try {
    // 1. Listar todos os TV Shows
    console.log('📋 1. Listando TV Shows disponíveis...');
    const showsResponse = await axios.get(`${BASE_URL}/tv-shows`);
    console.log(`✅ Status: ${showsResponse.status}`);
    
    const shows = showsResponse.data?.data?.tvShows || [];
    console.log(`📊 Encontrados ${shows.length} TV Shows`);
    
    if (shows.length > 0) {
      const firstShow = shows[0];
      console.log(`🎯 Testando com TV Show: "${firstShow.name}" (ID: ${firstShow.id})`);
      
      // 2. Buscar módulos/vídeos do primeiro show
      console.log(`\n📂 2. Buscando módulos do TV Show ${firstShow.id}...`);
      const modulesResponse = await axios.get(`${BASE_URL}/tv-shows/${firstShow.id}/modules`);
      console.log(`✅ Status: ${modulesResponse.status}`);
      
      const modules = modulesResponse.data?.data || {};
      console.log(`📊 Encontrados ${Object.keys(modules).length} módulos`);
      
      // 3. Analisar os vídeos encontrados
      let totalVideos = 0;
      let videosWithUrls = 0;
      
      Object.entries(modules).forEach(([moduleKey, videos]) => {
        console.log(`\n📂 Módulo: ${moduleKey}`);
        console.log(`   📹 Vídeos: ${videos.length}`);
        
        videos.forEach((video, index) => {
          totalVideos++;
          if (video.video_url) {
            videosWithUrls++;
          }
          
          console.log(`   🎥 ${index + 1}. ${video.title}`);
          console.log(`      📍 ID: ${video.id}`);
          console.log(`      🔗 URL: ${video.video_url || 'SEM URL'}`);
          console.log(`      📄 Arquivo: ${video.file_sha256hex || 'N/A'}.${video.file_extension || 'N/A'}`);
          console.log(`      📏 Tamanho: ${video.file_size ? (video.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}`);
          console.log(`      🎭 Tipo: ${video.file_mimetype || 'N/A'}`);
          console.log('');
        });
      });
      
      console.log(`\n📊 Resumo:`);
      console.log(`   📹 Total de vídeos: ${totalVideos}`);
      console.log(`   🔗 Vídeos com URL: ${videosWithUrls}`);
      console.log(`   ❌ Vídeos sem URL: ${totalVideos - videosWithUrls}`);
      
      // 4. Testar busca de vídeos individuais
      console.log(`\n📋 3. Testando busca de vídeos individuais...`);
      const videosResponse = await axios.get(`${BASE_URL}/tv-shows/${firstShow.id}/videos`);
      console.log(`✅ Status: ${videosResponse.status}`);
      
      const individualVideos = videosResponse.data?.data || [];
      console.log(`📊 Encontrados ${individualVideos.length} vídeos individuais`);
      
    } else {
      console.log('❌ Nenhum TV Show encontrado para testar');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }

  console.log('\n🎉 Teste de vídeos com arquivos concluído!');
}

testVideoFiles(); 