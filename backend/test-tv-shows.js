const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testTvShows() {
  console.log('🚀 Testando implementação dos TV Shows...\n');

  try {
    // 1. Testar listagem de TV Shows
    console.log('📋 1. Testando listagem de TV Shows...');
    const response = await fetch(`${BASE_URL}/tv-shows?page=1&limit=5`);
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Listagem funcionando!');
      console.log(`📊 Encontrados: ${data.data?.tvShows?.length || 0} TV Shows`);
      
      if (data.data?.tvShows?.length > 0) {
        const firstShow = data.data.tvShows[0];
        console.log(`🎯 Primeiro TV Show: "${firstShow.name}" (ID: ${firstShow.id})`);
        console.log(`📸 Poster: ${firstShow.poster_image_url ? 'Presente' : 'Ausente'}`);
        console.log(`🎬 Backdrop: ${firstShow.backdrop_image_url ? 'Presente' : 'Ausente'}`);
        console.log(`📹 Vídeos: ${firstShow.video_count || 0}`);
        console.log(`✍️ Autores: ${firstShow.authors || 'Não informado'}`);
        
        // 2. Testar busca por ID
        console.log(`\n🔍 2. Testando busca por ID (${firstShow.id})...`);
        const detailResponse = await fetch(`${BASE_URL}/tv-shows/${firstShow.id}`);
        
        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          console.log('✅ Busca por ID funcionando!');
          console.log(`📝 Módulos incluídos: ${detailData.data?.modules ? Object.keys(detailData.data.modules).length : 0}`);
        } else {
          console.log('❌ Erro na busca por ID:', detailResponse.status);
        }
        
        // 3. Testar endpoint de módulos
        console.log(`\n📂 3. Testando endpoint de módulos...`);
        const modulesResponse = await fetch(`${BASE_URL}/tv-shows/${firstShow.id}/modules`);
        
        if (modulesResponse.ok) {
          const modulesData = await modulesResponse.json();
          console.log('✅ Endpoint de módulos funcionando!');
          console.log(`📊 Módulos encontrados: ${Object.keys(modulesData.data || {}).length}`);
        } else {
          console.log('❌ Erro no endpoint de módulos:', modulesResponse.status);
        }
        
        // 4. Testar endpoint de vídeos
        console.log(`\n🎬 4. Testando endpoint de vídeos...`);
        const videosResponse = await fetch(`${BASE_URL}/tv-shows/${firstShow.id}/videos`);
        
        if (videosResponse.ok) {
          const videosData = await videosResponse.json();
          console.log('✅ Endpoint de vídeos funcionando!');
          console.log(`📊 Vídeos encontrados: ${videosData.data?.length || 0}`);
        } else {
          console.log('❌ Erro no endpoint de vídeos:', videosResponse.status);
        }
        
        // 5. Testar endpoint de estatísticas
        console.log(`\n📊 5. Testando endpoint de estatísticas...`);
        const statsResponse = await fetch(`${BASE_URL}/tv-shows/${firstShow.id}/stats`);
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('✅ Endpoint de estatísticas funcionando!');
          console.log(`📈 Estatísticas:`, statsData.data);
        } else {
          console.log('❌ Erro no endpoint de estatísticas:', statsResponse.status);
        }
      }
    } else {
      console.log('❌ Erro na listagem:', response.status);
    }
    
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  }

  console.log('\n🎉 Teste concluído!');
}

// Executar teste
testTvShows().catch(console.error); 